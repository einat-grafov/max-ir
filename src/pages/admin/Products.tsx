import { Package, Plus } from "lucide-react";

const Products = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-maxir-white">Products</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-maxir-red-hover text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="bg-maxir-dark border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Product</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">SKU</th>
                <th className="text-left text-maxir-gray font-medium px-6 py-3">Category</th>
                <th className="text-right text-maxir-gray font-medium px-6 py-3">Price</th>
                <th className="text-right text-maxir-gray font-medium px-6 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td colSpan={5} className="px-6 py-12 text-center text-maxir-gray">
                  No products yet. Click "Add Product" to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
