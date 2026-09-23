import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../utils/supabaseClient.js';
import { contentModeration } from '../utils/contentModeration.js';
import {
  AGE_FILTERS,
  MESSAGE_MAX_LENGTH,
  applyChatCookie,
  isUuid,
  publicConversation,
  resolveChatOwner,
  sanitizeConversationUpdates
} from '../utils/chatAccess.js';

let chatDb = supabase;
let anthropicClient = null;

export function setChatDbForTests(db) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Refusing to replace the chat database outside tests');
  }
  chatDb = db;
}

function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const error = new Error('ANTHROPIC_API_KEY is not set');
    error.status = 503;
    throw error;
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function bindOwner(req, res) {
  const owner = resolveChatOwner(req);
  if (owner.error) {
    res.status(owner.status).json({ error: owner.error });
    return null;
  }
  applyChatCookie(res, owner.setCookie);
  return owner.ownerId;
}

function publicError(res, status, error) {
  res.status(status).json({ error });
}

async function findOwnedConversation(ownerId, id) {
  const { data, error } = await chatDb
    .from('chat_conversations')
    .select('id, session_id, title, folder, is_pinned, created_at, updated_at, last_message_at')
    .eq('id', id)
    .eq('session_id', ownerId)
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
}

export const createConversation = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;

    const requestedTitle = typeof req.body?.title === 'string' ? req.body.title : 'New Chat';
    const requestedFolder = typeof req.body?.folder === 'string' ? req.body.folder : 'general';
    const sanitized = sanitizeConversationUpdates({
      title: requestedTitle,
      folder: requestedFolder
    });
    if (sanitized.error) {
      return publicError(res, 400, sanitized.error);
    }

    const { data, error } = await chatDb
      .from('chat_conversations')
      .insert([
        {
          session_id: ownerId,
          title: sanitized.updates.title,
          folder: sanitized.updates.folder,
          is_pinned: false
        }
      ])
      .select();

    if (error) throw error;
    const created = data?.[0];
    if (!created) throw new Error('Insert returned no conversation');

    res.status(201).json(publicConversation(created));
  } catch (error) {
    console.error('Error creating conversation:', error);
    publicError(res, 500, 'Failed to create conversation');
  }
};

export const getConversations = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;

    const { data, error } = await chatDb
      .from('chat_conversations')
      .select('*')
      .eq('session_id', ownerId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(publicConversation));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    publicError(res, 500, 'Failed to fetch conversations');
  }
};

export const getMessages = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;
    if (!isUuid(req.params.id)) return publicError(res, 400, 'Invalid conversation id');

    const conversation = await findOwnedConversation(ownerId, req.params.id);
    if (!conversation) return publicError(res, 404, 'Conversation not found');

    const { data, error } = await chatDb
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching messages:', error);
    publicError(res, 500, 'Failed to fetch messages');
  }
};

export const sendMessage = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;

    const conversationId = req.params.id;
    if (!isUuid(conversationId)) return publicError(res, 400, 'Invalid conversation id');

    const conversation = await findOwnedConversation(ownerId, conversationId);
    if (!conversation) return publicError(res, 404, 'Conversation not found');

    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content) return publicError(res, 400, 'Message content is required');
    if (content.length > MESSAGE_MAX_LENGTH) return publicError(res, 400, 'Message is too long');

    const ageFilter = AGE_FILTERS.has(req.body?.ageFilter) ? req.body.ageFilter : 'teen';
    const isRegeneration = req.body?.isRegeneration === true;

    const moderationResult = contentModeration.shouldBlock(content, ageFilter);
    if (moderationResult.blocked) {
      return res.status(400).json({
        error: 'Content blocked',
        reason: moderationResult.reason,
        message: moderationResult.message
      });
    }

    const flags = contentModeration.checkFlagged(content);

    const { data: userRows, error: userMsgError } = await chatDb
      .from('chat_messages')
      .insert([
        {
          conversation_id: conversation.id,
          role: 'user',
          content,
          was_flagged: flags.length > 0,
          moderation_reason: flags.join(', ') || null
        }
      ])
      .select();

    if (userMsgError) throw userMsgError;
    if (!userRows?.[0]) throw new Error('Insert returned no user message');

    const { data: history, error: historyError } = await chatDb
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (historyError) throw historyError;

    const messages = (history || []).reverse().map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    let systemPrompt = contentModeration.getSystemPrompt(ageFilter);
    if (isRegeneration) {
      systemPrompt += '\n\nNote: The user was not satisfied with the previous response and requested a regeneration. Please provide a different, improved answer with a fresh perspective and approach.';
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    let tokenCount = 0;

    const stream = await getAnthropic().messages.stream({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt,
      messages
    });

    stream.on('text', (text) => {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ type: 'content', text })}\n\n`);
    });

    stream.on('message', (message) => {
      tokenCount = message.usage?.output_tokens || 0;
    });

    stream.on('end', async () => {
      const { data: assistantRows, error: assistantMsgError } = await chatDb
        .from('chat_messages')
        .insert([
          {
            conversation_id: conversation.id,
            role: 'assistant',
            content: fullResponse,
            tokens_used: tokenCount
          }
        ])
        .select();

      if (assistantMsgError) {
        console.error('Error saving assistant message:', assistantMsgError);
      }

      if (messages.length <= 2) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await chatDb
          .from('chat_conversations')
          .update({ title })
          .eq('id', conversation.id)
          .eq('session_id', ownerId);
      }

      res.write(`data: ${JSON.stringify({
        type: 'done',
        messageId: assistantRows?.[0]?.id,
        tokens: tokenCount
      })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Streaming failed' })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error('Error sending message:', error);
    if (!res.headersSent) {
      const status = error.status === 503 ? 503 : 500;
      publicError(res, status, status === 503 ? 'Chat is not configured' : 'Failed to send message');
    }
  }
};

export const updateConversation = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;
    if (!isUuid(req.params.id)) return publicError(res, 400, 'Invalid conversation id');

    const sanitized = sanitizeConversationUpdates(req.body);
    if (sanitized.error) return publicError(res, 400, sanitized.error);

    const { data, error } = await chatDb
      .from('chat_conversations')
      .update(sanitized.updates)
      .eq('id', req.params.id)
      .eq('session_id', ownerId)
      .select('id, session_id, title, folder, is_pinned, created_at, updated_at, last_message_at');

    if (error) throw error;
    const updated = data?.[0];
    if (!updated) return publicError(res, 404, 'Conversation not found');

    res.json(publicConversation(updated));
  } catch (error) {
    console.error('Error updating conversation:', error);
    publicError(res, 500, 'Failed to update conversation');
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;
    if (!isUuid(req.params.id)) return publicError(res, 400, 'Invalid conversation id');

    const { data, error } = await chatDb
      .from('chat_conversations')
      .delete()
      .eq('id', req.params.id)
      .eq('session_id', ownerId)
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) return publicError(res, 404, 'Conversation not found');

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    publicError(res, 500, 'Failed to delete conversation');
  }
};

export const searchMessages = async (req, res) => {
  try {
    const ownerId = bindOwner(req, res);
    if (!ownerId) return;

    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (!query) return publicError(res, 400, 'Search query is required');
    if (query.length > 200) return publicError(res, 400, 'Search query is too long');

    const { data: conversations, error: convError } = await chatDb
      .from('chat_conversations')
      .select('id')
      .eq('session_id', ownerId);

    if (convError) throw convError;

    const conversationIds = (conversations || []).map((conversation) => conversation.id);
    if (conversationIds.length === 0) return res.json([]);

    const { data, error } = await chatDb
      .from('chat_messages')
      .select('*, conversation:chat_conversations(title)')
      .in('conversation_id', conversationIds)
      .textSearch('content', query)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error searching messages:', error);
    publicError(res, 500, 'Failed to search messages');
  }
};
