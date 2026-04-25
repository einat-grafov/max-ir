import Stripe from "https://esm.sh/stripe@18.5.0";

const getEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key} is not configured`);
  return value;
};

export function createStripeClient(): Stripe {
  return new Stripe(getEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-03-31.basil",
    httpClient: Stripe.createFetchHttpClient(),
  });
}
