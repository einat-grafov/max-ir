import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";

const statCards = [
  { label: "Total Revenue", value: "$0.00", icon: DollarSign, change: "+0%" },
  { label: "Orders", value: "0", icon: ShoppingCart, change: "+0%" },
  { label: "Customers", value: "0", icon: Users, change: "+0%" },
  { label: "Conversion Rate", value: "0%", icon: TrendingUp, change: "+0%" },
];

const Analytics = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-background border border-border rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{card.label}</span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.change} from last month</p>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-foreground font-semibold mb-4">Revenue Overview</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Charts will populate once sales data is available.
        </div>
      </div>
    </div>
  );
};

export default Analytics;
