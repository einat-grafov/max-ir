import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingAddress {
  postalCode: string;
  country: string;
  city?: string;
  state?: string;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  price: number;
  currency: string;
  transitDays?: number;
  error?: string;
}

interface PackageInfo {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

const ORIGIN_ADDRESS: ShippingAddress = {
  postalCode: "7610001",
  country: "IL",
  city: "Rehovot",
};

export const useShippingRates = () => {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(
    async (
      destination: ShippingAddress,
      packages: PackageInfo[] = [{ weight: 1 }],
      origin?: ShippingAddress
    ) => {
      setLoading(true);
      setError(null);
      setRates([]);

      // Test address: postal code "00000" returns a free shipping rate
      // for end-to-end checkout testing without needing a real carrier quote.
      if (destination.postalCode?.trim() === "00000") {
        const testRate: ShippingRate = {
          carrier: "Test",
          service: "Free Test Shipping",
          price: 0,
          currency: "USD",
          transitDays: 1,
        };
        setRates([testRate]);
        setLoading(false);
        return [testRate];
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "shipping-rates",
          {
            body: {
              action: "rates",
              origin: origin || ORIGIN_ADDRESS,
              destination,
              packages,
            },
          }
        );
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        const validRates = (data?.rates || []).filter(
          (r: ShippingRate) => !r.error && r.price > 0
        );
        setRates(validRates);
        if (validRates.length === 0) {
          setError("No shipping rates available for this destination.");
        }
        return validRates as ShippingRate[];
      } catch (e: any) {
        const msg = e?.message || "Failed to fetch shipping rates";
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setRates([]);
    setError(null);
    setLoading(false);
  }, []);

  return { rates, loading, error, fetchRates, reset };
};
