import { Truck, Plus } from "lucide-react";

const ShippingSettings = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Shipping</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-maxir-red-hover text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" />
          Add Zone
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-foreground font-semibold mb-4">Shipping Zones</h2>
          <p className="text-muted-foreground text-sm">No shipping zones configured. Add zones to define shipping rates by region.</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-foreground font-semibold mb-4">Shipping Rates</h2>
          <p className="text-muted-foreground text-sm">Configure shipping rates after adding zones.</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettings;
