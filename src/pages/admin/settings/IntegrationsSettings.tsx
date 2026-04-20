import { useState, useEffect } from "react";
import {
  Plug,
  Truck,
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Package,
  Plus,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Mail,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProviderOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  secretsRequired: string[];
  docsUrl: string;
}

const AVAILABLE_PROVIDERS: ProviderOption[] = [
  {
    id: "dhl",
    name: "DHL Express",
    icon: "DH",
    description: "Worldwide express shipping with strong international coverage.",
    secretsRequired: ["DHL_API_KEY", "DHL_API_SECRET", "DHL_ACCOUNT_NUMBER"],
    docsUrl: "https://developer.dhl.com/api-reference/dhl-express-mydhl-api",
  },
  {
    id: "usps",
    name: "USPS",
    icon: "US",
    description: "United States Postal Service — domestic and international rates.",
    secretsRequired: ["USPS_CLIENT_ID", "USPS_CLIENT_SECRET"],
    docsUrl: "https://developer.usps.com/",
  },
  {
    id: "aramex",
    name: "Aramex",
    icon: "AR",
    description: "Middle East and global express logistics provider.",
    secretsRequired: ["ARAMEX_USERNAME", "ARAMEX_PASSWORD", "ARAMEX_ACCOUNT_NUMBER", "ARAMEX_ACCOUNT_PIN"],
    docsUrl: "https://www.aramex.com/developers",
  },
  {
    id: "israel-post",
    name: "Israel Post",
    icon: "IL",
    description: "Domestic Israeli postal service.",
    secretsRequired: ["ISRAEL_POST_API_KEY"],
    docsUrl: "https://www.israelpost.co.il/",
  },
];

interface CarrierStatus {
  configured: boolean;
}

interface StripeStatus {
  connected: boolean;
  mode: "test" | "live" | "unknown" | null;
  publishableKey: string | null;
  secretKeyMasked: string | null;
  account: {
    id: string;
    name: string | null;
    email: string | null;
    country: string | null;
    defaultCurrency: string | null;
  } | null;
  error?: string;
}

const IntegrationsSettings = () => {
  // Shipping state
  const [shippingStatus, setShippingStatus] = useState<{ fedex: CarrierStatus; ups: CarrierStatus } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null);
  const [addIntegrationOpen, setAddIntegrationOpen] = useState(false);

  const [originZip, setOriginZip] = useState("10001");
  const [originCountry, setOriginCountry] = useState("US");
  const [destZip, setDestZip] = useState("90210");
  const [destCountry, setDestCountry] = useState("US");
  const [weight, setWeight] = useState("1");

  // Stripe state
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(true);

  const fetchShippingStatus = async () => {
    setShippingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shipping-rates", {
        body: { action: "status" },
      });
      if (error) throw error;
      setShippingStatus(data);
    } catch {
      toast.error("Failed to check carrier status");
    } finally {
      setShippingLoading(false);
    }
  };

  const fetchStripeStatus = async () => {
    setStripeLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-status");
      if (error) throw error;
      if (data?.error && !("connected" in data)) throw new Error(data.error);
      setStripeStatus(data as StripeStatus);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load Stripe status");
      setStripeStatus(null);
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingStatus();
    fetchStripeStatus();
  }, []);

  const handleTestRates = async () => {
    setTestLoading(true);
    setTestResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("shipping-rates", {
        body: {
          action: "rates",
          origin: { postalCode: originZip, country: originCountry },
          destination: { postalCode: destZip, country: destCountry },
          packages: [{ weight: parseFloat(weight) || 1 }],
        },
      });
      if (error) throw error;
      setTestResults(data.rates || []);
      toast.success(`Got ${data.rates?.length || 0} rate(s)`);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch rates");
    } finally {
      setTestLoading(false);
    }
  };

  const refreshAll = () => {
    fetchShippingStatus();
    fetchStripeStatus();
  };

  const dashboardUrl =
    stripeStatus?.mode === "test"
      ? "https://dashboard.stripe.com/test/dashboard"
      : "https://dashboard.stripe.com/dashboard";

  const CarrierCard = ({ name, icon, configured }: { name: string; icon: string; configured: boolean }) => (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold text-foreground">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {configured ? "API credentials configured" : "Not configured"}
            </p>
          </div>
        </div>
        <Badge variant={configured ? "default" : "secondary"} className="flex items-center gap-1">
          {configured ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Not connected
            </>
          )}
        </Badge>
      </div>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Plug className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={shippingLoading || stripeLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${shippingLoading || stripeLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddIntegrationOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add integration
          </Button>
        </div>
      </div>

      <div className="max-w-2xl space-y-10">
        {/* ============ PAYMENTS ============ */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Payments</h2>
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
              <div>
                <h3 className="text-foreground font-semibold mb-1">Stripe</h3>
                <p className="text-sm text-muted-foreground">
                  Payment processor used for customer checkout.
                </p>
              </div>
              {!stripeLoading && stripeStatus && (
                <div className="flex items-center gap-2">
                  {stripeStatus.connected ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                      <XCircle className="h-3.5 w-3.5" />
                      Not connected
                    </span>
                  )}
                  {stripeStatus.mode && (
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${
                        stripeStatus.mode === "live"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {stripeStatus.mode === "live"
                        ? "Live mode"
                        : stripeStatus.mode === "test"
                          ? "Test mode"
                          : "Unknown mode"}
                    </span>
                  )}
                </div>
              )}
            </div>

            {stripeLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking Stripe connection…
              </div>
            ) : stripeStatus?.error ? (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{stripeStatus.error}</span>
              </div>
            ) : null}

            {!stripeLoading && stripeStatus && (
              <>
                {stripeStatus.account && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5 pb-5 border-b border-border">
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Account</div>
                      <div className="text-foreground font-medium">
                        {stripeStatus.account.name || stripeStatus.account.email || stripeStatus.account.id}
                      </div>
                    </div>
                    {stripeStatus.account.email && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                        <div className="text-foreground">{stripeStatus.account.email}</div>
                      </div>
                    )}
                    {stripeStatus.account.country && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Country</div>
                        <div className="text-foreground">{stripeStatus.account.country}</div>
                      </div>
                    )}
                    {stripeStatus.account.defaultCurrency && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Default currency</div>
                        <div className="text-foreground uppercase">{stripeStatus.account.defaultCurrency}</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 mb-5">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Publishable key</div>
                    <div className="font-mono text-sm text-foreground bg-muted/50 px-3 py-2 rounded-md border border-border">
                      {stripeStatus.publishableKey || (
                        <span className="text-muted-foreground italic">Not set</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Secret key</div>
                    <div className="font-mono text-sm text-foreground bg-muted/50 px-3 py-2 rounded-md border border-border">
                      {stripeStatus.secretKeyMasked || (
                        <span className="text-muted-foreground italic">Not set</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  >
                    Open Stripe Dashboard
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 text-sm font-medium rounded-md transition-colors border border-border"
                  >
                    View API keys
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() =>
                      toast.info(
                        "To update your Stripe keys, open Lovable Cloud → Secrets and edit STRIPE_SECRET_KEY or STRIPE_PUBLISHABLE_KEY.",
                      )
                    }
                    className="inline-flex items-center gap-2 bg-background hover:bg-muted text-foreground px-4 py-2 text-sm font-medium rounded-md transition-colors border border-border"
                  >
                    Update keys
                  </button>
                </div>
              </>
            )}
          </Card>
        </section>

        {/* ============ SHIPPING ============ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Shipping carriers</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAddProviderOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add provider
            </Button>
          </div>

          <div className="space-y-3">
            {shippingLoading ? (
              <Card className="p-5">
                <p className="text-sm text-muted-foreground">Checking carrier status...</p>
              </Card>
            ) : (
              <>
                <CarrierCard name="FedEx" icon="FX" configured={shippingStatus?.fedex?.configured ?? false} />
                <CarrierCard name="UPS" icon="UP" configured={shippingStatus?.ups?.configured ?? false} />
              </>
            )}
          </div>

          <Card className="p-5 border-dashed mt-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                $0
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">Free shipping test address</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Use this postal code at checkout to bypass live carrier rates and apply $0 shipping. Works in the
                  Cart and the admin shipping calculator.
                </p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm font-semibold px-3 py-1.5 rounded-md bg-muted border border-border text-foreground">
                    00000
                  </code>
                  <Badge variant="secondary" className="text-xs">
                    Any country
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Test shipping rates</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter origin and destination to test live rate quotes from all connected carriers.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm">Origin postal code</Label>
                <Input value={originZip} onChange={(e) => setOriginZip(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Origin country</Label>
                <Input
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  className="mt-1"
                  placeholder="US"
                />
              </div>
              <div>
                <Label className="text-sm">Destination postal code</Label>
                <Input value={destZip} onChange={(e) => setDestZip(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Destination country</Label>
                <Input
                  value={destCountry}
                  onChange={(e) => setDestCountry(e.target.value)}
                  className="mt-1"
                  placeholder="US"
                />
              </div>
            </div>
            <div className="mb-4">
              <Label className="text-sm">Package weight (kg)</Label>
              <Input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 w-32"
                type="number"
                min="0.1"
                step="0.1"
              />
            </div>
            <Button onClick={handleTestRates} disabled={testLoading}>
              {testLoading ? "Fetching rates..." : "Get rates"}
            </Button>

            {testResults && (
              <div className="mt-4 border border-border rounded-lg divide-y divide-border">
                {testResults.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No rates returned.</p>
                ) : (
                  testResults.map((rate, i) => (
                    <div key={i} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {rate.carrier} — {rate.service}
                        </p>
                        {rate.transitDays && (
                          <p className="text-xs text-muted-foreground">{rate.transitDays} business days</p>
                        )}
                        {rate.error && <p className="text-xs text-destructive">{rate.error}</p>}
                      </div>
                      {!rate.error && (
                        <span className="text-sm font-semibold text-foreground">
                          ${rate.price.toFixed(2)} {rate.currency}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* Add Provider dialog */}
      <Dialog
        open={addProviderOpen}
        onOpenChange={(open) => {
          setAddProviderOpen(open);
          if (!open) setSelectedProvider(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedProvider ? `Connect ${selectedProvider.name}` : "Add a shipping provider"}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider
                ? "Add the API credentials below as backend secrets to enable this carrier."
                : "Choose a carrier to connect. Each provider requires its own API credentials."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pt-4">
            {!selectedProvider ? (
              <div className="space-y-2">
                {AVAILABLE_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProvider(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                      {p.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{selectedProvider.description}</p>
                  <a
                    href={selectedProvider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View {selectedProvider.name} API docs
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Required secrets</h4>
                  <div className="space-y-1.5">
                    {selectedProvider.secretsRequired.map((s) => (
                      <div
                        key={s}
                        className="font-mono text-xs px-3 py-2 rounded-md bg-muted/50 border border-border text-foreground"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground border-t border-border pt-4">
                  <p className="mb-1 font-medium text-foreground">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Get your credentials from {selectedProvider.name}'s developer portal.</li>
                    <li>Add each secret above in your backend secret manager.</li>
                    <li>
                      The shipping rates function will pick them up automatically once an integration is built for
                      this carrier.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {selectedProvider ? (
              <>
                <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    toast.info(
                      `${selectedProvider.name} integration request noted. Add the listed secrets in Cloud → Secrets to begin.`,
                    );
                    setAddProviderOpen(false);
                    setSelectedProvider(null);
                  }}
                >
                  Got it
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setAddProviderOpen(false)}>
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Integration dialog */}
      <Dialog open={addIntegrationOpen} onOpenChange={setAddIntegrationOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add an integration</DialogTitle>
            <DialogDescription>
              Choose a category to connect a new service to your store.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pt-4 space-y-2">
            {[
              {
                id: "shipping",
                name: "Shipping carrier",
                icon: Truck,
                description: "Connect FedEx, UPS, DHL, USPS, Aramex, Israel Post and more.",
                action: () => {
                  setAddIntegrationOpen(false);
                  setAddProviderOpen(true);
                },
              },
              {
                id: "payments",
                name: "Payment processor",
                icon: CreditCard,
                description: "Stripe is currently connected. More processors coming soon.",
                action: () => {
                  toast.info("Stripe is the only payment processor available right now.");
                },
              },
              {
                id: "email",
                name: "Email & marketing",
                icon: Mail,
                description: "Manage transactional email at Settings → Emails.",
                action: () => {
                  setAddIntegrationOpen(false);
                  window.location.href = "/admin/settings/emails";
                },
              },
              {
                id: "analytics",
                name: "Analytics & tracking",
                icon: BarChart3,
                description: "GA4 and Meta Pixel — request via support to enable.",
                action: () => {
                  toast.info("Analytics integration is configured in code. Ask the team to set it up.");
                },
              },
              {
                id: "other",
                name: "Other / custom",
                icon: Plug,
                description: "Need something else? We can wire up custom integrations on request.",
                action: () => {
                  toast.info("Tell us which service you'd like to integrate and we'll add it.");
                },
              },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={opt.action}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{opt.name}</div>
                    <div className="text-xs text-muted-foreground">{opt.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddIntegrationOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsSettings;
