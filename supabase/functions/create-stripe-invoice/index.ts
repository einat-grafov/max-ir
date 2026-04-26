import { createStripeClient } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const COUNTRY_TO_ISO: Record<string, string> = {
  "united states": "US",
  usa: "US",
  "u.s.": "US",
  "u.s.a.": "US",
  israel: "IL",
};
const toIso = (c?: string | null): string | undefined => {
  if (!c) return undefined;
  const t = c.trim();
  if (t.length === 2) return t.toUpperCase();
  return COUNTRY_TO_ISO[t.toLowerCase()];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  if (!body.orderId) return json(400, { error: "orderId required" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Fetch order, items, customer
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", body.orderId)
    .single();
  if (orderErr || !order) return json(404, { error: "Order not found" });

  if (order.stripe_invoice_id) {
    return json(200, {
      invoice_id: order.stripe_invoice_id,
      invoice_url: order.stripe_invoice_url,
      already_synced: true,
    });
  }

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);
  if (itemsErr || !items || items.length === 0) {
    return json(400, { error: "Order has no items" });
  }

  let customer: any = null;
  if (order.customer_id) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", order.customer_id)
      .single();
    customer = data;
  }

  const stripe = createStripeClient();

  try {
    // Find or create Stripe customer
    let stripeCustomerId: string | undefined;
    if (order.customer_email) {
      const existing = await stripe.customers.list({
        email: order.customer_email,
        limit: 1,
      });
      if (existing.data.length > 0) stripeCustomerId = existing.data[0].id;
    }

    const addressIso = toIso(customer?.country);
    const addressPayload = customer
      ? {
          line1: customer.address || undefined,
          line2: customer.apartment || undefined,
          city: customer.city || undefined,
          state: customer.state || undefined,
          postal_code: customer.postal_code || undefined,
          country: addressIso,
        }
      : undefined;

    if (!stripeCustomerId) {
      const created = await stripe.customers.create({
        email: order.customer_email || undefined,
        name: order.customer_name || undefined,
        phone: customer?.phone || undefined,
        address: addressPayload && addressIso ? (addressPayload as any) : undefined,
      });
      stripeCustomerId = created.id;
    } else if (addressPayload && addressIso) {
      // Update address so Stripe Tax can compute correctly
      await stripe.customers.update(stripeCustomerId, {
        address: addressPayload as any,
        name: order.customer_name || undefined,
      });
    }

    // Create draft invoice
    const collectionMethod = order.payment_due_later
      ? "send_invoice"
      : "send_invoice"; // we always create as send_invoice; mark paid out-of-band if already paid

    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      collection_method: collectionMethod,
      days_until_due: order.payment_due_later ? 30 : 1,
      automatic_tax: { enabled: true },
      currency: "usd",
      description: `Order #D${order.order_number}`,
      metadata: { order_id: order.id, order_number: String(order.order_number) },
    });

    // Add line items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        currency: "usd",
        description: item.product_name,
        quantity: item.quantity,
        unit_amount_decimal: String(Math.round(Number(item.price) * 100)),
      });
    }

    // Shipping as separate line
    if (Number(order.shipping_cost) > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        currency: "usd",
        description: order.shipping_method
          ? `Shipping — ${order.shipping_method}`
          : "Shipping",
        quantity: 1,
        unit_amount_decimal: String(Math.round(Number(order.shipping_cost) * 100)),
      });
    }

    // Discount as negative line item (simple approach)
    if (Number(order.discount_amount) > 0) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        invoice: invoice.id,
        currency: "usd",
        description: "Discount",
        quantity: 1,
        unit_amount_decimal: String(-Math.round(Number(order.discount_amount) * 100)),
      });
    }

    // Finalize
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

    // If already paid offline, mark as paid out-of-band
    if (!order.payment_due_later && order.payment_status === "paid") {
      await stripe.invoices.pay(finalized.id, { paid_out_of_band: true });
    }

    const refreshed = await stripe.invoices.retrieve(finalized.id);

    // Save back to DB
    await supabase
      .from("orders")
      .update({
        stripe_invoice_id: refreshed.id,
        stripe_invoice_url: refreshed.hosted_invoice_url ?? null,
        stripe_invoice_status: refreshed.status ?? null,
        tax: (refreshed.tax ?? 0) / 100,
        total: (refreshed.total ?? 0) / 100,
      })
      .eq("id", order.id);

    return json(200, {
      invoice_id: refreshed.id,
      invoice_url: refreshed.hosted_invoice_url,
      status: refreshed.status,
      tax: (refreshed.tax ?? 0) / 100,
      total: (refreshed.total ?? 0) / 100,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    console.error("create-stripe-invoice error:", msg);
    return json(400, { error: msg });
  }
});
