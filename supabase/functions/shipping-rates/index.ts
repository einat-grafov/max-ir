const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShipmentRequest {
  origin: { postalCode: string; country: string; city?: string; state?: string };
  destination: { postalCode: string; country: string; city?: string; state?: string };
  packages: Array<{ weight: number; length?: number; width?: number; height?: number }>;
  carriers?: ("fedex" | "ups")[];
}

interface RateResult {
  carrier: string;
  service: string;
  price: number;
  currency: string;
  transitDays?: number;
  error?: string;
}

// FedEx OAuth token
async function getFedExToken(apiKey: string, secretKey: string): Promise<string> {
  const res = await fetch("https://apis-sandbox.fedex.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
  });
  if (!res.ok) throw new Error(`FedEx auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// UPS OAuth token
async function getUPSToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch("https://wwwcie.ups.com/security/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`UPS auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function getFedExRates(token: string, accountNumber: string, req: ShipmentRequest): Promise<RateResult[]> {
  const body = {
    accountNumber: { value: accountNumber },
    requestedShipment: {
      shipper: { address: { postalCode: req.origin.postalCode, countryCode: req.origin.country } },
      recipient: { address: { postalCode: req.destination.postalCode, countryCode: req.destination.country } },
      pickupType: "DROPOFF_AT_FEDEX_LOCATION",
      rateRequestType: ["LIST", "ACCOUNT"],
      requestedPackageLineItems: req.packages.map((p) => ({
        weight: { units: "KG", value: p.weight },
        dimensions: p.length ? { length: p.length, width: p.width, height: p.height, units: "CM" } : undefined,
      })),
    },
  };

  const res = await fetch("https://apis-sandbox.fedex.com/rate/v1/rates/quotes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("FedEx rates error:", err);
    return [{ carrier: "FedEx", service: "Error", price: 0, currency: "USD", error: `FedEx API error: ${res.status}` }];
  }

  const data = await res.json();
  const results: RateResult[] = [];
  for (const detail of data.output?.rateReplyDetails || []) {
    const rate = detail.ratedShipmentDetails?.[0];
    if (rate) {
      results.push({
        carrier: "FedEx",
        service: detail.serviceType || "Unknown",
        price: rate.totalNetCharge || 0,
        currency: rate.currency || "USD",
        transitDays: detail.commit?.transitDays?.value,
      });
    }
  }
  return results;
}

function usesUPSImperialUnits(countryCode: string): boolean {
  const normalizedCountry = countryCode.trim().toUpperCase();
  return normalizedCountry === "US" || normalizedCountry === "PR";
}

function formatUPSWeight(weightKg: number, useImperialUnits: boolean): string {
  if (!useImperialUnits) return String(weightKg);
  return (weightKg * 2.20462).toFixed(2);
}

function formatUPSDimension(sizeCm: number | undefined, useImperialUnits: boolean): string | undefined {
  if (sizeCm == null) return undefined;
  if (!useImperialUnits) return String(sizeCm);
  return (sizeCm / 2.54).toFixed(2);
}

async function getUPSRates(token: string, accountNumber: string, req: ShipmentRequest): Promise<RateResult[]> {
  const useImperialUnits = usesUPSImperialUnits(req.origin.country);
  const weightUnitCode = useImperialUnits ? "LBS" : "KGS";
  const dimensionUnitCode = useImperialUnits ? "IN" : "CM";

  const body = {
    RateRequest: {
      Request: { TransactionReference: { CustomerContext: "Rate Request" } },
      Shipment: {
        Shipper: {
          ShipperNumber: accountNumber,
          Address: { PostalCode: req.origin.postalCode, CountryCode: req.origin.country },
        },
        ShipTo: {
          Address: { PostalCode: req.destination.postalCode, CountryCode: req.destination.country },
        },
        ShipFrom: {
          Address: { PostalCode: req.origin.postalCode, CountryCode: req.origin.country },
        },
        Package: req.packages.map((p) => ({
          PackagingType: { Code: "02" },
          PackageWeight: {
            UnitOfMeasurement: { Code: weightUnitCode },
            Weight: formatUPSWeight(p.weight, useImperialUnits),
          },
          Dimensions: p.length
            ? {
                UnitOfMeasurement: { Code: dimensionUnitCode },
                Length: formatUPSDimension(p.length, useImperialUnits),
                Width: formatUPSDimension(p.width, useImperialUnits),
                Height: formatUPSDimension(p.height, useImperialUnits),
              }
            : undefined,
        })),
      },
    },
  };

  const res = await fetch("https://wwwcie.ups.com/api/rating/v1/Shop", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("UPS rates error:", err);

    let errorMessage = `UPS API error: ${res.status}`;
    try {
      const parsed = JSON.parse(err);
      const upsMessage = parsed?.response?.errors
        ?.map((item: { message?: string }) => item.message)
        .filter(Boolean)
        .join("; ");

      if (upsMessage) {
        errorMessage = `${errorMessage} — ${upsMessage}`;
      }
    } catch {
      // Ignore non-JSON error bodies and keep the generic error message.
    }

    return [{ carrier: "UPS", service: "Error", price: 0, currency: "USD", error: errorMessage }];
  }

  const data = await res.json();
  const results: RateResult[] = [];
  const rated = data.RateResponse?.RatedShipment;
  if (Array.isArray(rated)) {
    for (const s of rated) {
      results.push({
        carrier: "UPS",
        service: s.Service?.Code || "Unknown",
        price: parseFloat(s.TotalCharges?.MonetaryValue || "0"),
        currency: s.TotalCharges?.CurrencyCode || "USD",
        transitDays: s.GuaranteedDelivery?.BusinessDaysInTransit ? parseInt(s.GuaranteedDelivery.BusinessDaysInTransit) : undefined,
      });
    }
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();

    // Health check / connection status
    if (action === "status") {
      const fedexKey = Deno.env.get("FEDEX_API_KEY");
      const upsId = Deno.env.get("UPS_CLIENT_ID");
      return new Response(
        JSON.stringify({
          fedex: { configured: !!fedexKey },
          ups: { configured: !!upsId },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "rates") {
      const shipment = payload as ShipmentRequest;
      const carriers = shipment.carriers || ["fedex", "ups"];
      const allRates: RateResult[] = [];

      const promises: Promise<void>[] = [];

      if (carriers.includes("fedex")) {
        const fedexKey = Deno.env.get("FEDEX_API_KEY");
        const fedexSecret = Deno.env.get("FEDEX_SECRET_KEY");
        const fedexAccount = Deno.env.get("FEDEX_ACCOUNT_NUMBER");
        if (fedexKey && fedexSecret && fedexAccount) {
          promises.push(
            getFedExToken(fedexKey, fedexSecret)
              .then((token) => getFedExRates(token, fedexAccount, shipment))
              .then((rates) => { allRates.push(...rates); })
              .catch((e) => { allRates.push({ carrier: "FedEx", service: "Error", price: 0, currency: "USD", error: e.message }); })
          );
        } else {
          allRates.push({ carrier: "FedEx", service: "Not configured", price: 0, currency: "USD", error: "FedEx credentials not configured" });
        }
      }

      if (carriers.includes("ups")) {
        const upsId = Deno.env.get("UPS_CLIENT_ID");
        const upsSecret = Deno.env.get("UPS_CLIENT_SECRET");
        const upsAccount = Deno.env.get("UPS_ACCOUNT_NUMBER");
        if (upsId && upsSecret && upsAccount) {
          promises.push(
            getUPSToken(upsId, upsSecret)
              .then((token) => getUPSRates(token, upsAccount, shipment))
              .then((rates) => { allRates.push(...rates); })
              .catch((e) => { allRates.push({ carrier: "UPS", service: "Error", price: 0, currency: "USD", error: e.message }); })
          );
        } else {
          allRates.push({ carrier: "UPS", service: "Not configured", price: 0, currency: "USD", error: "UPS credentials not configured" });
        }
      }

      await Promise.all(promises);
      allRates.sort((a, b) => a.price - b.price);

      return new Response(JSON.stringify({ rates: allRates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
