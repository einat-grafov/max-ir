import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

interface CartLineMeta {
  id: string; // productId
  n: string;  // productName
  v?: string; // variantName
  s?: string; // sku
  p: number;  // unit price
  q: number;  // quantity
}

async function handleCheckoutCompleted(session: any) {
  const supabase = getSupabase();
  const md = session.metadata || {};

  let cartItems: CartLineMeta[] = [];
  try {
    cartItems = md.cart_items ? JSON.parse(md.cart_items) : [];
  } catch (e) {
    console.error("Failed to parse cart_items metadata", e);
  }

  const customerEmail =
    session.customer_details?.email || session.customer_email || null;
  const customerName =
    session.customer_details?.name || customerEmail || "Stripe customer";
  const totalAmount = (session.amount_total ?? 0) / 100;
  const subtotal = (session.amount_subtotal ?? 0) / 100;
  const shippingCost = (session.shipping_cost?.amount_total ??
    session.total_details?.amount_shipping ?? 0) / 100;
  const tax = (session.total_details?.amount_tax ?? 0) / 100;
  const shippingMethod = md.shipping_carrier && md.shipping_service
    ? `${md.shipping_carrier} — ${md.shipping_service}`
    : null;

  // Try to link to an existing customer by email
  let customerId: string | null = null;
  if (customerEmail) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();
    customerId = (existing?.id as string) ?? null;
  }

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      payment_status: "paid",
      fulfillment_status: "unfulfilled",
      status: "unfulfilled",
      subtotal,
      shipping_cost: shippingCost,
      shipping_method: shippingMethod,
      tax,
      discount_amount: 0,
      total: totalAmount,
      payment_due_later: false,
      notes: `Stripe checkout session: ${session.id}`,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Failed to insert order", orderError);
    return;
  }

  // Insert order items + decrement stock
  if (cartItems.length > 0) {
    const orderItemsPayload = cartItems.map((c) => ({
      order_id: order.id,
      product_id: c.id,
      product_name: c.v && c.v !== c.n ? `${c.n} — ${c.v}` : c.n,
      price: c.p,
      quantity: c.q,
      total: c.p * c.q,
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
    if (itemsError) console.error("Failed to insert order items", itemsError);

    // Decrement stock per product (sum quantities by product)
    const stockDeltas = new Map<string, number>();
    for (const c of cartItems) {
      stockDeltas.set(c.id, (stockDeltas.get(c.id) ?? 0) + c.q);
    }
    for (const [productId, qty] of stockDeltas.entries()) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", productId)
        .maybeSingle();
      if (product) {
        const newStock = Math.max(0, ((product.stock as number) ?? 0) - qty);
        await supabase.from("products").update({ stock: newStock }).eq("id", productId);
      }
    }
  }

  const itemsSummary = cartItems
    .map((c) => `${c.v && c.v !== c.n ? `${c.n} — ${c.v}` : c.n} × ${c.q}`)
    .join("\n");
  const totalFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (session.currency || "usd").toUpperCase(),
  }).format(totalAmount);

  // Send customer confirmation email
  if (customerEmail) {
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-confirmation",
          recipientEmail: customerEmail,
          templateData: {
            customerName,
            orderNumber: order.order_number,
            total: totalFmt,
            items: itemsSummary,
          },
        },
      });
    } catch (e) {
      console.error("Failed to send order confirmation email", e);
    }
  }

  // Notify admin
  try {
    const { data: notifSettings } = await supabase
      .from("notification_settings")
      .select("inquiries_notification_email")
      .limit(1)
      .maybeSingle();
    const adminEmail = notifSettings?.inquiries_notification_email as string | undefined;
    if (adminEmail) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "order-confirmation",
          recipientEmail: adminEmail,
          templateData: {
            customerName: `New order from ${customerName}`,
            orderNumber: order.order_number,
            total: totalFmt,
            items: `${itemsSummary}\n\nCustomer email: ${customerEmail ?? "n/a"}`,
          },
        },
      });
    }
  } catch (e) {
    console.error("Failed to send admin notification", e);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook received with invalid env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
