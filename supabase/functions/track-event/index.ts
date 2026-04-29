import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (body.kind === "page_view") {
      const ip =
        (req.headers.get("cf-connecting-ip") ||
          req.headers.get("x-forwarded-for")?.split(",")[0] ||
          "").trim();

      let country: string | null = req.headers.get("cf-ipcountry-name");
      let country_code: string | null =
        req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country");

      if (!country && ip) {
        try {
          const r = await fetch(`https://ipapi.co/${ip}/json/`);
          if (r.ok) {
            const j = await r.json();
            country = j.country_name || country;
            country_code = j.country_code || country_code;
          }
        } catch (_) { /* ignore */ }
      }

      await supabase.from("page_views").insert({
        session_id: body.session_id ?? null,
        path: body.path ?? null,
        country: country ?? null,
        country_code: country_code ?? null,
      });
    } else if (body.kind === "commerce") {
      const allowed = ["add_to_cart", "reached_checkout", "purchased"];
      if (!allowed.includes(body.event_type)) {
        return new Response(JSON.stringify({ error: "invalid event_type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("commerce_events").insert({
        event_type: body.event_type,
        session_id: body.session_id ?? null,
        order_id: body.order_id ?? null,
        product_id: body.product_id ?? null,
        amount: typeof body.amount === "number" ? body.amount : 0,
      });
    } else {
      return new Response(JSON.stringify({ error: "unknown kind" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
