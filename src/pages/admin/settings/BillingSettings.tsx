import { CreditCard } from "lucide-react";

const BillingSettings = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-foreground font-semibold mb-4">Payment Methods</h2>
          <p className="text-muted-foreground text-sm">No payment methods configured yet.</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-foreground font-semibold mb-4">Invoice History</h2>
          <p className="text-muted-foreground text-sm">No invoices available.</p>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
