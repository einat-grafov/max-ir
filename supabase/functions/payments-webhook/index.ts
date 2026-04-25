import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;
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
  id: string;  // productId
  n: string;   // productName
  v?: string;  // variantName
  s?: string;  // sku
  q: number;   // quantity (for stock decrement only)
}

async function handleCheckoutCompleted(session: any) {
  const supabase = getSupabase();
  const md = session.metadata || {};
  const stripe = createStripeClient();

  // Idempotency: skip if order already exists for this session
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) {
    console.log(`Order already exists for session ${session.id}, skipping.`);
    return;
  }

  let cartItems: CartLineMeta[] = [];
  try {
    cartItems = md.cart_items ? JSON.parse(md.cart_items) : [];
  } catch (e) {
    console.error("Failed to parse cart_items metadata", e);
  }

  // Authoritative line items from Stripe
  const stripeLineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

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

  let customerId: string | null = null;
  if (customerEmail) {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();
    customerId = (existingCustomer?.id as string) ?? null;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      stripe_session_id: session.id,
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
    if ((orderError as any)?.code === "23505") {
      console.log(`Race-protected duplicate for session ${session.id}, skipping.`);
      return;
    }
    console.error("Failed to insert order", orderError);
    return;
  }

  // Build order_items from Stripe (authoritative prices) + cart metadata for product mapping
  const cartByPriceId = new Map<string, CartLineMeta>();
  // Best-effort mapping: pair each Stripe line by index with cart metadata
  // (Stripe preserves line_item order from session creation).
  const orderItemsPayload = stripeLineItems.data.map((li: any, idx: number) => {
    const cartMeta = cartItems[idx];
    const unitPrice = (li.amount_subtotal ?? 0) / 100 / Math.max(1, li.quantity ?? 1);
    const total = (li.amount_subtotal ?? 0) / 100;
    const productName = cartMeta
      ? (cartMeta.v && cartMeta.v !== cartMeta.n ? `${cartMeta.n} — ${cartMeta.v}` : cartMeta.n)
      : (li.description || "Product");
    if (cartMeta && li.price?.id) cartByPriceId.set(li.price.id, cartMeta);
    return {
      order_id: order.id,
      product_id: cartMeta?.id ?? null,
      product_name: productName,
      price: unitPrice,
      quantity: li.quantity ?? 1,
      total,
    };
  });

  if (orderItemsPayload.length > 0) {
    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
    if (itemsError) console.error("Failed to insert order items", itemsError);
  }

  // Decrement stock per product (sum quantities)
  const stockDeltas = new Map<string, number>();
  for (const c of cartItems) {
    if (!c.id) continue;
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

  const itemsSummary = orderItemsPayload
    .map((c: any) => `${c.product_name} × ${c.quantity}`)
    .join("\n");
  const totalFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (session.currency || "usd").toUpperCase(),
  }).format(totalAmount);

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

async function handleAsyncPaymentFailed(session: any) {
  const supabase = getSupabase();
  await supabase
    .from("orders")
    .update({ payment_status: "failed", status: "cancelled" })
    .eq("stripe_session_id", session.id);
}

async function handleChargeRefunded(charge: any) {
  const supabase = getSupabase();
  const stripe = createStripeClient();
  const piId: string | undefined = charge.payment_intent;
  if (!piId) return;
  const sessions = await stripe.checkout.sessions.list({ payment_intent: piId, limit: 1 });
  const sessionId = sessions.data[0]?.id;
  if (!sessionId) return;

  const fullyRefunded = charge.refunded === true || charge.amount_refunded >= charge.amount;
  await supabase
    .from("orders")
    .update({
      payment_status: fullyRefunded ? "refunded" : "partially_refunded",
    })
    .eq("stripe_session_id", sessionId);
}

async function handleDisputeCreated(dispute: any) {
  const supabase = getSupabase();
  const stripe = createStripeClient();
  const chargeId: string | undefined = dispute.charge;
  if (!chargeId) return;
  const charge = await stripe.charges.retrieve(chargeId);
  const piId = charge.payment_intent as string | undefined;
  if (!piId) return;
  const sessions = await stripe.checkout.sessions.list({ payment_intent: piId, limit: 1 });
  const sessionId = sessions.data[0]?.id;
  if (!sessionId) return;
  await supabase
    .from("orders")
    .update({ payment_status: "disputed" })
    .eq("stripe_session_id", sessionId);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const event = await verifyWebhook(req);
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
        await handleAsyncPaymentFailed(event.data.object);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object);
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
