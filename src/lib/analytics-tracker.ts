import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "maxir_session_id";

function getSessionId(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

async function send(payload: Record<string, unknown>) {
  try {
    await supabase.functions.invoke("track-event", {
      body: { ...payload, session_id: getSessionId() },
    });
  } catch {
    /* swallow */
  }
}

export function trackPageView(path: string) {
  // Don't track admin views
  if (path.startsWith("/admin") || path.startsWith("/auth")) return;
  void send({ kind: "page_view", path });
}

export function trackCommerce(
  event_type: "add_to_cart" | "reached_checkout" | "purchased",
  data: { order_id?: string; product_id?: string; amount?: number } = {}
) {
  void send({ kind: "commerce", event_type, ...data });
}
