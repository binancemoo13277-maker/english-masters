# English Masters Jordan Landing Page

نسخة جاهزة للرفع على GitHub والنشر على Vercel، مع لوحة تحكم على `/admin.html` وقاعدة بيانات Neon لحفظ المحتوى والطلبات.

## الملفات المهمة
- `index.html` — صفحة الهبوط.
- `admin.html` — لوحة التحكم.
- `api/content.js` — قراءة/حفظ محتوى الصفحة.
- `api/orders.js` — استقبال وعرض الطلبات.
- `setup.sql` — إنشاء جداول قاعدة البيانات.
- `.env.example` — أسماء متغيرات البيئة المطلوبة بدون أي بيانات سرية.

## الرفع على GitHub
أنشئ Repository جديد ثم ارفع **كل الملفات الموجودة داخل هذا المجلد** إلى جذر الـRepository.

## النشر على Vercel
1. اربط الـRepository مع Vercel.
2. أضف Environment Variables التالية في إعدادات المشروع:
   - `DATABASE_URL` = رابط Neon PostgreSQL الحقيقي.
   - `ADMIN_PASSWORD` = كلمة المرور التي تريدها للوحة التحكم.
3. نفّذ محتوى `setup.sql` مرة واحدة على قاعدة Neon إذا كانت قاعدة جديدة.
4. Deploy.

بعد النشر:
- الموقع: `/`
- لوحة التحكم: `/admin.html`

> لا ترفع ملف `.env` الحقيقي إلى GitHub. `.gitignore` يمنع رفعه تلقائيًا عند استخدام Git.
