import { neon } from '@neondatabase/serverless';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}

function db(env) {
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(env.DATABASE_URL);
}

export async function onRequest(context) {
  const { request: req, env } = context;
  try {
    const sql = db(env);

    if (req.method === 'GET') {
      const rows = await sql`SELECT content, updated_at FROM site_content WHERE id = 1`;
      return json(rows[0] || { content: {} });
    }

    if (req.method === 'POST') {
      const password = req.headers.get('x-admin-password') || '';
      if (!env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not configured' }, 503);
      if (password !== env.ADMIN_PASSWORD) return json({ error: 'كلمة المرور غير صحيحة' }, 401);

      let body = {};
      try { body = await req.json(); } catch {}
      const content = body?.content;
      if (!content || typeof content !== 'object' || Array.isArray(content)) {
        return json({ error: 'بيانات غير صحيحة' }, 400);
      }

      await sql`INSERT INTO site_content (id, content, updated_at)
        VALUES (1, ${JSON.stringify(content)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`;
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: 'حدث خطأ في الخادم' }, 500);
  }
}
