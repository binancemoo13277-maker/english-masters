# English Masters — النسخة الاحترافية

- Facebook Pixel ID من لوحة التحكم: PageView / ViewContent / InitiateCheckout / Purchase.
- تحديد طلب منفرد أو تحديد الكل وحذف جماعي مع تأكيد.
- فلتر طلبات من تاريخ إلى تاريخ + فلتر اليوم + مسح الفلتر.
- تصدير CSV للطلبات الظاهرة بعد الفلترة.
- السعر والتوصيل كما في النسخة السابقة.

بعد الرفع على GitHub ونجاح Deploy، افتح `/admin.html`، أدخل كلمة مرور الإدارة، وضع Pixel ID ثم احفظ.


## No-flash update
The landing page now hides all dynamic content until /api/content finishes loading, then reveals the final state once. A short loader is shown instead of stale text/images/prices.
