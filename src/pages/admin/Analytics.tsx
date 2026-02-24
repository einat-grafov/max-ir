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
        <h1 className="text-2xl font-bold text-maxir-white">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-maxir-dark border border-white/10 rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-maxir-gray text-sm">{card.label}</span>
              <card.icon className="h-4 w-4 text-maxir-gray" />
            </div>
            <p className="text-2xl font-bold text-maxir-white">{card.value}</p>
            <p className="text-xs text-maxir-gray mt-1">{card.change} from last month</p>
          </div>
        ))}
      </div>

      <div className="bg-maxir-dark border border-white/10 rounded-lg p-6">
        <h2 className="text-maxir-white font-semibold mb-4">Revenue Overview</h2>
        <div className="h-64 flex items-center justify-center text-maxir-gray text-sm">
          Charts will populate once sales data is available.
        </div>
      </div>
    </div>
  );
};

export default Analytics;
