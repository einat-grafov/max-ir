import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  images: unknown;
  price: number;
}

const getProductImage = (product: Product): string | null => {
  if (product.images && Array.isArray(product.images) && (product.images as string[]).length > 0) {
    return (product.images as string[])[0];
  }
  return product.image_url;
};

const ProductGrid = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, images, price")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <section className="bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold text-foreground text-center mb-10 lg:mb-16 font-montserrat">
          Our Products
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
                <Skeleton className="h-5 w-3/4 bg-muted" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product) => {
              const img = getProductImage(product);
              return (
                <Link key={product.id} to={`/store/${product.id}`} className="group flex flex-col">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-foreground font-semibold text-base leading-tight">
                      {product.name}
                    </h3>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-maxir-dark flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ArrowRight className="w-4 h-4 text-maxir-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-16">
            No products available yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
