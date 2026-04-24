import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartItem {
  productId: string;
  productName: string;
  variantName?: string;
  sku?: string;
  stripePriceId: string;
  price: number;
  quantity: number;
}

interface ShippingRate {
  carrier: string;
  service: string;
  price: number;
  currency?: string;
  transitDays?: number;
}

interface ShippingAddress {
  postalCode: string;
  country: string;
  city?: string;
  state?: string;
}

interface RequestBody {
  items: CartItem[];
  shippingRate: ShippingRate;
  shippingAddress: ShippingAddress;
  customerEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = (await req.json()) as RequestBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json(400, { error: "Cart is empty" });
    }
    if (!body.shippingRate || typeof body.shippingRate.price !== "number") {
      return json(400, { error: "A shipping rate is required" });
    }
    if (!body.returnUrl) return json(400, { error: "returnUrl is required" });
    if (body.environment !== "sandbox" && body.environment !== "live") {
      return json(400, { error: "Invalid environment" });
    }
    if (body.customerEmail && !isEmail(body.customerEmail)) {
      return json(400, { error: "Invalid customerEmail" });
    }

    // --- Pre-checkout stock validation ---------------------------------
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
    const { data: stockRows, error: stockErr } = await supabase
      .from("products")
      .select("id, name, stock")
      .in("id", productIds);
    if (stockErr) {
      console.error("stock lookup failed", stockErr);
      return json(500, { error: "Could not verify stock" });
    }
    const stockMap = new Map<string, { name: string; stock: number }>();
    for (const r of stockRows ?? []) {
      stockMap.set(r.id as string, {
        name: r.name as string,
        stock: (r.stock as number) ?? 0,
      });
    }
    // Sum requested quantity per product across line items
    const requested = new Map<string, number>();
    for (const i of body.items) {
      requested.set(i.productId, (requested.get(i.productId) ?? 0) + i.quantity);
    }
    for (const [pid, qty] of requested.entries()) {
      const row = stockMap.get(pid);
      if (!row) return json(400, { error: `Product ${pid} not found` });
      if (row.stock < qty) {
        return json(409, {
          error: `Only ${row.stock} unit${row.stock === 1 ? "" : "s"} of "${row.name}" available`,
        });
      }
    }

    const stripe = createStripeClient(body.environment);
    const currency = (body.shippingRate.currency || "usd").toLowerCase();

    // Resolve human-readable price IDs (lookup_keys) to Stripe price IDs
    const lookupKeys = Array.from(new Set(body.items.map((i) => i.stripePriceId).filter(Boolean)));
    if (lookupKeys.length === 0) return json(400, { error: "Items missing stripePriceId" });

    const prices = await stripe.prices.list({ lookup_keys: lookupKeys, limit: 100 });
    const priceMap = new Map<string, string>();
    for (const p of prices.data) {
      if (p.lookup_key) priceMap.set(p.lookup_key, p.id);
    }

    const lineItems = body.items.map((item) => {
      const stripePriceId = priceMap.get(item.stripePriceId);
      if (!stripePriceId) {
        throw new Error(`Price not found for ${item.stripePriceId}`);
      }
      return {
        price: stripePriceId,
        quantity: Math.max(1, Math.floor(item.quantity)),
      };
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      return_url: body.returnUrl,
      line_items: lineItems,
      // Tax: calculate & collect only — seller handles filing.
      automatic_tax: { enabled: true },
      // Required for tax calculation in the embedded form.
      billing_address_collection: "required",
      ...(body.customerEmail && { customer_email: body.customerEmail }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: `${body.shippingRate.carrier} — ${body.shippingRate.service}`,
            tax_behavior: "exclusive",
            fixed_amount: {
              amount: Math.round(body.shippingRate.price * 100),
              currency,
            },
            ...(body.shippingRate.transitDays && {
              delivery_estimate: {
                minimum: { unit: "business_day", value: body.shippingRate.transitDays },
                maximum: { unit: "business_day", value: body.shippingRate.transitDays },
              },
            }),
          },
        },
      ],
      metadata: {
        shipping_carrier: body.shippingRate.carrier,
        shipping_service: body.shippingRate.service,
        shipping_postal: body.shippingAddress.postalCode,
        shipping_country: body.shippingAddress.country,
        ...(body.shippingAddress.city && { shipping_city: body.shippingAddress.city }),
        ...(body.shippingAddress.state && { shipping_state: body.shippingAddress.state }),
        // Store cart line metadata so the webhook can build order_items + decrement stock
        cart_items: JSON.stringify(
          body.items.map((i) => ({
            id: i.productId,
            n: i.productName,
            v: i.variantName,
            s: i.sku,
            p: i.price,
            q: i.quantity,
          })),
        ),
      },
    });

    return json(200, { clientSecret: session.client_secret });
  } catch (e) {
    console.error("create-checkout error", e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return json(500, { error: msg });
  }
});
