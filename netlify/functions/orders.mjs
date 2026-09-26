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

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return neon(process.env.DATABASE_URL);
}

function normalizeCity(value = '') {
  return String(value).normalize('NFD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').trim();
}

export default async (req) => {
  try {
    const sql = db();

    if (req.method === 'POST') {
      let body = {};
      try { body = await req.json(); } catch {}
      const { name, phone, city, qty = 1, address } = body;
      const cleanName = String(name || '').trim();
      const cleanPhone = String(phone || '').trim();
      const cleanCity = String(city || '').trim();
      const cleanAddress = String(address || '').trim();
      if (!cleanName || !cleanPhone || !cleanCity || !cleanAddress) return json({ error: 'اكتب الاسم والهاتف والمحافظة والعنوان' }, 400);
      if (cleanName.length > 160 || cleanPhone.length > 50 || cleanCity.length > 100 || cleanAddress.length > 700) return json({ error: 'بعض البيانات أطول من المسموح' }, 400);

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
        VALUES (${cleanName}, ${cleanPhone}, ${cleanCity}, ${q}, ${cleanAddress}, ${amount})
        RETURNING id, created_at`;

      return json({ ok: true, id: rows[0].id, created_at: rows[0].created_at, total: amount, qty: q });
    }

    if (req.method === 'GET') {
      const password = req.headers.get('x-admin-password') || '';
      if (!process.env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not configured' }, 503);
      if (password !== process.env.ADMIN_PASSWORD) return json({ error: 'كلمة المرور غير صحيحة' }, 401);

      const rows = await sql`SELECT id, name, phone, city, qty, address, total, created_at
        FROM orders ORDER BY created_at DESC LIMIT 1000`;
      return json({ orders: rows });
    }

    if (req.method === 'DELETE') {
      const password = req.headers.get('x-admin-password') || '';
      if (!process.env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD is not configured' }, 503);
      if (password !== process.env.ADMIN_PASSWORD) return json({ error: 'كلمة المرور غير صحيحة' }, 401);

      let body = {};
      try { body = await req.json(); } catch {}
      const rawIds = Array.isArray(body.ids) ? body.ids : [body.id];
      const ids = [...new Set(rawIds.map(Number).filter(id => Number.isInteger(id) && id > 0))].slice(0, 1000);
      if (!ids.length) return json({ error: 'لم يتم تحديد طلبات صحيحة' }, 400);

      const deletedIds = [];
      for (const id of ids) {
        const deleted = await sql`DELETE FROM orders WHERE id = ${id} RETURNING id`;
        if (deleted.length) deletedIds.push(Number(deleted[0].id));
      }
      if (!deletedIds.length) return json({ error: 'الطلبات غير موجودة' }, 404);
      return json({ ok: true, ids: deletedIds, count: deletedIds.length });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: 'حدث خطأ في الخادم' }, 500);
  }
};

export const config = { path: '/api/orders' };
