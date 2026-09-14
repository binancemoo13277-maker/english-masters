import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  try {
    if (!process.env.DATABASE_URL) return res.status(503).json({ ok: false, database: false, error: 'DATABASE_URL missing' });
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT to_regclass('public.orders') AS orders, to_regclass('public.site_content') AS site_content`;
    const tables = rows[0] || {};
    return res.status(200).json({ ok: Boolean(tables.orders && tables.site_content), database: true, tables });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, database: false, error: 'Database check failed' });
  }
}
