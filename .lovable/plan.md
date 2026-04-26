## הבעיות שזוהו

### 1. מס לא מחושב ב-Create Order
בצילום המסך רואים **"Tax exempt — $0.00"**. זה לא באג בכתובת — זה כי המוצר שבחרת מסומן בדאטהבייס כ-`tax_exempt = true`.

בדקתי את כל המוצרים:
| מוצר | tax_exempt |
|---|---|
| ISMIR module for FTIR | false ✅ |
| ISMIR-SENSE cartridge | false ✅ |
| **ISMIR™ Stand-alone** | **true ❌** |
| ISMIR™-FLOW | false ✅ |
| ISMIR™-Waveguide | false ✅ |

הקוד ב-`CreateOrder.tsx` מסנן החוצה כל מוצר עם `tax_exempt=true` לפני שהוא שולח ל-Stripe Tax → ולכן `lineItems.length === 0` → מציג "Tax exempt".

**הערה חשובה:** השדה `tax_exempt` בפרויקט הזה משמש לשתי מטרות שונות שמתנגשות:
- **הצגת מחיר בעמוד הציבורי** (לפי memory `product-price-visibility`: כש-toggle "Show price" כבוי → tax_exempt=true)
- **פטור ממס בחישוב Stripe Tax**

זה מה שגורם ל-"ISMIR™ Stand-alone" להיות פטור ממס — כי כנראה כיבית לו את הצגת המחיר.

### 2. הזמנות ידניות לא עוברות ל-Stripe
היום `handleCreateOrder` שומר רק לטבלת `orders` המקומית. אין שום קריאה ל-Stripe → ההזמנה לא מופיעה ב-Stripe Dashboard, והמס לא נרשם רשמית ב-Stripe Tax (חשוב לדיווח לרשויות).

---

## התוכנית

### A. תיקון חישוב המס (מיידי)
**אופציה מומלצת:** להפריד בין שתי המשמעויות של `tax_exempt`:
- בעמוד הציבורי / Cart → להמשיך להשתמש ב-`tax_exempt` כדי להחליט אם להציג מחיר.
- ב-Create Order (אדמין) → **להתעלם** מ-`tax_exempt` ולשלוח את כל המוצרים ל-Stripe Tax. אדמין שיוצר הזמנה ידנית תמיד רואה את המחיר ורוצה לחשב מס אמיתי.

שינוי: ב-`CreateOrder.tsx` שורה 181, להסיר את `.filter((p) => !p.taxExempt)`.

(אם בעתיד תרצי באמת מוצרים פטורים ממס — נוסיף שדה DB נפרד `is_tax_exempt` שלא קשור להצגת מחיר.)

### B. דחיפת הזמנות ידניות ל-Stripe כ-Invoices
זה ה-flow המתאים להזמנות ידניות (לא checkout מיידי, מאפשר "due later", ומופיע ב-Stripe Dashboard + נרשם ב-Stripe Tax):

1. **Edge function חדש: `create-stripe-invoice`**
   - מקבל: `orderId`
   - שולף את ההזמנה + items + customer מה-DB
   - מוצא או יוצר Stripe Customer לפי email (+ שומר address מה-customer לצורך מס)
   - יוצר `Invoice` עם `automatic_tax: { enabled: true }` ו-`collection_method: 'send_invoice'` (אם payment_due_later) או `'charge_automatically'`
   - מוסיף `InvoiceItem` לכל מוצר (משתמש ב-`stripe_price_id` כשקיים, אחרת `price_data` עם שם המוצר)
   - מוסיף שורה נפרדת ל-shipping אם יש
   - מוסיף discount כ-coupon חד-פעמי או `discount_amount`
   - `finalizeInvoice` → מקבל `invoice.id`, `hosted_invoice_url`, `tax` הסופי
   - שומר ב-DB: `stripe_invoice_id`, `stripe_invoice_url` בטבלת `orders`

2. **DB migration:**
   - `ALTER TABLE orders ADD COLUMN stripe_invoice_id text, stripe_invoice_url text, stripe_invoice_status text;`

3. **שינוי ב-`CreateOrder.handleCreateOrder`:**
   - אחרי `INSERT` ל-`orders` + `order_items` → קריאה ל-`create-stripe-invoice` עם ה-`order.id`
   - אם הצליח → toast "Order created and synced to Stripe" + ניווט ל-OrderDetail
   - אם נכשל → ההזמנה נשמרת מקומית, toast warning עם כפתור "Retry sync to Stripe"

4. **OrderDetail.tsx — תוספת קטנה:**
   - אם יש `stripe_invoice_url` → להציג badge "Synced to Stripe" + לינק לחשבונית ב-Stripe
   - כפתור "Sync to Stripe" אם עדיין לא סונכרן

### תוצאה
- כל הזמנה ידנית תופיע ב-Stripe Dashboard כ-Invoice
- המס מחושב ע"י Stripe Tax **ונרשם רשמית** (לא רק תצוגה)
- אם `payment_due_later` → Stripe ישלח חשבונית ללקוח
- אחרת → החשבונית מסומנת `paid out_of_band` (כי שילם offline)

---

**שאלה אחת לפני שאני מתחיל:** ב-flow של הזמנה ידנית עם `payment_due_later=false` (כלומר "כבר שולם") — את רוצה שהחשבונית ב-Stripe תיווצר כ-`paid out_of_band` (תיעוד בלבד, בלי לחייב את הלקוח), נכון? או שאת רוצה שStripe ינסה לחייב כרטיס שמור?