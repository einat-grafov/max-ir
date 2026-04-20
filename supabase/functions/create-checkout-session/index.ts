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

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json(500, { error: "Stripe is not configured" });

    const body = (await req.json()) as RequestBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return json(400, { error: "Cart is empty" });
    }
    if (!body.shippingRate || typeof body.shippingRate.price !== "number") {
      return json(400, { error: "A shipping rate is required" });
    }
    if (!body.successUrl || !body.cancelUrl) {
      return json(400, { error: "successUrl and cancelUrl are required" });
    }

    const currency = (body.shippingRate.currency || "usd").toLowerCase();

    // Build x-www-form-urlencoded params for Stripe REST API
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", body.successUrl);
    params.append("cancel_url", body.cancelUrl);

    body.items.forEach((item, i) => {
      const variantSuffix =
        item.variantName && item.variantName !== item.productName
          ? ` — ${item.variantName}`
          : "";
      params.append(`line_items[${i}][quantity]`, String(Math.max(1, Math.floor(item.quantity))));
      params.append(`line_items[${i}][price_data][currency]`, currency);
      params.append(`line_items[${i}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
      params.append(`line_items[${i}][price_data][product_data][name]`, `${item.productName}${variantSuffix}`);
      if (item.sku) {
        params.append(`line_items[${i}][price_data][product_data][description]`, `SKU: ${item.sku}`);
      }
    });

    // Shipping option
    const shippingPrefix = "shipping_options[0][shipping_rate_data]";
    params.append(`${shippingPrefix}[type]`, "fixed_amount");
    params.append(
      `${shippingPrefix}[display_name]`,
      `${body.shippingRate.carrier} — ${body.shippingRate.service}`,
    );
    params.append(`${shippingPrefix}[fixed_amount][amount]`, String(Math.round(body.shippingRate.price * 100)));
    params.append(`${shippingPrefix}[fixed_amount][currency]`, currency);
    if (body.shippingRate.transitDays) {
      params.append(`${shippingPrefix}[delivery_estimate][minimum][unit]`, "business_day");
      params.append(`${shippingPrefix}[delivery_estimate][minimum][value]`, String(body.shippingRate.transitDays));
      params.append(`${shippingPrefix}[delivery_estimate][maximum][unit]`, "business_day");
      params.append(`${shippingPrefix}[delivery_estimate][maximum][value]`, String(body.shippingRate.transitDays));
    }

    // Metadata
    params.append("metadata[shipping_carrier]", body.shippingRate.carrier);
    params.append("metadata[shipping_service]", body.shippingRate.service);
    params.append("metadata[shipping_postal]", body.shippingAddress.postalCode);
    params.append("metadata[shipping_country]", body.shippingAddress.country);
    if (body.shippingAddress.city) params.append("metadata[shipping_city]", body.shippingAddress.city);
    if (body.shippingAddress.state) params.append("metadata[shipping_state]", body.shippingAddress.state);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Stripe error", data);
      return json(res.status, { error: data?.error?.message || "Stripe API error" });
    }

    return json(200, { url: data.url, id: data.id });
  } catch (e) {
    console.error("create-checkout-session error", e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return json(500, { error: msg });
  }
});
