/**
 * Region detection for cookie compliance.
 *
 * Uses timezone as a proxy for legal jurisdiction — no IP geolocation API,
 * no network calls, no third-party dependency. This is less accurate than
 * IP-based geolocation but has no privacy cost of its own.
 *
 * On failure, defaults to "eu" — the most restrictive regime. Over-protecting
 * is cheap; under-protecting is a regulatory fine.
 */

// ============================================================================
// Types
// ============================================================================

export type LegalRegion = "eu" | "uk" | "california" | "us_other" | "other";

export type BannerPolicy = {
  showBanner: boolean;
  defaultToOptOut: boolean;
  requiresOptIn: boolean;
  showDoNotSellLink: boolean;
};

// ============================================================================
// Timezone lookup tables
// ============================================================================

const EU_TIMEZONES = new Set<string>([
  "Europe/Amsterdam",
  "Europe/Athens",
  "Europe/Berlin",
  "Europe/Bratislava",
  "Europe/Brussels",
  "Europe/Bucharest",
  "Europe/Budapest",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Lisbon",
  "Europe/Ljubljana",
  "Europe/Luxembourg",
  "Europe/Madrid",
  "Europe/Malta",
  "Europe/Nicosia",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Riga",
  "Europe/Rome",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Tallinn",
  "Europe/Vaduz",
  "Europe/Vienna",
  "Europe/Vilnius",
  "Europe/Warsaw",
  "Europe/Zagreb",
  // EEA non-EU:
  "Europe/Oslo",
  "Atlantic/Reykjavik",
  // Iceland and Norway timezones
]);

const UK_TIMEZONES = new Set<string>([
  "Europe/London",
  "Europe/Belfast",
  "Europe/Guernsey",
  "Europe/Isle_of_Man",
  "Europe/Jersey",
]);

const CALIFORNIA_TIMEZONES = new Set<string>([
  "America/Los_Angeles",
]);

const US_OTHER_TIMEZONES = new Set<string>([
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Anchorage",
  "America/Detroit",
  "America/Indiana/Indianapolis",
  "America/Kentucky/Louisville",
  "America/Boise",
  "America/Juneau",
  "America/Sitka",
  "America/Metlakatla",
  "America/Yakutat",
  "America/Nome",
  "America/Adak",
  "Pacific/Honolulu",
]);

// ============================================================================
// Detection
// ============================================================================

export function detectRegion(): LegalRegion {
  if (typeof Intl === "undefined") return "other";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return "eu";
    if (EU_TIMEZONES.has(tz)) return "eu";
    if (UK_TIMEZONES.has(tz)) return "uk";
    if (CALIFORNIA_TIMEZONES.has(tz)) return "california";
    if (US_OTHER_TIMEZONES.has(tz)) return "us_other";
    return "other";
  } catch (err) {
    console.warn("[geo-region] Failed to detect region", err);
    return "eu";
  }
}

// ============================================================================
// GPC detection
// ============================================================================

export function hasGpcSignal(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    return (
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true
    );
  } catch (err) {
    console.warn("[geo-region] Failed to read GPC signal", err);
    return false;
  }
}

// ============================================================================
// Banner policy
// ============================================================================

export function getBannerPolicy(
  region: LegalRegion,
  gpc: boolean,
): BannerPolicy {
  if (gpc) {
    return {
      showBanner: false,
      defaultToOptOut: true,
      requiresOptIn: region === "eu" || region === "uk",
      showDoNotSellLink: region === "california" || region === "us_other",
    };
  }

  if (region === "eu" || region === "uk") {
    return {
      showBanner: true,
      defaultToOptOut: false,
      requiresOptIn: true,
      showDoNotSellLink: false,
    };
  }

  if (region === "california" || region === "us_other") {
    return {
      showBanner: true,
      defaultToOptOut: false,
      requiresOptIn: false,
      showDoNotSellLink: true,
    };
  }

  return {
    showBanner: true,
    defaultToOptOut: false,
    requiresOptIn: false,
    showDoNotSellLink: false,
  };
}
