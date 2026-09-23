import crypto from 'crypto';
import { extractTokenFromHeader, verifyToken } from './jwt.js';

export const CHAT_COOKIE = 'inspir_chat_sid';

const COOKIE_RE = /^[a-f0-9]{64}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PARENT_ACCOUNT_TYPES = new Set(['parent', 'school', 'organization', 'company']);

export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function readChatCookie(cookieHeader) {
  if (typeof cookieHeader !== 'string' || cookieHeader.length > 8192) return null;

  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (name === CHAT_COOKIE && COOKIE_RE.test(value)) return value;
  }

  return null;
}

export function buildChatCookie(value, secure) {
  const parts = [
    `${CHAT_COOKIE}=${value}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=31536000'
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function ownerFromDecoded(decoded) {
  if (!decoded || typeof decoded !== 'object') return null;

  if (decoded.account_type === 'student' && isUuid(decoded.student_id)) {
    return `student:${decoded.student_id}`;
  }

  if (decoded.parent_id && PARENT_ACCOUNT_TYPES.has(decoded.account_type) && isUuid(decoded.parent_id)) {
    return `parent:${decoded.parent_id}`;
  }

  return null;
}

/**
 * Chat owner is an account id when a valid bearer token is present.
 * Otherwise it is an HttpOnly random cookie. IP and User-Agent are not used:
 * trust-proxy makes X-Forwarded-For spoofable.
 */
export function resolveChatOwner(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader) {
    const token = extractTokenFromHeader(authHeader);
    const decoded = token ? verifyToken(token) : null;
    const ownerId = ownerFromDecoded(decoded);
    if (!ownerId) {
      return { error: 'Invalid token', status: 401 };
    }
    return { ownerId, setCookie: null };
  }

  const existing = readChatCookie(req.headers.cookie);
  if (existing) {
    return { ownerId: `anon:${existing}`, setCookie: null };
  }

  const created = crypto.randomBytes(32).toString('hex');
  const secure = process.env.NODE_ENV === 'production';
  return {
    ownerId: `anon:${created}`,
    setCookie: buildChatCookie(created, secure)
  };
}

export function applyChatCookie(res, setCookie) {
  if (setCookie) res.append('Set-Cookie', setCookie);
}

export function sanitizeConversationUpdates(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Invalid update' };
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    if (typeof body.title !== 'string') return { error: 'Title must be text' };
    const title = body.title.replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!title || title.length > 255) return { error: 'Title must be 1-255 characters' };
    updates.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'folder')) {
    if (typeof body.folder !== 'string') return { error: 'Folder must be text' };
    const folder = body.folder.replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!folder || folder.length > 100) return { error: 'Folder must be 1-100 characters' };
    updates.folder = folder;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'is_pinned')) {
    if (typeof body.is_pinned !== 'boolean') return { error: 'is_pinned must be true or false' };
    updates.is_pinned = body.is_pinned;
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No allowed fields to update' };
  }

  return { updates };
}

export function publicConversation(row) {
  if (!row || typeof row !== 'object') return row;
  const { session_id, ...rest } = row;
  return rest;
}

export const MESSAGE_MAX_LENGTH = 20000;
export const AGE_FILTERS = new Set(['under14', 'teen', 'adult']);
