// ============================================================================
// MEMORY SERVICE
// ============================================================================
// Manages student memory system: facts, summaries, session tracking
// Based on ChatGPT's 4-layer memory architecture
// ============================================================================

import { supabase } from '../utils/supabaseClient.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ============================================================================
// 1. GET MEMORY CONTEXT FOR STUDENT
// ============================================================================

/**
 * Get all memory components for a student
 * Returns: sessionMetadata, memoryFacts, recentSummaries, analytics
 */
export async function getStudentMemoryContext(studentId, sessionToken) {
  try {
    const [sessionMetadata, memoryFacts, recentSummaries, analytics] =
      await Promise.all([
        getSessionMetadata(studentId, sessionToken),
        getMemoryFacts(studentId),
        getRecentConversationSummaries(studentId),
        getStudentAnalytics(studentId)
      ]);

    return {
      sessionMetadata,
      memoryFacts,
      recentSummaries,
      analytics
    };
  } catch (error) {
    console.error('Error getting student memory context:', error);
    return {
      sessionMetadata: null,
      memoryFacts: [],
      recentSummaries: [],
      analytics: null
    };
  }
}

// ============================================================================
// 2. GET SESSION METADATA
// ============================================================================

async function getSessionMetadata(studentId, sessionToken) {
  if (!sessionToken) return null;

  const { data, error } = await supabase
    .from('student_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('student_id', studentId)
    .is('ended_at', null)
    .single();

  if (error) {
    console.error('Error fetching session metadata:', error);
    return null;
  }

  return data;
}

// ============================================================================
// 3. GET MEMORY FACTS
// ============================================================================

async function getMemoryFacts(studentId) {
  const { data, error } = await supabase
    .from('student_memory')
    .select('*')
    .eq('student_id', studentId)
    .eq('is_active', true)
    .order('confidence_score', { ascending: false })
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .limit(50); // Top 50 most relevant facts

  if (error) {
    console.error('Error fetching memory facts:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// 4. GET RECENT CONVERSATION SUMMARIES
// ============================================================================

async function getRecentConversationSummaries(studentId, limit = 10) {
  const { data, error } = await supabase
    .from('conversation_summaries')
    .select('*')
    .eq('student_id', studentId)
    .order('conversation_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversation summaries:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// 5. GET STUDENT ANALYTICS
// ============================================================================

async function getStudentAnalytics(studentId) {
  const { data, error } = await supabase
    .from('student_analytics')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (error) {
    console.error('Error fetching student analytics:', error);
    return null;
  }

  return data;
}

// ============================================================================
// 6. FORMAT MEMORY FOR PROMPT
// ============================================================================

export function formatMemoryForPrompt(memoryContext, studentData) {
  const { sessionMetadata, memoryFacts, recentSummaries, analytics } =
    memoryContext;

  let memoryPrompt = '';

  // Student Identity - ALWAYS address by name
  if (studentData) {
    memoryPrompt += `\n[Student Identity]\n`;
    if (studentData.display_name) {
      // Extract first name from display_name for more personal greeting
      const firstName = studentData.display_name.split(' ')[0];
      memoryPrompt += `- Student's name: ${firstName}\n`;
      memoryPrompt += `- IMPORTANT: Always greet and address this student as "${firstName}" in your very first response to build rapport and personalize the learning experience.\n`;
    }
    if (studentData.study_level) {
      memoryPrompt += `- Study level: ${studentData.study_level}\n`;
    }
    if (studentData.age_group) {
      memoryPrompt += `- Age group: ${studentData.age_group}\n`;
    }
  }

  // Session Context
  if (sessionMetadata) {
    const sessionDuration = Math.floor(
      (Date.now() - new Date(sessionMetadata.started_at).getTime()) / 1000 / 60
    );
    memoryPrompt += `\n[Session Context]\n`;
    memoryPrompt += `- Device: ${sessionMetadata.device_type || 'unknown'}\n`;
    memoryPrompt += `- Time: ${sessionMetadata.time_of_day || 'unknown'} on ${sessionMetadata.day_of_week || 'unknown'}\n`;
    memoryPrompt += `- Session duration: ${sessionDuration} minutes\n`;
    memoryPrompt += `- Messages sent: ${sessionMetadata.messages_sent || 0}\n`;
  }

  // Student Profile (Memory Facts)
  if (memoryFacts && memoryFacts.length > 0) {
    memoryPrompt += `\n[What I Know About This Student]\n`;

    // Group by type
    const grouped = {
      interest: [],
      goal: [],
      preference: [],
      strength: [],
      challenge: [],
      learning_style: [],
      other: []
    };

    memoryFacts.forEach((fact) => {
      const type = fact.fact_type || 'other';
      if (grouped[type]) {
        grouped[type].push(fact.fact_text);
      } else {
        grouped.other.push(fact.fact_text);
      }
    });

    if (grouped.interest.length > 0) {
      memoryPrompt += `\nInterests:\n${grouped.interest.map((f) => `- ${f}`).join('\n')}\n`;
    }
    if (grouped.goal.length > 0) {
      memoryPrompt += `\nGoals:\n${grouped.goal.map((f) => `- ${f}`).join('\n')}\n`;
    }
    if (grouped.preference.length > 0) {
      memoryPrompt += `\nPreferences:\n${grouped.preference.map((f) => `- ${f}`).join('\n')}\n`;
    }
    if (grouped.learning_style.length > 0) {
      memoryPrompt += `\nLearning Style:\n${grouped.learning_style.map((f) => `- ${f}`).join('\n')}\n`;
    }
    if (grouped.strength.length > 0) {
      memoryPrompt += `\nStrengths:\n${grouped.strength.map((f) => `- ${f}`).join('\n')}\n`;
    }
    if (grouped.challenge.length > 0) {
      memoryPrompt += `\nChallenges:\n${grouped.challenge.map((f) => `- ${f}`).join('\n')}\n`;
    }
    if (grouped.other.length > 0) {
      memoryPrompt += `\nOther:\n${grouped.other.map((f) => `- ${f}`).join('\n')}\n`;
    }
  }

  // Usage Patterns
  if (analytics) {
    memoryPrompt += `\n[Usage Patterns]\n`;
    memoryPrompt += `- Active ${analytics.active_days_last_7 || 0} days in last week\n`;
    if (analytics.preferred_subjects && analytics.preferred_subjects.length > 0) {
      memoryPrompt += `- Preferred subjects: ${analytics.preferred_subjects.join(', ')}\n`;
    }
    if (analytics.most_used_tools && analytics.most_used_tools.length > 0) {
      memoryPrompt += `- Most used tools: ${analytics.most_used_tools.join(', ')}\n`;
    }
    if (analytics.avg_messages_per_session) {
      memoryPrompt += `- Average session: ${Math.round(analytics.avg_messages_per_session)} messages\n`;
    }
    if (analytics.peak_usage_times && analytics.peak_usage_times.length > 0) {
      memoryPrompt += `- Peak usage times: ${analytics.peak_usage_times.join(', ')}\n`;
    }
  }

  // Recent Topics
  if (recentSummaries && recentSummaries.length > 0) {
    memoryPrompt += `\n[Recent Conversations]\n`;
    recentSummaries.slice(0, 5).forEach((summary) => {
      const date = new Date(summary.conversation_date).toLocaleDateString();
      memoryPrompt += `\n${summary.conversation_title || 'Untitled'} (${date})\n`;
      if (summary.topics_discussed && summary.topics_discussed.length > 0) {
        memoryPrompt += `Topics: ${summary.topics_discussed.join(', ')}\n`;
      }
    });
  }

  // Age group
  if (studentData && studentData.age_group) {
    memoryPrompt += `\n[Age Group]\n`;
    memoryPrompt += `- ${studentData.age_group}\n`;
  }

  if (memoryPrompt) {
    memoryPrompt += `\nBased on this context, provide helpful, age-appropriate responses that build on the student's interests, learning patterns, and previous conversations. Reference specific details when relevant to show personalized understanding.\n`;
  }

  return memoryPrompt;
}

// ============================================================================
// 7. EXTRACT AND STORE MEMORY FACTS
// ============================================================================

export async function extractAndStoreMemoryFacts(
  studentId,
  conversationId,
  userMessage,
  assistantResponse
) {
  try {
    // Use Claude to extract memory-worthy facts
    const extractionPrompt = `Analyze this conversation and extract memory-worthy facts about the student.

User said: "${userMessage}"
Assistant said: "${assistantResponse}"

Extract facts in these categories:
1. interest - Things the student enjoys or is curious about
2. goal - Academic or learning objectives
3. preference - How they like to learn or work
4. learning_style - Visual, auditory, kinesthetic preferences
5. strength - What they're good at
6. challenge - What they struggle with

Return ONLY a JSON array of facts. Each fact must be:
- Explicit or clearly implied from the conversation
- Likely to remain true over time
- Useful for personalizing future learning
- Clear and concise (one sentence)

Format:
[
  { "type": "interest", "fact": "loves astronomy and space exploration" },
  { "type": "goal", "fact": "wants to improve algebra grades" }
]

If no memory-worthy facts are found, return an empty array: []

IMPORTANT: Return ONLY valid JSON, nothing else.`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: extractionPrompt
        }
      ]
    });

    const responseText = message.content[0].text.trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonText = codeMatch[1];
      }
    }

    const facts = JSON.parse(jsonText);

    if (!Array.isArray(facts) || facts.length === 0) {
      return [];
    }

    // Filter out unsafe facts (no personal info)
    const safeFacts = facts.filter((fact) => isMemorySafe(fact.fact));

    // Store facts in database
    const memoryRecords = safeFacts.map((fact) => ({
      student_id: studentId,
      fact_type: fact.type,
      fact_text: fact.fact,
      learned_from_conversation_id: conversationId,
      added_by: 'auto',
      confidence_score: 0.8 // Auto-extracted facts start with 0.8 confidence
    }));

    if (memoryRecords.length > 0) {
      const { data, error } = await supabase
        .from('student_memory')
        .insert(memoryRecords)
        .select();

      if (error) {
        console.error('Error storing memory facts:', error);
        return [];
      }

      console.log(`✅ Stored ${data.length} new memory facts for student ${studentId}`);
      return data;
    }

    return [];
  } catch (error) {
    console.error('Error extracting memory facts:', error);
    return [];
  }
}

// ============================================================================
// 8. CHECK IF MEMORY IS SAFE
// ============================================================================

const FORBIDDEN_MEMORY_PATTERNS = [
  /password/i,
  /email/i,
  /phone/i,
  /address/i,
  /credit card/i,
  /social security/i,
  /ssn/i,
  /\d{3}-\d{2}-\d{4}/,  // SSN pattern
  /\d{16}/,             // Credit card pattern
  /\b\d{10,}\b/,        // Long number sequences
  /@/,                  // Email pattern
];

function isMemorySafe(fact) {
  return !FORBIDDEN_MEMORY_PATTERNS.some((pattern) => pattern.test(fact));
}

// ============================================================================
// 9. UPDATE SESSION METADATA
// ============================================================================

export async function updateSessionMetadata(sessionToken, updates) {
  try {
    const { error } = await supabase
      .from('student_sessions')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString()
      })
      .eq('session_token', sessionToken);

    if (error) {
      console.error('Error updating session metadata:', error);
    }
  } catch (error) {
    console.error('Error in updateSessionMetadata:', error);
  }
}

// ============================================================================
// 10. INCREMENT SESSION MESSAGES
// ============================================================================

export async function incrementSessionMessages(sessionToken) {
  try {
    const { data, error } = await supabase
      .from('student_sessions')
      .select('messages_sent')
      .eq('session_token', sessionToken)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      return;
    }

    await supabase
      .from('student_sessions')
      .update({
        messages_sent: (data.messages_sent || 0) + 1,
        last_activity_at: new Date().toISOString()
      })
      .eq('session_token', sessionToken);
  } catch (error) {
    console.error('Error incrementing session messages:', error);
  }
}

// ============================================================================
// 11. MARK MEMORY FACTS AS USED
// ============================================================================

export async function markMemoryFactsAsUsed(memoryFacts) {
  if (!memoryFacts || memoryFacts.length === 0) return;

  try {
    const factIds = memoryFacts.map((f) => f.id);

    await supabase
      .from('student_memory')
      .update({
        last_used_at: new Date().toISOString(),
        use_count: supabase.raw('use_count + 1')
      })
      .in('id', factIds);
  } catch (error) {
    console.error('Error marking memory facts as used:', error);
  }
}

// ============================================================================
// 12. GENERATE CONVERSATION SUMMARY
// ============================================================================

export async function generateConversationSummary(studentId, conversationId) {
  try {
    // Get all messages from this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError || !messages || messages.length === 0) {
      console.error('Error fetching messages for summary:', messagesError);
      return null;
    }

    // Build conversation text
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.content.substring(0, 500)}`)
      .join('\n\n');

    // Use Claude to generate summary
    const summaryPrompt = `Summarize this learning conversation between a student and an AI tutor.

${conversationText}

Provide:
1. A brief title (5-10 words) that captures the main topic
2. Topics discussed (3-5 keywords, comma-separated)
3. 3-5 key student message snippets (the most important things the student said)

Format as JSON:
{
  "title": "...",
  "topics": ["topic1", "topic2", "topic3"],
  "snippets": ["snippet1", "snippet2", "snippet3"]
}

IMPORTANT: Return ONLY valid JSON, nothing else.`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: summaryPrompt
        }
      ]
    });

    const responseText = message.content[0].text.trim();

    // Extract JSON
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const summary = JSON.parse(jsonText);

    // Store summary
    const { data, error } = await supabase
      .from('conversation_summaries')
      .insert({
        student_id: studentId,
        conversation_id: conversationId,
        conversation_title: summary.title,
        topics_discussed: summary.topics,
        student_message_snippets: summary.snippets,
        message_count: messages.length,
        conversation_date: messages[0].created_at,
        last_message_at: messages[messages.length - 1].created_at
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing conversation summary:', error);
      return null;
    }

    console.log(`✅ Generated summary for conversation ${conversationId}`);
    return data;
  } catch (error) {
    console.error('Error generating conversation summary:', error);
    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getStudentMemoryContext,
  formatMemoryForPrompt,
  extractAndStoreMemoryFacts,
  updateSessionMetadata,
  incrementSessionMessages,
  markMemoryFactsAsUsed,
  generateConversationSummary
};
