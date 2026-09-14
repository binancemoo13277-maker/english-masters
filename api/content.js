import { neon } from '@neondatabase/serverless';

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

export default async function handler(req, res) {
  try {
    const sql = db();
    if (req.method === 'GET') {
      const rows = await sql`SELECT content, updated_at FROM site_content WHERE id = 1`;
      return res.status(200).json(rows[0] || { content: {} });
    }

    if (req.method === 'POST') {
      const password = req.headers['x-admin-password'];
      if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured' });
      if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      const content = req.body?.content;
      if (!content || typeof content !== 'object' || Array.isArray(content)) return res.status(400).json({ error: 'بيانات غير صحيحة' });
      await sql`INSERT INTO site_content (id, content, updated_at)
        VALUES (1, ${JSON.stringify(content)}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
}
