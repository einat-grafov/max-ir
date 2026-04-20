import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, XCircle, ExternalLink, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const BillingSettings = () => {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-status");
      if (error) throw error;
      if (data?.error && !("connected" in data)) throw new Error(data.error);
      setStatus(data as StripeStatus);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load Stripe status");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const dashboardUrl =
    status?.mode === "test"
      ? "https://dashboard.stripe.com/test/dashboard"
      : "https://dashboard.stripe.com/dashboard";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        </div>
        <button
          onClick={loadStatus}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {/* Connection status card */}
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <h2 className="text-foreground font-semibold mb-1">Stripe</h2>
              <p className="text-sm text-muted-foreground">
                Payment processor used for customer checkout.
              </p>
            </div>
            {!loading && status && (
              <div className="flex items-center gap-2">
                {status.connected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                    <XCircle className="h-3.5 w-3.5" />
                    Not connected
                  </span>
                )}
                {status.mode && (
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${
                      status.mode === "live"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {status.mode === "live" ? "Live mode" : status.mode === "test" ? "Test mode" : "Unknown mode"}
                  </span>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking Stripe connection…
            </div>
          ) : status?.error ? (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{status.error}</span>
            </div>
          ) : null}

          {!loading && status && (
            <>
              {/* Account info */}
              {status.account && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5 pb-5 border-b border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Account</div>
                    <div className="text-foreground font-medium">
                      {status.account.name || status.account.email || status.account.id}
                    </div>
                  </div>
                  {status.account.email && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                      <div className="text-foreground">{status.account.email}</div>
                    </div>
                  )}
                  {status.account.country && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Country</div>
                      <div className="text-foreground">{status.account.country}</div>
                    </div>
                  )}
                  {status.account.defaultCurrency && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Default currency</div>
                      <div className="text-foreground uppercase">{status.account.defaultCurrency}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Keys */}
              <div className="space-y-3 mb-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Publishable key</div>
                  <div className="font-mono text-sm text-foreground bg-muted/50 px-3 py-2 rounded-md border border-border">
                    {status.publishableKey || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Secret key</div>
                  <div className="font-mono text-sm text-foreground bg-muted/50 px-3 py-2 rounded-md border border-border">
                    {status.secretKeyMasked || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
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
        </div>

        {/* Quick links card */}
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-foreground font-semibold mb-4">Quick links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Payments", href: status?.mode === "test" ? "https://dashboard.stripe.com/test/payments" : "https://dashboard.stripe.com/payments" },
              { label: "Customers", href: status?.mode === "test" ? "https://dashboard.stripe.com/test/customers" : "https://dashboard.stripe.com/customers" },
              { label: "Webhooks", href: status?.mode === "test" ? "https://dashboard.stripe.com/test/webhooks" : "https://dashboard.stripe.com/webhooks" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-md border border-border hover:bg-muted transition-colors text-sm text-foreground"
              >
                {link.label}
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
