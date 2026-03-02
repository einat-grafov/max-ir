import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

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
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-maxir-white mb-4">
            Our Products
          </h1>
          <p className="text-maxir-gray text-lg mb-12 max-w-2xl">
            Explore our line of advanced infrared sensing solutions.
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-square w-full rounded-[16px] bg-white/5" />
                  <Skeleton className="h-5 w-3/4 bg-white/5" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const img = getProductImage(product);
                return (
                  <div key={product.id} className="group flex flex-col gap-3">
                    <div className="aspect-square rounded-[16px] overflow-hidden bg-white/5 border border-white/10">
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-maxir-gray text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="text-maxir-white font-semibold text-lg leading-tight">
                      {product.name}
                    </h3>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-maxir-gray text-center py-16">
              No products available yet.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Store;
