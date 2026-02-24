import { CreditCard } from "lucide-react";

const BillingSettings = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-maxir-white">Billing</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-maxir-dark border border-white/10 rounded-lg p-6">
          <h2 className="text-maxir-white font-semibold mb-4">Payment Methods</h2>
          <p className="text-maxir-gray text-sm">No payment methods configured yet.</p>
        </div>

        <div className="bg-maxir-dark border border-white/10 rounded-lg p-6">
          <h2 className="text-maxir-white font-semibold mb-4">Invoice History</h2>
          <p className="text-maxir-gray text-sm">No invoices available.</p>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
