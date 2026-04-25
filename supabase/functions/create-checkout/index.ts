import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient } from "../_shared/stripe.ts";

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
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const PRICE_ID_RE = /^price_[A-Za-z0-9]+$/;

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
    if (body.customerEmail && !isEmail(body.customerEmail)) {
      return json(400, { error: "Invalid customerEmail" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const productIds = Array.from(new Set(body.items.map((i) => i.productId)));
    const { data: rows, error: lookupErr } = await supabase
      .from("products")
      .select("id, name, stock, variants, stripe_price_id")
      .in("id", productIds);
    if (lookupErr) {
      console.error("product lookup failed", lookupErr);
      return json(500, { error: "Could not load products" });
    }
    const productMap = new Map<string, { name: string; stock: number; variants: any[]; stripePriceId: string | null }>();
    for (const r of rows ?? []) {
      productMap.set(r.id as string, {
        name: r.name as string,
        stock: (r.stock as number) ?? 0,
        variants: Array.isArray(r.variants) ? (r.variants as any[]) : [],
        stripePriceId: (r.stripe_price_id as string | null) ?? null,
      });
    }

    // Validate stock per product+variant
    const requested = new Map<string, number>();
    for (const i of body.items) {
      const key = `${i.productId}::${i.variantName ?? ""}`;
      requested.set(key, (requested.get(key) ?? 0) + i.quantity);
    }
    for (const [key, qty] of requested.entries()) {
      const [pid, variantName] = key.split("::");
      const row = productMap.get(pid);
      if (!row) return json(400, { error: `Product ${pid} not found` });

      let availableStock = row.stock;
      let displayName = row.name;
      if (variantName) {
        const variant = row.variants.find((v: any) => (v?.name ?? "") === variantName);
        if (variant) {
          availableStock = Number(variant.stock ?? 0);
          displayName = `${row.name} – ${variantName}`;
        }
      }

      if (availableStock < qty) {
        return json(409, {
          error: `Only ${availableStock} unit${availableStock === 1 ? "" : "s"} of "${displayName}" available`,
        });
      }
    }

    // Validate Stripe price IDs from DB (not client)
    for (const pid of productIds) {
      const row = productMap.get(pid);
      if (!row) return json(400, { error: `Product ${pid} not found` });
      if (!row.stripePriceId || !PRICE_ID_RE.test(row.stripePriceId)) {
        return json(400, {
          error: `Product "${row.name}" is missing a valid Stripe Price ID. Set it in admin → product → Stripe Price ID (must start with "price_").`,
        });
      }
    }

    const stripe = createStripeClient();
    const currency = (body.shippingRate.currency || "usd").toLowerCase();

    const lineItems = body.items.map((item) => {
      const row = productMap.get(item.productId)!;
      return {
        price: row.stripePriceId!,
        quantity: Math.max(1, Math.floor(item.quantity)),
      };
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      return_url: body.returnUrl,
      line_items: lineItems,
      automatic_tax: { enabled: true },
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
        // Map back to internal product/variant identity in webhook (no prices trusted from here).
        cart_items: JSON.stringify(
          body.items.map((i) => ({
            id: i.productId,
            n: i.productName,
            v: i.variantName,
            s: i.sku,
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
