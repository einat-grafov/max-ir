type CookieEntry = {
  name: string;
  category: "necessary" | "functional" | "analytics" | "advertising";
  provider: string;
  purpose: string;
  duration: string;
  domain: "first-party" | "third-party";
};

export const COOKIE_INVENTORY: CookieEntry[] = [
  // NECESSARY
  {
    name: "consent_state",
    category: "necessary",
    provider: "Max-IR Labs",
    purpose: "Stores the user's cookie consent choices",
    duration: "12 months",
    domain: "first-party",
  },
  {
    name: "sb-access-token",
    category: "necessary",
    provider: "Supabase",
    purpose: "Authenticates logged-in users (customers and admin)",
    duration: "Session",
    domain: "first-party",
  },
  {
    name: "sb-refresh-token",
    category: "necessary",
    provider: "Supabase",
    purpose: "Refreshes the authentication session",
    duration: "Session",
    domain: "first-party",
  },
  {
    name: "cart_state",
    category: "necessary",
    provider: "Max-IR Labs",
    purpose: "Persists the shopping cart contents between page loads",
    duration: "Session",
    domain: "first-party",
  },
  {
    name: "__stripe_mid",
    category: "necessary",
    provider: "Stripe",
    purpose: "Fraud prevention and secure checkout",
    duration: "1 year",
    domain: "third-party",
  },
  {
    name: "__stripe_sid",
    category: "necessary",
    provider: "Stripe",
    purpose: "Fraud prevention during the current checkout session",
    duration: "30 minutes",
    domain: "third-party",
  },
  // FUNCTIONAL — none in use today
  // ANALYTICS — none in use today (category ready for future use)
  // ADVERTISING — none in use today (category ready for future use)
];

export const CONSENT_CATEGORIES = ["necessary", "functional", "analytics", "advertising"] as const;

export const CATEGORY_LABELS: Record<CookieEntry["category"], { label: string; description: string }> = {
  necessary: {
    label: "Strictly Necessary",
    description:
      "Required for the site to function — authentication, shopping cart, checkout security, and remembering your cookie choices. Cannot be disabled.",
  },
  functional: {
    label: "Functional",
    description:
      "Remember your preferences (such as language or region) to improve your experience. Currently none in use.",
  },
  analytics: {
    label: "Analytics",
    description:
      "Help us understand how visitors use the site so we can improve it. Currently none in use.",
  },
  advertising: {
    label: "Advertising",
    description:
      "Used to show you relevant ads and measure ad campaign effectiveness. Currently none in use.",
  },
};

export const CONSENT_VERSION = 1;
