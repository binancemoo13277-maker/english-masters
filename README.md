# English Masters — Netlify clean deployment

نسخة نظيفة أصلية جاهزة لـ Netlify، وتستخدم نفس قاعدة Neon القديمة.

## Netlify environment variables
- DATABASE_URL = نفس Connection String من Neon
- ADMIN_PASSWORD = كلمة مرور لوحة التحكم

## Paths
- الموقع: /
- لوحة التحكم: /admin.html
- فحص قاعدة البيانات: /api/health

## Important
هذه النسخة مصممة لاستضافة Netlify وتستخدم Netlify Functions داخل `netlify/functions`.
