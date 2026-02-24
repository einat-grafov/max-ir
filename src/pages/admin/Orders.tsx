import { ShoppingCart } from "lucide-react";

const Orders = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Order ID</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Customer</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Date</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Status</th>
                <th className="text-right text-muted-foreground font-medium px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No orders yet. Orders will appear here once customers make purchases.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
