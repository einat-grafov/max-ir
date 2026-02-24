import { Users } from "lucide-react";

const Customers = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-maxir-white">Customers</h1>
      </div>

      <div className="bg-maxir-dark border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Name</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Email</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Orders</th>
                <th className="text-right text-maxir-gray font-medium px-6 py-3">Total Spent</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Last Order</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td colSpan={5} className="px-6 py-12 text-center text-maxir-gray">
                  No customers yet. Customer data will populate once orders are placed.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
