import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface CartItemMeta {
  id: string;
  n: string;
  v?: string;
  s?: string;
  q: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return json(400, { error: "Missing signature" });
  }

  const stripe = createStripeClient();
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", msg);
    return json(400, { error: `Webhook verification failed: ${msg}` });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as any;

      // Idempotency: don't create the same order twice
      const { data: existing } = await admin
        .from("orders")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (existing) {
        console.log("Order already exists for session", session.id);
        return json(200, { received: true, duplicate: true });
      }

      // Retrieve full session with line items + tax breakdown
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items", "total_details.breakdown", "customer_details"],
      });

      const customerEmail =
        fullSession.customer_details?.email || fullSession.customer_email || null;
      const customerName = fullSession.customer_details?.name || "Customer";
      const meta = (fullSession.metadata ?? {}) as Record<string, string>;

      const cartItems: CartItemMeta[] = meta.cart_items
        ? JSON.parse(meta.cart_items)
        : [];

      const amountSubtotal = (fullSession.amount_subtotal ?? 0) / 100;
      const amountTotal = (fullSession.amount_total ?? 0) / 100;
      const taxAmount = (fullSession.total_details?.amount_tax ?? 0) / 100;
      const shippingCost = (fullSession.total_details?.amount_shipping ?? 0) / 100;
      const discountAmount = (fullSession.total_details?.amount_discount ?? 0) / 100;

      const paymentStatus =
        fullSession.payment_status === "paid" ? "paid" : "pending";

      // Create order
      const { data: orderRow, error: orderErr } = await admin
        .from("orders")
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          payment_status: paymentStatus,
          status: "unfulfilled",
          fulfillment_status: "unfulfilled",
          subtotal: amountSubtotal,
          tax: taxAmount,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          total: amountTotal,
          shipping_method: meta.shipping_carrier
            ? `${meta.shipping_carrier} — ${meta.shipping_service ?? ""}`.trim()
            : null,
          stripe_session_id: session.id,
        })
        .select("id, order_number")
        .single();

      if (orderErr || !orderRow) {
        console.error("Failed to insert order:", orderErr);
        return json(500, { error: "Failed to create order" });
      }

      // Create order_items + decrement stock
      const lineItems = (fullSession.line_items?.data ?? []) as any[];
      for (let i = 0; i < cartItems.length; i++) {
        const ci = cartItems[i];
        const li = lineItems[i];
        const unitPrice = li ? (li.amount_subtotal / 100) / (li.quantity || 1) : 0;
        const lineTotal = li ? li.amount_subtotal / 100 : 0;
        const productName = ci.v ? `${ci.n} – ${ci.v}` : ci.n;

        await admin.from("order_items").insert({
          order_id: orderRow.id,
          product_id: ci.id,
          product_name: productName,
          quantity: ci.q,
          price: unitPrice,
          total: lineTotal,
        });

        // Decrement stock — if variant, decrement variant; else top-level stock
        try {
          const { data: prod } = await admin
            .from("products")
            .select("stock, variants")
            .eq("id", ci.id)
            .single();

          if (prod) {
            if (ci.v && Array.isArray(prod.variants)) {
              const variants = (prod.variants as any[]).map((v: any) =>
                v?.name === ci.v
                  ? { ...v, stock: Math.max(0, Number(v.stock ?? 0) - ci.q) }
                  : v,
              );
              await admin
                .from("products")
                .update({ variants })
                .eq("id", ci.id);
            } else {
              await admin
                .from("products")
                .update({ stock: Math.max(0, (prod.stock ?? 0) - ci.q) })
                .eq("id", ci.id);
            }
          }
        } catch (e) {
          console.error("Stock decrement failed for", ci.id, e);
        }
      }

      // Send confirmation email (non-blocking)
      if (customerEmail) {
        try {
          const itemsText = cartItems
            .map((c) => `${c.v ? `${c.n} – ${c.v}` : c.n} × ${c.q}`)
            .join("\n");
          const currency = (fullSession.currency || "usd").toUpperCase();
          const totalStr = `${currency} ${amountTotal.toFixed(2)}`;

          await admin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "order-confirmation",
              recipientEmail: customerEmail,
              templateData: {
                customerName,
                orderNumber: orderRow.order_number,
                total: totalStr,
                items: itemsText,
              },
            },
          });
        } catch (e) {
          console.error("Failed to send confirmation email:", e);
        }
      }

      console.log(
        `Order ${orderRow.order_number} created for session ${session.id}`,
      );
    }

    // Handle admin-created Stripe Invoices being paid / failed
    if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const invoice = event.data.object as any;
      const invoiceId = invoice.id as string;
      const invoiceStatus = invoice.status as string; // 'paid' | 'open' | 'uncollectible' | ...
      const newPaymentStatus = event.type === "invoice.paid" ? "paid" : "failed";

      const { data: order, error: findErr } = await admin
        .from("orders")
        .select("id, order_number, customer_email, customer_name, total")
        .eq("stripe_invoice_id", invoiceId)
        .maybeSingle();

      if (findErr) {
        console.error("Failed to look up order by invoice:", findErr);
      } else if (!order) {
        console.log(`No matching order for invoice ${invoiceId}`);
      } else {
        const { error: updErr } = await admin
          .from("orders")
          .update({
            payment_status: newPaymentStatus,
            stripe_invoice_status: invoiceStatus,
            stripe_invoice_url: invoice.hosted_invoice_url ?? undefined,
          })
          .eq("id", order.id);

        if (updErr) {
          console.error("Failed to update order from invoice event:", updErr);
        } else {
          console.log(
            `Order ${order.order_number} updated → payment_status=${newPaymentStatus} (invoice ${invoiceId})`,
          );
        }
      }
    }

    return json(200, { received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("Webhook handler error:", msg);
    return json(500, { error: msg });
  }
});

// Need to import Stripe constructor for the static crypto provider
import Stripe from "https://esm.sh/stripe@18.5.0";
