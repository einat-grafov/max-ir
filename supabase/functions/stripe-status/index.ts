import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require an authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json(401, { error: "Unauthorized" });
    }

    const userId = claimsData.claims.sub;
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return json(403, { error: "Forbidden" });
    }

    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");

    if (!secretKey) {
      return json(200, {
        connected: false,
        mode: null,
        publishableKey: publishableKey || null,
        secretKeyMasked: null,
        account: null,
      });
    }

    const mode = secretKey.startsWith("sk_live_")
      ? "live"
      : secretKey.startsWith("sk_test_")
        ? "test"
        : "unknown";

    // Mask the secret key: keep prefix and last 4
    const maskKey = (k: string) => {
      if (k.length < 12) return "••••";
      const prefix = k.slice(0, 8);
      const suffix = k.slice(-4);
      return `${prefix}••••••••${suffix}`;
    };

    // Verify by calling /v1/account
    const accountRes = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const accountData = await accountRes.json();

    if (!accountRes.ok) {
      return json(200, {
        connected: false,
        mode,
        publishableKey: publishableKey ? maskKey(publishableKey) : null,
        secretKeyMasked: maskKey(secretKey),
        account: null,
        error: accountData?.error?.message || "Stripe key is invalid",
      });
    }

    return json(200, {
      connected: true,
      mode,
      publishableKey: publishableKey ? maskKey(publishableKey) : null,
      secretKeyMasked: maskKey(secretKey),
      account: {
        id: accountData.id,
        name: accountData.business_profile?.name || accountData.settings?.dashboard?.display_name || accountData.email || null,
        email: accountData.email || null,
        country: accountData.country || null,
        defaultCurrency: accountData.default_currency || null,
      },
    });
  } catch (e) {
    console.error("stripe-status error", e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return json(500, { error: msg });
  }
});
