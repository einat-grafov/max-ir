import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StripePriceInfo {
  id: string;
  unitAmount: number;
  currency: string;
  active: boolean;
}

/**
 * Fetches live prices from Stripe for the given price IDs.
 * Returns a map of price_id -> { unitAmount, currency, active }.
 * Stripe is the source of truth for pricing — DB prices are fallback only.
 */
export function useStripePrices(priceIds: string[]) {
  const ids = Array.from(new Set(priceIds.filter(Boolean))).sort();

  return useQuery({
    queryKey: ["stripe-prices", ids],
    enabled: ids.length > 0,
    staleTime: 60_000,
    queryFn: async (): Promise<Record<string, StripePriceInfo>> => {
      const { data, error } = await supabase.functions.invoke("get-stripe-prices", {
        body: { priceIds: ids },
      });
      if (error) throw error;
      return (data?.prices ?? {}) as Record<string, StripePriceInfo>;
    },
  });
}
