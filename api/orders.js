import { neon } from '@neondatabase/serverless';

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}
function normalizeCity(value='') {
  return String(value).normalize('NFD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const sql = db();

    if (req.method === 'POST') {
      let body = req.body || {};
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const { name, phone, city, qty = 1, address } = body;
      const cleanName = String(name || '').trim();
      const cleanPhone = String(phone || '').trim();
      const cleanCity = String(city || '').trim();
      const cleanAddress = String(address || '').trim();
      if (!cleanName || !cleanPhone || !cleanCity || !cleanAddress) return res.status(400).json({ error: 'اكتب الاسم والهاتف والمحافظة والعنوان' });
      if (cleanName.length > 160 || cleanPhone.length > 50 || cleanCity.length > 100 || cleanAddress.length > 700) return res.status(400).json({ error: 'بعض البيانات أطول من المسموح' });
      const q = Math.max(1, Math.min(20, Number(qty) || 1));

      const contentRows = await sql`SELECT content FROM site_content WHERE id = 1`;
      const root = contentRows[0]?.content || {};
      const settings = root.v2 || {};
      const unitPrice = Math.max(0, Number(settings.price) || 15);
      const ammanShipping = Math.max(0, Number(settings.shippingAmman) || 2);
      const otherShipping = Math.max(0, Number(settings.shippingOther) || 3);
      const shipping = normalizeCity(cleanCity) === 'عمان' ? ammanShipping : otherShipping;
      const amount = Math.max(0, Math.min(100000, Number((unitPrice * q + shipping).toFixed(2))));

      const rows = await sql`INSERT INTO orders (name, phone, city, qty, address, total)
        VALUES (${cleanName}, ${cleanPhone}, ${cleanCity}, ${q}, ${cleanAddress}, ${amount}) RETURNING id, created_at`;
      return res.status(200).json({ ok: true, id: rows[0].id, created_at: rows[0].created_at, total: amount, qty: q });
    }

    if (req.method === 'GET') {
      const password = req.headers['x-admin-password'];
      if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured' });
      if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      const rows = await sql`SELECT id, name, phone, city, qty, address, total, created_at FROM orders ORDER BY created_at DESC LIMIT 1000`;
      return res.status(200).json({ orders: rows });
    }

    if (req.method === 'DELETE') {
      const password = req.headers['x-admin-password'];
      if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured' });
      if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      let body = req.body || {};
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const rawIds = Array.isArray(body.ids) ? body.ids : [body.id];
      const ids = [...new Set(rawIds.map(Number).filter(id => Number.isInteger(id) && id > 0))].slice(0, 1000);
      if (!ids.length) return res.status(400).json({ error: 'لم يتم تحديد طلبات صحيحة' });
      const deletedIds = [];
      for (const id of ids) {
        const deleted = await sql`DELETE FROM orders WHERE id = ${id} RETURNING id`;
        if (deleted.length) deletedIds.push(Number(deleted[0].id));
      }
      if (!deletedIds.length) return res.status(404).json({ error: 'الطلبات غير موجودة' });
      return res.status(200).json({ ok: true, ids: deletedIds, count: deletedIds.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
}
