import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-not-a-real-key';
process.env.JWT_SECRET = 'test-jwt-secret-with-enough-length-32';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.ANTHROPIC_API_KEY = '';

const { default: app } = await import('../server.js');
const { setChatDbForTests } = await import('../controllers/chatController.js');
const { generateStudentToken } = await import('../utils/jwt.js');
const { CHAT_COOKIE } = await import('../utils/chatAccess.js');

function createMemorySupabase() {
  const tables = {
    chat_conversations: [],
    chat_messages: []
  };

  function from(table) {
    const state = {
      op: 'select',
      payload: null,
      filters: [],
      sort: null,
      limitN: null,
      search: null,
      insert(values) {
        this.op = 'insert';
        this.payload = values;
        return this;
      },
      update(values) {
        this.op = 'update';
        this.payload = values;
        return this;
      },
      delete() {
        this.op = 'delete';
        return this;
      },
      select() {
        return this;
      },
      eq(column, value) {
        this.filters.push({ type: 'eq', column, value });
        return this;
      },
      in(column, value) {
        this.filters.push({ type: 'in', column, value });
        return this;
      },
      order(column, options = {}) {
        this.sort = { column, ascending: options.ascending !== false };
        return this;
      },
      limit(n) {
        this.limitN = n;
        return this;
      },
      textSearch(column, query) {
        this.search = { column, query };
        return this;
      },
      then(resolve, reject) {
        try {
          resolve(this.exec());
        } catch (error) {
          reject(error);
        }
      },
      exec() {
        const match = (row) => this.filters.every((filter) => {
          if (filter.type === 'eq') return row[filter.column] === filter.value;
          if (filter.type === 'in') return filter.value.includes(row[filter.column]);
          return false;
        });

        if (this.op === 'insert') {
          const created = this.payload.map((row) => ({
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_pinned: false,
            ...row
          }));
          tables[table].push(...created);
          return { data: created, error: null };
        }

        if (this.op === 'update') {
          const updated = [];
          for (const row of tables[table]) {
            if (!match(row)) continue;
            Object.assign(row, this.payload, { updated_at: new Date().toISOString() });
            updated.push({ ...row });
          }
          return { data: updated, error: null };
        }

        if (this.op === 'delete') {
          const kept = [];
          const removed = [];
          for (const row of tables[table]) {
            if (match(row)) removed.push({ ...row });
            else kept.push(row);
          }
          tables[table] = kept;
          return { data: removed, error: null };
        }

        let data = tables[table].filter(match).map((row) => ({ ...row }));
        if (this.search) {
          const query = String(this.search.query).toLowerCase();
          data = data.filter((row) => String(row[this.search.column] || '').toLowerCase().includes(query));
        }
        if (this.sort) {
          const { column, ascending } = this.sort;
          data.sort((a, b) => {
            if (a[column] === b[column]) return 0;
            return (a[column] > b[column] ? 1 : -1) * (ascending ? 1 : -1);
          });
        }
        if (this.limitN != null) data = data.slice(0, this.limitN);
        return { data, error: null };
      }
    };
    return state;
  }

  return { from, tables };
}

const db = createMemorySupabase();
setChatDbForTests(db);

const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

function cookiePair(response) {
  const cookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [];
  const raw = cookies.find((cookie) => cookie.startsWith(`${CHAT_COOKIE}=`));
  return raw ? raw.split(';')[0] : null;
}

test.after(() => {
  server.close();
});

test('anonymous chats stay with the cookie that created them', async () => {
  const created = await fetch(`${base}/api/chat/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Owner A' })
  });
  assert.equal(created.status, 201);
  const cookie = cookiePair(created);
  assert.ok(cookie);
  assert.match(created.headers.get('set-cookie'), /HttpOnly/i);
  const conversation = await created.json();
  assert.equal(conversation.title, 'Owner A');
  assert.equal(conversation.session_id, undefined);

  const listed = await fetch(`${base}/api/chat/conversations`, {
    headers: { Cookie: cookie }
  });
  assert.equal(listed.status, 200);
  const list = await listed.json();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, conversation.id);

  const other = await fetch(`${base}/api/chat/conversations/${conversation.id}`);
  assert.equal(other.status, 404);

  const renamed = await fetch(`${base}/api/chat/conversations/${conversation.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'inspir_chat_sid=' + 'ab'.repeat(32)
    },
    body: JSON.stringify({ title: 'Stolen', session_id: 'anon:stolen' })
  });
  assert.equal(renamed.status, 404);

  const ownedRename = await fetch(`${base}/api/chat/conversations/${conversation.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ title: 'Renamed', session_id: 'anon:stolen', is_pinned: true })
  });
  assert.equal(ownedRename.status, 200);
  const renamedBody = await ownedRename.json();
  assert.equal(renamedBody.title, 'Renamed');
  assert.equal(renamedBody.is_pinned, true);
  assert.equal(renamedBody.session_id, undefined);
  const stored = db.tables.chat_conversations.find((row) => row.id === conversation.id);
  assert.ok(stored.session_id.startsWith('anon:'));
  assert.notEqual(stored.session_id, 'anon:stolen');

  const rejected = await fetch(`${base}/api/chat/conversations/${conversation.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ session_id: 'anon:stolen' })
  });
  assert.equal(rejected.status, 400);

  const message = await fetch(`${base}/api/chat/conversations/${conversation.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'read the other student notes' })
  });
  assert.equal(message.status, 404);
  assert.equal(db.tables.chat_messages.length, 0);

  const removed = await fetch(`${base}/api/chat/conversations/${conversation.id}`, {
    method: 'DELETE'
  });
  assert.equal(removed.status, 404);
  assert.ok(db.tables.chat_conversations.some((row) => row.id === conversation.id));
});

test('a student token cannot read another student conversation', async () => {
  const studentA = '11111111-1111-4111-8111-111111111111';
  const studentB = '22222222-2222-4222-8222-222222222222';
  const parent = '33333333-3333-4333-8333-333333333333';
  const tokenA = generateStudentToken({ id: studentA, username: 'a', parent_id: parent });
  const tokenB = generateStudentToken({ id: studentB, username: 'b', parent_id: parent });

  const created = await fetch(`${base}/api/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`
    },
    body: JSON.stringify({ title: 'Student A' })
  });
  assert.equal(created.status, 201);
  assert.equal(cookiePair(created), null);
  const conversation = await created.json();
  const stored = db.tables.chat_conversations.find((row) => row.id === conversation.id);
  assert.equal(stored.session_id, `student:${studentA}`);

  const stolen = await fetch(`${base}/api/chat/conversations/${conversation.id}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert.equal(stolen.status, 404);

  const invalid = await fetch(`${base}/api/chat/conversations`, {
    headers: { Authorization: 'Bearer not-a-token' }
  });
  assert.equal(invalid.status, 401);

  db.tables.chat_messages.push({
    id: crypto.randomUUID(),
    conversation_id: conversation.id,
    role: 'user',
    content: 'photosynthesis notes for student A',
    created_at: new Date().toISOString()
  });

  const found = await fetch(`${base}/api/chat/search?query=photosynthesis`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  assert.equal(found.status, 200);
  const hits = await found.json();
  assert.equal(hits.length, 1);

  const hidden = await fetch(`${base}/api/chat/search?query=photosynthesis`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  assert.equal(hidden.status, 200);
  assert.deepEqual(await hidden.json(), []);
});

test('browser origins outside the allowlist do not receive credentialed CORS', async () => {
  const blocked = await fetch(`${base}/health`, {
    headers: { Origin: 'http://evil.example' }
  });
  assert.equal(blocked.status, 200);
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);

  const allowed = await fetch(`${base}/health`, {
    headers: { Origin: 'http://localhost:5173' }
  });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');
});

test('error responses omit exception text', async () => {
  const response = await fetch(`${base}/api/chat/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, 'Bad request');
  assert.equal(body.message, undefined);
  assert.equal(body.details, undefined);
  assert.equal(JSON.stringify(body).includes('Unexpected'), false);
});

test('production refuses the placeholder JWT secret', () => {
  const missing = spawnSync(process.execPath, [
    '--input-type=module',
    '-e',
    "await import('./utils/jwt.js')"
  ], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { PATH: process.env.PATH, NODE_ENV: 'production' },
    encoding: 'utf8'
  });
  assert.notEqual(missing.status, 0);
  assert.match(`${missing.stderr}\n${missing.stdout}`, /JWT_SECRET/);

  const ready = spawnSync(process.execPath, [
    '--input-type=module',
    '-e',
    "await import('./utils/jwt.js')"
  ], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: {
      PATH: process.env.PATH,
      NODE_ENV: 'production',
      JWT_SECRET: 'production-secret-with-enough-length'
    },
    encoding: 'utf8'
  });
  assert.equal(ready.status, 0, ready.stderr);
});
