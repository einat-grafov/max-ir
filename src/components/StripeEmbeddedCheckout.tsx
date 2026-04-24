import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/contexts/CartContext";
import type { ShippingRate } from "@/hooks/useShippingRates";
import { useMemo } from "react";

interface Props {
  items: (CartItem & { stripePriceId: string })[];
  shippingRate: ShippingRate;
  shippingAddress: {
    postalCode: string;
    country: string;
    city?: string;
    state?: string;
  };
  customerEmail?: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckoutInline({ items, shippingRate, shippingAddress, customerEmail, returnUrl }: Props) {
  const options = useMemo(
    () => ({
      fetchClientSecret: async (): Promise<string> => {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            items,
            shippingRate,
            shippingAddress,
            customerEmail,
            returnUrl,
            environment: getStripeEnvironment(),
          },
        });
        if (error || !data?.clientSecret) {
          throw new Error(error?.message || data?.error || "Failed to create checkout session");
        }
        return data.clientSecret;
      },
    }),
    // Re-create only when checkout inputs actually change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(items), JSON.stringify(shippingRate), JSON.stringify(shippingAddress), customerEmail, returnUrl],
  );

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
