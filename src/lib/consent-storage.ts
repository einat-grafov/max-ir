import { useEffect, useState } from "react";
import { CONSENT_VERSION } from "@/lib/cookie-inventory";

// ============================================================================
// Types
// ============================================================================

export type ConsentChoices = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
};

export type ConsentMechanism =
  | "banner_accept_all"
  | "banner_reject_all"
  | "preferences_save"
  | "preferences_accept_all"
  | "preferences_reject_all"
  | "withdrawal_re_prompt"
  | "gpc_auto_opt_out";

export type ConsentRecord = {
  timestamp: string;
  choices: ConsentChoices;
  version: number;
  mechanism: ConsentMechanism;
};

export type StoredConsent = {
  current: ConsentRecord;
  expiresAt: string;
};

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "maxir_consent_state";
const AUDIT_KEY = "maxir_consent_audit_log";
const CONSENT_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000; // 12 months
const CONSENT_EVENT = "maxir:consent-changed";
const AUDIT_LOG_CAP = 50;

// ============================================================================
// Internal helpers
// ============================================================================

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const dispatchConsentChanged = (detail: ConsentChoices | null): void => {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent<ConsentChoices | null>(CONSENT_EVENT, { detail }),
    );
  } catch (err) {
    console.warn("[consent-storage] Failed to dispatch consent event", err);
  }
};

// ============================================================================
// Core functions
// ============================================================================

export function getStoredConsent(): StoredConsent | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.current ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }
    if (typeof parsed.current.version !== "number") return null;
    if (parsed.current.version < CONSENT_VERSION) return null;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) return null;
    return parsed;
  } catch (err) {
    console.warn("[consent-storage] Failed to read stored consent", err);
    return null;
  }
}

export function saveConsent(
  choices: ConsentChoices,
  mechanism: ConsentMechanism,
): ConsentRecord {
  const now = new Date();
  const record: ConsentRecord = {
    timestamp: now.toISOString(),
    choices,
    version: CONSENT_VERSION,
    mechanism,
  };

  if (!isBrowser()) {
    return record;
  }

  try {
    const stored: StoredConsent = {
      current: record,
      expiresAt: new Date(now.getTime() + CONSENT_LIFETIME_MS).toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.warn("[consent-storage] Failed to persist consent", err);
  }

  appendAuditEntry(record);
  dispatchConsentChanged(choices);

  return record;
}

export function clearConsent(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("[consent-storage] Failed to clear consent", err);
  }
  dispatchConsentChanged(null);
}

// ============================================================================
// Audit log
// ============================================================================

export function appendAuditEntry(record: ConsentRecord): void {
  if (!isBrowser()) return;
  try {
    const log = getAuditLog();
    log.push(record);
    const trimmed =
      log.length > AUDIT_LOG_CAP ? log.slice(log.length - AUDIT_LOG_CAP) : log;
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("[consent-storage] Failed to append audit entry", err);
  }
}

export function getAuditLog(): ConsentRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ConsentRecord[];
  } catch (err) {
    console.warn("[consent-storage] Failed to read audit log", err);
    return [];
  }
}

// ============================================================================
// Helpers
// ============================================================================

export function allAcceptedChoices(): ConsentChoices {
  return {
    necessary: true,
    functional: true,
    analytics: true,
    advertising: true,
  };
}

export function allRejectedChoices(): ConsentChoices {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    advertising: false,
  };
}

// ============================================================================
// React hook
// ============================================================================

export function useConsent() {
  const [consent, setConsent] = useState<ConsentChoices | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored ? stored.current.choices : null);
    setLoaded(true);

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ConsentChoices | null>).detail;
      setConsent(detail ?? null);
    };

    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const save = (choices: ConsentChoices, mechanism: ConsentMechanism) => {
    saveConsent(choices, mechanism);
    setConsent(choices);
  };

  const clear = () => {
    clearConsent();
    setConsent(null);
  };

  return { consent, loaded, save, clear };
}
