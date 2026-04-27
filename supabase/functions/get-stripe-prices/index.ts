import { createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const PRICE_ID_RE = /^price_[A-Za-z0-9]+$/;

interface ReqBody {
  priceIds: string[];
}

interface PriceInfo {
  id: string;
  unitAmount: number; // dollars
  currency: string;
  active: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const { priceIds } = (await req.json()) as ReqBody;
    if (!Array.isArray(priceIds)) return json(400, { error: "priceIds must be an array" });

    const unique = Array.from(new Set(priceIds.filter((p) => typeof p === "string" && PRICE_ID_RE.test(p))));
    if (unique.length === 0) return json(200, { prices: {} });

    const stripe = createStripeClient();
    const results: Record<string, PriceInfo> = {};

    await Promise.all(
      unique.map(async (id) => {
        try {
          const p = await stripe.prices.retrieve(id);
          results[id] = {
            id: p.id,
            unitAmount: (p.unit_amount ?? 0) / 100,
            currency: (p.currency ?? "usd").toLowerCase(),
            active: p.active,
          };
        } catch (err) {
          console.error("price retrieve failed", id, err);
        }
      }),
    );

    return json(200, { prices: results });
  } catch (e) {
    console.error("get-stripe-prices error", e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return json(500, { error: msg });
  }
});
