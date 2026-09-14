import { neon } from '@neondatabase/serverless';

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

export default async function handler(req, res) {
  try {
    const sql = db();
    if (req.method === 'POST') {
      const { name, phone, city, qty = 1, address, total = 0 } = req.body || {};
      if (!name || !phone) return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان' });
      const q = Math.max(1, Math.min(20, Number(qty) || 1));
      const amount = Number(total) || 0;
      const rows = await sql`INSERT INTO orders (name, phone, city, qty, address, total)
        VALUES (${name}, ${phone}, ${city || ''}, ${q}, ${address || ''}, ${amount}) RETURNING id`;
      return res.status(200).json({ ok: true, id: rows[0].id });
    }

    if (req.method === 'GET') {
      const password = req.headers['x-admin-password'];
      if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured' });
      if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      const rows = await sql`SELECT id, name, phone, city, qty, address, total, created_at FROM orders ORDER BY created_at DESC LIMIT 200`;
      return res.status(200).json({ orders: rows });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
}
