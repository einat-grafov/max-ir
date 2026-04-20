import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartItemPayload {
  productId: string;
  productName: string;
  variantName: string;
  sku?: string;
  price: number;
  quantity: number;
}

interface ShippingRatePayload {
  carrier: string;
  service: string;
  price: number;
  currency?: string;
  transitDays?: number;
}

interface ShippingAddressPayload {
  postalCode: string;
  country: string;
  city?: string;
  state?: string;
}

interface RequestBody {
  items: CartItemPayload[];
  shippingRate: ShippingRatePayload;
  shippingAddress: ShippingAddressPayload;
  successUrl: string;
  cancelUrl: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as RequestBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!body.shippingRate || typeof body.shippingRate.price !== "number") {
      return new Response(
        JSON.stringify({ error: "A shipping rate is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!body.successUrl || !body.cancelUrl) {
      return new Response(
        JSON.stringify({ error: "successUrl and cancelUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
    const currency = (body.shippingRate.currency || "usd").toLowerCase();

    const lineItems = body.items.map((item) => {
      const variantSuffix =
        item.variantName && item.variantName !== item.productName
          ? ` — ${item.variantName}`
          : "";
      const description = item.sku ? `SKU: ${item.sku}` : undefined;
      return {
        quantity: Math.max(1, Math.floor(item.quantity)),
        price_data: {
          currency,
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: `${item.productName}${variantSuffix}`,
            ...(description ? { description } : {}),
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: `${body.shippingRate.carrier} — ${body.shippingRate.service}`,
            fixed_amount: {
              amount: Math.round(body.shippingRate.price * 100),
              currency,
            },
            ...(body.shippingRate.transitDays
              ? {
                  delivery_estimate: {
                    minimum: { unit: "business_day", value: body.shippingRate.transitDays },
                    maximum: { unit: "business_day", value: body.shippingRate.transitDays },
                  },
                }
              : {}),
          },
        },
      ],
      metadata: {
        shipping_carrier: body.shippingRate.carrier,
        shipping_service: body.shippingRate.service,
        shipping_postal: body.shippingAddress.postalCode,
        shipping_country: body.shippingAddress.country,
        shipping_city: body.shippingAddress.city || "",
        shipping_state: body.shippingAddress.state || "",
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, id: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("create-checkout-session error", e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
