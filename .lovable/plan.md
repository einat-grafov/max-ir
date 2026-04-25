# תכנית: אינטגרציית Stripe מחדש — Price ID per Variant

## עקרונות
- **תמחור**: Stripe Price ID לכל variant (לא ברמת מוצר, לא price_data דינמי)
- **מס**: Stripe Tax אוטומטי (כבר מוגדר בדשבורד), `tax_behavior: "exclusive"`
- **Webhooks**: אין. הזמנות מנוהלות בדשבורד Stripe בלבד
- **מקור אמת למחיר**: Stripe (ה-Price ID נשמר ב-DB, המחיר עצמו מגיע מ-Stripe)

---

## 1. `src/components/admin/ProductForm.tsx`
- **להסיר** את שדה `Stripe Price ID` ברמת המוצר.
- **להוסיף** עמודת `Stripe Price ID` בתוך כל שורת variant (ליד name/price/stock/sku).
- ולידציה per variant: ריק או `^price_[A-Za-z0-9]+$`. שגיאה ברורה אם פורמט לא תקין.
- Helper text: "Stripe Price ID (price_xxx). Stripe Dashboard → Products → בחרי מוצר → Pricing → Price ID."

## 2. `src/pages/admin/CreateProduct.tsx` + `EditProduct.tsx`
- להסיר `stripe_price_id: data.stripePriceId` מה-insert/update (חלק מ-`variants` JSON).
- להסיר `stripePriceId` מה-`initialData` ב-EditProduct.
- ב-`variants`: לכלול `stripe_price_id` בכל אובייקט variant.

## 3. מיגרציית DB
- `ALTER TABLE products DROP COLUMN stripe_price_id;` — לא בשימוש יותר.
- למחוק את המיגרציה הריקה הקיימת של `idx_orders_stripe_session_id` (לא רלוונטי בלי webhook). לחילופין: לתת לה להישאר אם כבר רצה — אבל לא להוסיף את ה-index.

## 4. `supabase/functions/create-checkout/index.ts` — שכתוב
- לקרוא `variants` מ-`products` (במקום `stripe_price_id` ברמת מוצר).
- לכל פריט בעגלה: למצוא את ה-variant המתאים לפי `variantName` ולקחת את ה-`stripe_price_id` שלו.
- ולידציה:
  - אם variant חסר Price ID → 400: "Variant 'X' is missing Stripe Price ID. Add it in admin → product → variants."
  - פורמט: `^price_[A-Za-z0-9]+$`.
- לבנות `line_items` עם `price: variant.stripe_price_id` + `quantity`.
- להשאיר: `automatic_tax: { enabled: true }`, `billing_address_collection: 'required'`, shipping options, metadata, stock validation.

## 5. ניקוי קוד מיותר
- **למחוק**: `supabase/functions/payments-webhook/index.ts` + קריאה ל-`delete_edge_functions` להסרה מ-Stripe deploys.
- **לערוך** `supabase/functions/_shared/stripe.ts`: למחוק את `verifyWebhook` ואת ייבוא `encode`. להשאיר רק `createStripeClient`.
- **לא** למחוק `verify-checkout-session` (דף ההצלחה משתמש בו).

## 6. ניקוי frontend
- `CartContext.tsx`: בלי שינוי (לא מכיל `stripePriceId`).
- `StripeEmbeddedCheckout.tsx`: בלי שינוי.
- `Cart.tsx`: לוודא שאין ולידציה ישנה של Price ID ברמת מוצר; אם יש — להסיר.

## 7. הוראות חד-פעמיות בדשבורד Stripe (אחרי הפריסה)
1. **Products** → Create product (למשל "ISMIR Waveguide Sensor")
2. תחת המוצר: ליצור 3 Prices, אחד לכל וריאנט (עם המחיר המתאים)
3. על המוצר: **Tax code = General - Tangible Goods** (`txcd_99999999`)
4. על כל Price: **Tax behavior = Exclusive**
5. להעתיק 3 Price IDs → להדביק באדמין שלך, כל אחד בוריאנט המתאים

## 8. בדיקה (Test Mode)
- מוצר עם 3 Price IDs באדמין → הוספה לעגלה → checkout
- לוודא: מחיר נכון, מס מתווסף ללקוחות בארה״ב (לפי nexus), תשלום מצליח
- בדשבורד Stripe: עסקה מופיעה עם שם המוצר/וריאנט נכון

---

## קבצים שישתנו
- `src/components/admin/ProductForm.tsx`
- `src/pages/admin/CreateProduct.tsx`
- `src/pages/admin/EditProduct.tsx`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/_shared/stripe.ts`
- מיגרציה: `DROP COLUMN products.stripe_price_id`

## קבצים/פונקציות שיימחקו
- `supabase/functions/payments-webhook/` (כולל `delete_edge_functions(["payments-webhook"])`)

## מה צריך ממך אחרי היישום
1. ליצור מוצר + 3 Prices ב-Stripe Dashboard
2. להדביק 3 Price IDs בכל variant באדמין
3. לבדוק checkout ב-Test Mode
