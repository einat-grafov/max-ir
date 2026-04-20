import { useState, useEffect } from "react";
import { Truck, CheckCircle2, XCircle, RefreshCw, Package, Plus, ExternalLink } from "lucide-react";
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

const ShippingSettings = () => {
  const [status, setStatus] = useState<{ fedex: CarrierStatus; ups: CarrierStatus } | null>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [addProviderOpen, setAddProviderOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null);

  // Test shipment fields
  const [originZip, setOriginZip] = useState("10001");
  const [originCountry, setOriginCountry] = useState("US");
  const [destZip, setDestZip] = useState("90210");
  const [destCountry, setDestCountry] = useState("US");
  const [weight, setWeight] = useState("1");

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("shipping-rates", {
        body: { action: "status" },
      });
      if (error) throw error;
      setStatus(data);
    } catch {
      toast.error("Failed to check carrier status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
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
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Shipping</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Carrier Status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Carriers</h2>
            <Button variant="outline" size="sm" onClick={() => setAddProviderOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add provider
            </Button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <Card className="p-5">
                <p className="text-sm text-muted-foreground">Checking carrier status...</p>
              </Card>
            ) : (
              <>
                <CarrierCard name="FedEx" icon="FX" configured={status?.fedex?.configured ?? false} />
                <CarrierCard name="UPS" icon="UP" configured={status?.ups?.configured ?? false} />
              </>
            )}
          </div>
        </div>

        {/* Test Rates */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Test Shipping Rates</h2>
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
              <Input value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="mt-1" placeholder="US" />
            </div>
            <div>
              <Label className="text-sm">Destination postal code</Label>
              <Input value={destZip} onChange={(e) => setDestZip(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Destination country</Label>
              <Input value={destCountry} onChange={(e) => setDestCountry(e.target.value)} className="mt-1" placeholder="US" />
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-sm">Package weight (kg)</Label>
            <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-32" type="number" min="0.1" step="0.1" />
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
                      {rate.error && (
                        <p className="text-xs text-destructive">{rate.error}</p>
                      )}
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
            <DialogTitle>{selectedProvider ? `Connect ${selectedProvider.name}` : "Add a shipping provider"}</DialogTitle>
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
                    <li>The shipping rates function will pick them up automatically once an integration is built for this carrier.</li>
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
    </div>
  );
};

export default ShippingSettings;
