/**
 * Compliance scanner.
 *
 * Scans the live DOM for third-party scripts that are NOT registered
 * through the consent-gated-scripts system. This is a safety net — if
 * something slips past the registry (e.g., a <script> tag added via a
 * "necessary"-tagged snippet, or hardcoded into index.html by mistake),
 * it will show up here and be surfaced to the admin.
 */

const SCAN_REPORT_KEY = "maxir_compliance_scan_report";
const MAX_REPORT_AGE_MS = 24 * 60 * 60 * 1000; // 24h

// First-party / infrastructure domains that are expected and safe.
const KNOWN_SAFE_HOST_PATTERNS: RegExp[] = [
  /^(?:[\w-]+\.)?max-ir\.com$/i,
  /\.lovable\.app$/i,
  /\.lovable\.dev$/i,
  /\.supabase\.co$/i,
  /\.supabase\.in$/i,
  /js\.stripe\.com$/i,
  /r\.stripe\.com$/i,
  /m\.stripe\.network$/i,
  /\.cloudflarestorage\.com$/i,
  /\.r2\.dev$/i,
];

export type ComplianceFinding = {
  src: string;
  registered: boolean;
  consentGated: boolean;
  reason: string;
};

export type ComplianceReport = {
  timestamp: string;
  url: string;
  findings: ComplianceFinding[];
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isKnownSafe(host: string): boolean {
  return KNOWN_SAFE_HOST_PATTERNS.some((r) => r.test(host));
}

export function runComplianceScan(): ComplianceReport | null {
  if (!isBrowser()) return null;
  try {
    const findings: ComplianceFinding[] = [];
    const scripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>("script[src]"),
    );
    const currentOrigin = window.location.origin;

    for (const s of scripts) {
      const src = s.src;
      if (!src) continue;
      try {
        const u = new URL(src);
        // Skip first-party scripts (same origin as the site itself).
        if (u.origin === currentOrigin) continue;
        if (isKnownSafe(u.hostname)) continue;

        const registered = s.hasAttribute("data-consent-script-id");
        findings.push({
          src,
          registered,
          consentGated: registered,
          reason: registered
            ? "Third-party, registered with consent system — OK"
            : "Third-party script loaded WITHOUT going through the consent-gated-scripts registry. May violate GDPR if it tracks users.",
        });
      } catch {
        // Invalid URL — skip.
      }
    }

    const report: ComplianceReport = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      findings,
    };

    try {
      window.localStorage.setItem(SCAN_REPORT_KEY, JSON.stringify(report));
    } catch {
      // localStorage may be full or blocked — not fatal.
    }

    // Log unregistered findings to console for developer visibility.
    const unregistered = findings.filter((f) => !f.registered);
    if (unregistered.length > 0) {
      console.warn(
        "[compliance-scanner] Found",
        unregistered.length,
        "unregistered third-party script(s):",
        unregistered.map((f) => f.src),
      );
    }

    return report;
  } catch (err) {
    console.warn("[compliance-scanner] Scan failed", err);
    return null;
  }
}

export function getLastComplianceReport(): ComplianceReport | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SCAN_REPORT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ComplianceReport;
    if (!parsed || !parsed.timestamp) return null;
    const age = Date.now() - new Date(parsed.timestamp).getTime();
    if (age > MAX_REPORT_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}
