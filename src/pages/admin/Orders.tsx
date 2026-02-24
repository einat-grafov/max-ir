import { useState } from "react";
import { ShoppingCart, Calendar, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const timeFilters = [
  { label: "Today", description: "Compared to yesterday up to current hour" },
  { label: "Last 7 days", description: "Compared to the previous 7 days" },
  { label: "Last 30 days", description: "Compared to the previous 30 days" },
];

const stats = [
  { label: "Orders", value: "0", change: "—" },
  { label: "Items ordered", value: "0", change: "—" },
  { label: "Returns", value: "₪0", change: "—" },
  { label: "Orders fulfilled", value: "0", change: "—" },
  { label: "Orders delivered", value: "0", change: "—" },
];

const Orders = () => {
  const [selectedFilter, setSelectedFilter] = useState("Today");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
      </div>

      {/* Stats bar */}
      <div className="bg-background border border-border rounded-lg flex items-center divide-x divide-border mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-3 hover:bg-muted/50 rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">{selectedFilter}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 bg-background border border-border shadow-lg z-50 p-1">
            {timeFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSelectedFilter(filter.label)}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors text-left"
              >
                <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedFilter === filter.label ? "border-foreground" : "border-muted-foreground/40"}`}>
                  {selectedFilter === filter.label && (
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{filter.label}</p>
                  <p className="text-xs text-muted-foreground">{filter.description}</p>
                </div>
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1 px-5 py-3">
            <p className="text-sm font-semibold text-foreground">{stat.label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.change}</span>
              <div className="h-[2px] w-12 bg-primary/40 rounded-full ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-background border border-border rounded-lg flex flex-col items-center justify-center py-24 px-6">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-teal-100 flex items-center justify-center">
            <FileText className="h-14 w-14 text-muted-foreground/50" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Your orders will show here</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          This is where you'll fulfill orders, collect payments, and track order progress.
        </p>
        <Button variant="default" className="bg-foreground text-background hover:bg-foreground/90">
          Create order
        </Button>
      </div>
    </div>
  );
};

export default Orders;
