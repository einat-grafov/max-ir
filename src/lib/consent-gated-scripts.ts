/**
 * Consent-gated script loader for GDPR/ePrivacy compliance.
 *
 * USAGE:
 * Register every third-party script via `registerScript()`. Scripts are
 * injected only AFTER the user has consented to the relevant category.
 * Withdrawing consent removes the script and clears its cookies/storage.
 *
 * DO NOT add tracking scripts directly to index.html, App.tsx, or any
 * component. All third-party scripts that set cookies or contact
 * third-party domains must go through this registry.
 */

import { useEffect } from "react";
import {
  getStoredConsent,
  type ConsentChoices,
} from "@/lib/consent-storage";

// ============================================================================
// Types
// ============================================================================

export type ScriptCategory = "functional" | "analytics" | "advertising";

export type GatedScript = {
  id: string;
  category: ScriptCategory;
  src?: string;
  inline?: string;
  attributes?: Record<string, string>;
  cookiePatterns?: RegExp[];
  storagePatterns?: RegExp[];
};

// ============================================================================
// Internal state
// ============================================================================

const registry: GatedScript[] = [];
const injectedScriptIds = new Set<string>();
let consentListenerAttached = false;

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

// ============================================================================
// Registry
// ============================================================================

export function registerScript(script: GatedScript): void {
  const existingIndex = registry.findIndex((s) => s.id === script.id);
  if (existingIndex >= 0) {
    registry[existingIndex] = script;
  } else {
    registry.push(script);
  }
}

export function getRegisteredScripts(): GatedScript[] {
  return [...registry];
}

// ============================================================================
// Cookie / storage clearing helpers
// ============================================================================

function clearCookie(name: string): void {
  if (!isBrowser()) return;
  try {
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const hostname = window.location.hostname;
    const domains = ["", hostname, `.${hostname}`];
    // Also strip subdomains progressively (e.g., a.b.example.com -> .b.example.com, .example.com)
    const parts = hostname.split(".");
    for (let i = 1; i < parts.length - 1; i++) {
      domains.push(`.${parts.slice(i).join(".")}`);
    }
    for (const domain of domains) {
      const domainSegment = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; ${expires}; path=/${domainSegment}`;
    }
  } catch (err) {
    console.warn(
      "[consent-gated-scripts] Failed to clear cookie",
      name,
      err,
    );
  }
}

function clearMatchingCookies(patterns: RegExp[]): void {
  if (!isBrowser() || patterns.length === 0) return;
  try {
    const cookieHeader = document.cookie || "";
    const names = cookieHeader
      .split(";")
      .map((c) => c.trim().split("=")[0])
      .filter(Boolean);
    for (const name of names) {
      if (patterns.some((p) => p.test(name))) {
        clearCookie(name);
      }
    }
  } catch (err) {
    console.warn("[consent-gated-scripts] Failed to scan cookies", err);
  }
}

function clearMatchingStorage(patterns: RegExp[]): void {
  if (!isBrowser() || patterns.length === 0) return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) keys.push(key);
      }
      for (const key of keys) {
        if (patterns.some((p) => p.test(key))) {
          try {
            storage.removeItem(key);
          } catch (err) {
            console.warn(
              "[consent-gated-scripts] Failed to remove storage key",
              key,
              err,
            );
          }
        }
      }
    } catch (err) {
      console.warn("[consent-gated-scripts] Failed to scan storage", err);
    }
  }
}

// ============================================================================
// Injection / removal
// ============================================================================

function createTaggedScript(scriptId: string): HTMLScriptElement {
  const el = document.createElement("script");
  el.setAttribute("data-consent-script-id", scriptId);
  return el;
}

function runInline(script: GatedScript): void {
  if (!script.inline) return;
  try {
    const inlineEl = createTaggedScript(script.id);
    inlineEl.text = script.inline;
    document.head.appendChild(inlineEl);
  } catch (err) {
    console.warn(
      "[consent-gated-scripts] Failed to inject inline block",
      script.id,
      err,
    );
  }
}

function injectScript(script: GatedScript): void {
  if (!isBrowser()) return;
  if (injectedScriptIds.has(script.id)) return;

  try {
    if (script.src) {
      const el = createTaggedScript(script.id);
      el.src = script.src;
      el.async = true;
      if (script.attributes) {
        for (const [k, v] of Object.entries(script.attributes)) {
          el.setAttribute(k, v);
        }
      }
      if (script.inline) {
        el.onload = () => runInline(script);
      }
      document.head.appendChild(el);
    } else if (script.inline) {
      runInline(script);
    } else {
      console.warn(
        "[consent-gated-scripts] Script has neither src nor inline",
        script.id,
      );
      return;
    }

    injectedScriptIds.add(script.id);
  } catch (err) {
    console.warn(
      "[consent-gated-scripts] Failed to inject script",
      script.id,
      err,
    );
  }
}

function removeScript(script: GatedScript): void {
  if (!isBrowser()) return;
  try {
    const nodes = document.querySelectorAll(
      `script[data-consent-script-id="${script.id}"]`,
    );
    nodes.forEach((node) => node.parentNode?.removeChild(node));
  } catch (err) {
    console.warn(
      "[consent-gated-scripts] Failed to remove script tags",
      script.id,
      err,
    );
  }

  if (script.cookiePatterns?.length) {
    clearMatchingCookies(script.cookiePatterns);
  }
  if (script.storagePatterns?.length) {
    clearMatchingStorage(script.storagePatterns);
  }

  injectedScriptIds.delete(script.id);
}

// ============================================================================
// Apply consent
// ============================================================================

export function applyConsent(choices: ConsentChoices | null): void {
  if (!isBrowser()) return;
  for (const script of registry) {
    if (!choices) {
      removeScript(script);
      continue;
    }
    const allowed = choices[script.category] === true;
    if (allowed) {
      injectScript(script);
    } else {
      removeScript(script);
    }
  }
}

// ============================================================================
// Auto-apply
// ============================================================================

export function initConsentGatedScripts(): void {
  if (!isBrowser()) return;
  const stored = getStoredConsent();
  applyConsent(stored ? stored.current.choices : null);

  if (consentListenerAttached) return;
  consentListenerAttached = true;

  window.addEventListener("maxir:consent-changed", (event: Event) => {
    const detail = (event as CustomEvent<ConsentChoices | null>).detail;
    applyConsent(detail ?? null);
  });
}

// ============================================================================
// React hook
// ============================================================================

export function useRegisterScript(script: GatedScript): void {
  useEffect(() => {
    registerScript(script);
    const stored = getStoredConsent();
    applyConsent(stored ? stored.current.choices : null);
    // Intentionally re-run only when the script id changes; the rest of the
    // script object is treated as stable for the lifetime of the registration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script.id]);
}
