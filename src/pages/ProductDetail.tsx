import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, FileText } from "lucide-react";
import { useState } from "react";
import ProductInquiryForm from "@/components/ProductInquiryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  sku: string | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("description");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, images, price, description, overview, specifications, category, sku")
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-[70px]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          {isLoading ? (
            <Skeleton className="h-5 w-48 mt-6 bg-muted" />
          ) : product ? (
            <nav className="pt-6 pb-8 text-sm text-muted-foreground">
              <Link to="/store" className="hover:text-foreground transition-colors">
                Our products
              </Link>
              <span className="mx-2">&gt;</span>
              <span className="text-foreground">{product.name}</span>
            </nav>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-16">
              <Skeleton className="aspect-square w-full rounded-lg bg-muted" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
                <Skeleton className="h-8 w-32 bg-muted mt-4" />
              </div>
            </div>
          ) : product ? (
            <>
              {/* Hero: Image + Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-16">
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
                <div className="flex flex-col gap-6">
                  <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-foreground font-montserrat leading-tight">
                    {product.name}
                  </h1>

                  {product.overview && (
                    <div
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.overview }}
                    />
                  )}

                  {/* Price */}
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px]">
                      <span className="font-semibold text-foreground">Sales tax:</span> Calculated at checkout for U.S. shipping addresses. Not charged for non-U.S. shipping
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="inline-flex items-center gap-2 bg-maxir-dark hover:bg-maxir-dark/90 text-maxir-white px-6 py-3 text-sm font-semibold transition-colors rounded-md"
                    >
                      <Mail className="w-4 h-4" />
                      Contact
                    </button>
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-sm font-semibold transition-colors rounded-md"
                    >
                      <FileText className="w-4 h-4" />
                      Quote
                    </button>
                  </div>

                  {/* SKU */}
                  {product.sku && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">SKU:</span> {product.sku}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabbed section: Description / Specifications */}
              <div className="border-t pb-20">
                <div className="flex gap-8 border-b">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`py-4 text-base font-semibold transition-colors relative ${
                      activeTab === "description"
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Description
                    {activeTab === "description" && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                    )}
                  </button>
                  {getSpecs(product).length > 0 && (
                    <button
                      onClick={() => setActiveTab("specifications")}
                      className={`py-4 text-base font-semibold transition-colors relative ${
                        activeTab === "specifications"
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Specifications
                      {activeTab === "specifications" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                      )}
                    </button>
                  )}
                </div>

                <div className="pt-8 max-w-[900px]">
                  {activeTab === "description" && product.description && (
                    <div
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  )}
                  {activeTab === "description" && !product.description && (
                    <p className="text-muted-foreground">No description available.</p>
                  )}

                  {activeTab === "specifications" && (() => {
                    const specs = getSpecs(product);
                    return (
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
                    );
                  })()}
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-16">Product not found.</p>
          )}
        </div>

        {/* Inquiry Modal */}
        {product && (
          <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
            <DialogContent className="bg-maxir-dark border-white/10 sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-maxir-white font-montserrat text-xl">
                  Inquire About {product.name}
                </DialogTitle>
                <p className="text-maxir-white/60 text-sm mt-1">
                  Fill out the form below and our team will get back to you shortly.
                </p>
              </DialogHeader>
              <ProductInquiryForm productName={product.name} productId={product.id} />
            </DialogContent>
          </Dialog>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
