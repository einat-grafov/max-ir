// Proxy to Google PageSpeed Insights (keyless).
// Avoids CORS issues from the browser and lets us add caching/keys later.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const PSI_ENDPOINT =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function isHttpUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const target = url.searchParams.get("url") ?? "";
    const strategy = (url.searchParams.get("strategy") ?? "mobile").toLowerCase();

    if (!isHttpUrl(target)) {
      return new Response(
        JSON.stringify({ error: "Provide a valid http(s) URL in the 'url' query parameter." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (strategy !== "mobile" && strategy !== "desktop") {
      return new Response(
        JSON.stringify({ error: "strategy must be 'mobile' or 'desktop'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const psiUrl = new URL(PSI_ENDPOINT);
    psiUrl.searchParams.set("url", target);
    psiUrl.searchParams.set("strategy", strategy);
    for (const cat of ["performance", "accessibility", "best-practices", "seo"]) {
      psiUrl.searchParams.append("category", cat);
    }
    // Prefer the per-project key stored in integration_credentials; fall back to env.
    let apiKey = Deno.env.get("PAGESPEED_API_KEY") ?? "";
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && serviceKey) {
        const credRes = await fetch(
          `${supabaseUrl}/rest/v1/integration_credentials?provider=eq.pagespeed_insights&select=credentials,enabled&limit=1`,
          {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
            },
          },
        );
        if (credRes.ok) {
          const rows = await credRes.json();
          const row = Array.isArray(rows) ? rows[0] : null;
          if (row?.enabled !== false && row?.credentials?.api_key) {
            apiKey = String(row.credentials.api_key);
          }
        }
      }
    } catch (_) {
      // ignore lookup errors and fall back to env (or keyless)
    }
    if (apiKey) psiUrl.searchParams.set("key", apiKey);

    const psiRes = await fetch(psiUrl.toString());
    const data = await psiRes.json();

    if (!psiRes.ok) {
      const message =
        data?.error?.message ||
        `PageSpeed Insights returned HTTP ${psiRes.status}.`;
      return new Response(
        JSON.stringify({ error: message, status: psiRes.status }),
        { status: psiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
