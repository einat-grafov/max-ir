import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductImageLightbox from "@/components/admin/ProductImageLightbox";

const Products = () => {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<{ images: string[]; open: boolean }>({ images: [], open: false });
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
        </div>
        <Link
          to="/admin/products/create"
          className="flex items-center gap-2 bg-primary hover:bg-maxir-red-hover text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Product</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">SKU</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Category</th>
                <th className="text-right text-muted-foreground font-medium px-6 py-3">Price</th>
                <th className="text-right text-muted-foreground font-medium px-6 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : !products || products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No products yet. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/products/${product.id}`)}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover border border-border hover:ring-2 hover:ring-primary/50 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              const allImages = Array.isArray(product.images) ? (product.images as string[]) : [];
                              const imgs = allImages.length > 0 ? allImages : [product.image_url!];
                              setLightbox({ images: imgs, open: true });
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{product.sku || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{product.category || "—"}</td>
                    <td className="px-6 py-3 text-right text-foreground">{fmt(product.price)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={product.stock === 0 ? "text-destructive font-medium" : "text-foreground"}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProductImageLightbox
        images={lightbox.images}
        open={lightbox.open}
        onOpenChange={(open) => setLightbox((prev) => ({ ...prev, open }))}
      />
    </div>
  );
};

export default Products;
