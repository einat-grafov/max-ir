import { createStripeClient } from "../_shared/stripe.ts";

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

interface LineItemInput {
  amount: number; // in major units (e.g. dollars), pre-tax, post-discount applied
  reference: string;
  tax_behavior?: "exclusive" | "inclusive";
  tax_code?: string; // optional override
}

interface AddressInput {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string; // ISO-2
}

interface RequestBody {
  currency?: string;
  customer_address: AddressInput;
  line_items: LineItemInput[];
  shipping_cost?: number; // in major units
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  if (!body.customer_address?.country) {
    return json(400, { error: "customer_address.country is required" });
  }
  if (!Array.isArray(body.line_items) || body.line_items.length === 0) {
    return json(400, { error: "line_items required" });
  }

  const currency = (body.currency || "usd").toLowerCase();
  const stripe = createStripeClient();

  try {
    const calculation = await stripe.tax.calculations.create({
      currency,
      customer_details: {
        address: {
          line1: body.customer_address.line1 || undefined,
          line2: body.customer_address.line2 || undefined,
          city: body.customer_address.city || undefined,
          state: body.customer_address.state || undefined,
          postal_code: body.customer_address.postal_code || undefined,
          country: body.customer_address.country,
        },
        address_source: "shipping",
      },
      line_items: body.line_items.map((li) => ({
        amount: Math.round(li.amount * 100),
        reference: li.reference,
        tax_behavior: li.tax_behavior || "exclusive",
        tax_code: li.tax_code,
      })),
      shipping_cost:
        body.shipping_cost && body.shipping_cost > 0
          ? {
              amount: Math.round(body.shipping_cost * 100),
              tax_behavior: "exclusive",
            }
          : undefined,
    });

    return json(200, {
      tax_amount: (calculation.tax_amount_exclusive ?? 0) / 100,
      total: (calculation.amount_total ?? 0) / 100,
      currency: calculation.currency,
      breakdown: calculation.tax_breakdown ?? [],
      calculation_id: calculation.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe Tax error";
    console.error("calculate-tax error:", msg);
    return json(400, { error: msg });
  }
});
