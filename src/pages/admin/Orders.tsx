import { ShoppingCart } from "lucide-react";

const Orders = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-maxir-white">Orders</h1>
      </div>

      <div className="bg-maxir-dark border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Order ID</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Customer</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Date</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Status</th>
                <th className="text-right text-maxir-gray font-medium px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td colSpan={5} className="px-6 py-12 text-center text-maxir-gray">
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
