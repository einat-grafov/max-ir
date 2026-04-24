import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const { sessionId, environment } = (await req.json()) as {
      sessionId?: string;
      environment?: StripeEnv;
    };

    if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      return json(400, { error: "Invalid sessionId" });
    }
    if (environment !== "sandbox" && environment !== "live") {
      return json(400, { error: "Invalid environment" });
    }

    const stripe = createStripeClient(environment);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return json(200, {
      paymentStatus: session.payment_status, // "paid" | "unpaid" | "no_payment_required"
      status: session.status, // "open" | "complete" | "expired"
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email || session.customer_email || null,
    });
  } catch (e) {
    console.error("verify-checkout-session error", e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return json(500, { error: msg });
  }
});
