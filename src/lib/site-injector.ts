/**
 * Site Injector
 * ----------------
 * Loads enabled rows from `site_integrations` and `custom_code_snippets`,
 * then registers each one with the existing consent-gated-scripts registry.
 *
 * Necessary-tier scripts inject immediately (always-on).
 * Functional / Analytics / Marketing scripts inject only after the visitor
 * accepts the matching cookie banner category.
 */

import { supabase } from "@/integrations/supabase/client";
import {
  registerScript,
  applyConsent,
  type GatedScript,
} from "@/lib/consent-gated-scripts";
import { getStoredConsent } from "@/lib/consent-storage";
import {
  getDefinition,
  toRuntimeCategory,
  type ConsentCategory,
} from "@/lib/integrations-catalog";

const NECESSARY_TAG = "__necessary__" as const;

let started = false;

export async function startSiteInjector(): Promise<void> {
  if (started) return;
  started = true;

  try {
    const [{ data: integrations }, { data: snippets }] = await Promise.all([
      supabase
        .from("site_integrations")
        .select("provider,enabled,config,consent_category")
        .eq("enabled", true),
      supabase
        .from("custom_code_snippets")
        .select("id,name,code,location,consent_category,enabled,sort_order")
        .eq("enabled", true)
        .order("sort_order", { ascending: true }),
    ]);

    // Register integrations
    for (const row of integrations ?? []) {
      const def = getDefinition(row.provider);
      if (!def) continue;
      const cfg = (row.config ?? {}) as Record<string, string>;
      const built = def.buildScript(cfg);
      if (!built.src && !built.inline) continue;

      const consent = (row.consent_category as ConsentCategory) || def.defaultConsent;
      const runtime = toRuntimeCategory(consent);

      const script: GatedScript = {
        id: `integration:${row.provider}`,
        // For "necessary", we still need a runtime category to inject through
        // the registry; we treat it as "functional" but flag it always-allowed
        // via a synthetic-allow path below. To keep the existing system simple,
        // necessary scripts are registered as "functional" but injected eagerly
        // by calling applyConsent with a synthetic accept-all for them.
        category: runtime ?? "functional",
        src: built.src,
        inline: built.inline,
        attributes: { [`data-injected-by`]: `integration` },
      };
      registerScript(script);

      if (!runtime) {
        // Mark as always-on by tagging the id; we'll force-inject below.
        (script as GatedScript & { __alwaysOn?: boolean }).__alwaysOn = true;
      }
    }

    // Register snippets
    for (const row of snippets ?? []) {
      const code = (row.code || "").trim();
      if (!code) continue;
      const consent = (row.consent_category as ConsentCategory) || "necessary";
      const runtime = toRuntimeCategory(consent);

      const script: GatedScript = {
        id: `snippet:${row.id}`,
        category: runtime ?? "functional",
        // Wrap raw HTML/JS as inline. If the user pasted full <script> tags,
        // strip the wrapper so it executes inside our injected <script>.
        inline: stripScriptTags(code),
        attributes: {
          "data-snippet-name": row.name,
          "data-snippet-location": row.location,
        },
      };
      registerScript(script);

      if (!runtime) {
        (script as GatedScript & { __alwaysOn?: boolean }).__alwaysOn = true;
      }
    }
  } catch (err) {
    console.warn("[site-injector] Failed to load integrations/snippets", err);
  }

  // Apply current consent so anything functional/analytics/marketing
  // either fires now (if previously accepted) or waits for user action.
  const stored = getStoredConsent();
  applyConsent(stored ? stored.current.choices : null);

  // For "necessary" items, force them on regardless of consent state.
  forceInjectAlwaysOn();
}

function forceInjectAlwaysOn(): void {
  // Re-applying with a synthetic choice that allows everything triggers
  // injection of items the user might not have consented to. Instead, we
  // narrowly handle this by simulating accept for ONLY the always-on
  // registered scripts: we momentarily give them the "functional" tag,
  // call applyConsent with functional accepted, then restore.
  // To keep the system clean and predictable, we instead read from the
  // registry directly and inject manually.
  // (The registry already handles dedupe via injectedScriptIds.)
  
  const allScripts = (window as any).__GATED_SCRIPTS_REGISTRY__ || [];
  const alwaysOn = allScripts.filter((s: any) => s.__alwaysOn);
  
  alwaysOn.forEach((script: any) => {
    const el = document.createElement('script');
    if (script.src) el.src = script.src;
    if (script.inline) el.text = script.inline;
    Object.entries(script.attributes || {}).forEach(([k, v]) => el.setAttribute(k, v as string));
    document.head.appendChild(el);
  });
}

function stripScriptTags(code: string): string {
  const trimmed = code.trim();
  // Only unwrap if the entire snippet is one <script>…</script> block.
  const m = trimmed.match(/^<script\b[^>]*>([\s\S]*)<\/script>\s*$/i);
  if (m) return m[1];
  // For mixed HTML+JS, leave as-is. The browser won't execute <script> tags
  // injected via .text, so we coerce inline JS only. For HTML markup like
  // <noscript> pixels, document.write is unsafe — admins should prefer JS.
  // We strip any leading/trailing wrapper just in case.
  return trimmed;
}
