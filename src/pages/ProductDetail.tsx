import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail } from "lucide-react";
import { useState, useRef } from "react";
import ProductInquiryForm from "@/components/ProductInquiryForm";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  images: unknown;
  price: number;
  description: string | null;
  overview: string | null;
  specifications: unknown;
  category: string | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const inquiryRef = useRef<HTMLDivElement>(null);

  const scrollToInquiry = () => {
    inquiryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, images, price, description, overview, specifications, category")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });

  const getImages = (product: Product): string[] => {
    if (product.images && Array.isArray(product.images) && (product.images as string[]).length > 0) {
      return product.images as string[];
    }
    if (product.image_url) return [product.image_url];
    return [];
  };

  const getSpecs = (product: Product): { label: string; value: string }[] => {
    if (!product.specifications || !Array.isArray(product.specifications)) return [];
    return (product.specifications as { label: string; value: string }[]).filter(
      (s) => s.label && s.value
    );
  };

  return (
    <div className="min-h-screen bg-maxir-dark">
      <Navbar />
      <main className="pt-[70px]">
        {/* Dark header */}
        <section className="bg-maxir-dark relative pb-0">
          <div className="max-w-[1638px] mx-auto px-6 lg:px-10 pt-10 lg:pt-16 pb-24 lg:pb-32">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 text-maxir-white/70 hover:text-maxir-white transition-colors mb-6 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            {isLoading ? (
              <Skeleton className="h-10 w-64 bg-white/10" />
            ) : (
              <h1 className="text-3xl md:text-4xl lg:text-[48px] font-bold text-maxir-white font-montserrat">
                {product?.name}
              </h1>
            )}
          </div>
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

        {/* White content */}
        <section className="bg-white">
          <div className="max-w-[1638px] mx-auto px-6 lg:px-10 py-12 lg:py-20">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                </div>
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image gallery */}
                <div className="space-y-4">
                  {(() => {
                    const images = getImages(product);
                    if (images.length === 0) {
                      return (
                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      );
                    }
                    return (
                      <>
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {images.length > 1 && (
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {images.map((img, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedImage(i)}
                                className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                                  i === selectedImage
                                    ? "border-primary"
                                    : "border-transparent hover:border-muted-foreground/30"
                                }`}
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Product info */}
                <div className="space-y-8">
                  {product.category && (
                    <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}

                  {product.overview && (
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-3">Overview</h2>
                      <div
                        className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.overview }}
                      />
                    </div>
                  )}

                  {product.description && (
                    <div>
                      <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                      <div
                        className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </div>
                  )}

                {(() => {
                    const specs = getSpecs(product);
                    if (specs.length === 0) return null;
                    return (
                      <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Specifications</h2>
                        <div className="border rounded-lg overflow-hidden">
                          {specs.map((spec, i) => (
                            <div
                              key={i}
                              className={`flex ${i > 0 ? "border-t" : ""}`}
                            >
                              <div className="w-1/3 bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">
                                {spec.label}
                              </div>
                              <div className="w-2/3 px-4 py-3 text-sm text-muted-foreground">
                                {spec.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inquiry button */}
                  <button
                    onClick={scrollToInquiry}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Inquire About This Product
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-16">Product not found.</p>
            )}
          </div>
        </section>

        {/* Inquiry section */}
        {product && (
          <section ref={inquiryRef} className="bg-maxir-dark">
            <div className="max-w-[800px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
              <h2 className="text-2xl md:text-3xl font-bold text-maxir-white font-montserrat mb-2 text-center">
                Inquire About {product.name}
              </h2>
              <p className="text-maxir-white/60 text-center mb-10 text-sm">
                Fill out the form below and our team will get back to you shortly.
              </p>
              <ProductInquiryForm productName={product.name} />
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
