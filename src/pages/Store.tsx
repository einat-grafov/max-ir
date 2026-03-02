import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  images: unknown;
  price: number;
}

const Store = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, images, price")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const getProductImage = (product: Product): string | null => {
    if (product.images && Array.isArray(product.images) && (product.images as string[]).length > 0) {
      return (product.images as string[])[0];
    }
    return product.image_url;
  };

  return (
    <div className="min-h-screen bg-maxir-dark">
      <Navbar />
      <main className="pt-[70px]">
        {/* Dark header with title */}
        <section className="bg-maxir-dark relative pb-0">
          <div className="max-w-[1638px] mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-24 lg:pb-32">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-maxir-white text-center font-montserrat">
              Our Products
            </h1>
          </div>
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-[1px]">
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              className="w-full h-[60px] md:h-[90px] lg:h-[120px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,60 C300,120 600,0 900,60 C1100,100 1300,40 1440,80 L1440,120 L0,120 Z"
                fill="hsl(0 0% 100%)"
              />
            </svg>
          </div>
        </section>

        {/* White product grid section */}
        <section className="bg-white">
          <div className="max-w-[1638px] mx-auto px-6 lg:px-10 py-12 lg:py-20">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {products.map((product) => {
                  const img = getProductImage(product);
                  return (
                    <div key={product.id} className="group flex flex-col">
                      {/* Product image */}
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
                      {/* Name + arrow row */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-foreground font-semibold text-base leading-tight">
                          {product.name}
                        </h3>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-maxir-dark flex items-center justify-center group-hover:bg-primary transition-colors">
                          <ArrowRight className="w-4 h-4 text-maxir-white" />
                        </div>
                      </div>
                    </div>
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
      </main>
      <Footer />
    </div>
  );
};

export default Store;
