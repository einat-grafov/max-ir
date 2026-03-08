import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Minus, ShoppingCart, Bell, Download } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import ProductInquiryForm, { type SelectedVariantItem } from "@/components/ProductInquiryForm";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProductVariant {
  name: string;
  price: string;
  stock: string;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  images: unknown;
  price: number;
  description: string | null;
  overview: string | null;
  specifications: unknown;
  variants: unknown;
  category: string | null;
  sku: string | null;
  tax_exempt: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItems } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("description");
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const [notifyVariant, setNotifyVariant] = useState<ProductVariant | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyError, setNotifyError] = useState("");

  const emailSchema = z.string().trim().email("Please enter a valid email").max(255);

  const isOutOfStock = (v: ProductVariant) => {
    const stock = parseInt(v.stock, 10);
    return isNaN(stock) || stock <= 0;
  };

  const handleNotifySubmit = async () => {
    const result = emailSchema.safeParse(notifyEmail);
    if (!result.success) {
      setNotifyError(result.error.issues[0].message);
      return;
    }
    setNotifySubmitting(true);
    try {
      const { error } = await supabase.from("stock_notifications").insert({
        product_id: product?.id ?? null,
        variant_sku: notifyVariant?.sku || null,
        variant_name: notifyVariant?.name ?? "",
        email: result.data,
      });
      if (error) throw error;
      toast({ title: "You're on the list!", description: `We'll notify you when ${notifyVariant?.name} is back in stock.` });
      setNotifyVariant(null);
      setNotifyEmail("");
      setNotifyError("");
    } catch {
      toast({ title: "Error", description: "Failed to register. Please try again.", variant: "destructive" });
    } finally {
      setNotifySubmitting(false);
    }
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, images, price, description, overview, specifications, variants, category, sku, status, cta_add_to_cart, cta_request_quote, tax_exempt, pdf_url")
        .eq("id", id!)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Product not found");
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

  const getVariants = (product: Product): ProductVariant[] => {
    if (!product.variants || !Array.isArray(product.variants)) return [];
    return (product.variants as ProductVariant[]).filter(v => v.name?.trim());
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
              <Link to="/#Products" className="hover:text-foreground transition-colors">
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
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat leading-tight">
                    {product.name}
                  </h1>

                  {product.overview && (
                    <div
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.overview }}
                    />
                  )}

                  {/* Price / Variants */}
                  {(() => {
                    const variants = getVariants(product);
                    if (variants.length > 0) {
                      const updateQty = (index: number, delta: number) => {
                        setSelectedVariants(prev => {
                          const current = prev[index] ?? 0;
                          const next = Math.max(0, current + delta);
                          return { ...prev, [index]: next };
                        });
                      };
                      return (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3">Select Options</h3>
                          <div className="border border-border rounded-lg overflow-hidden">
                            {variants.map((v, i) => {
                              const qty = selectedVariants[i] ?? 0;
                              const outOfStock = isOutOfStock(v);
                              return (
                                <div key={i} className={`px-4 py-3 ${i > 0 ? "border-t border-border" : ""} ${outOfStock ? "opacity-60" : ""}`}>
                                  <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-sm text-foreground font-medium">{v.name}</span>
                                      {v.sku && (
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5"><span className="font-semibold not-italic" style={{ fontFamily: 'inherit' }}>SKU:</span> {v.sku}</p>
                                      )}
                                      {outOfStock && (
                                        <p className="text-xs text-destructive font-medium mt-0.5">Out of stock</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                      {!product.tax_exempt && parseFloat(v.price) > 0 && (
                                        <span className="text-sm font-bold text-foreground">{formatPrice(parseFloat(v.price))}</span>
                                      )}
                                      {outOfStock ? (
                                        <button
                                          onClick={() => { setNotifyVariant(v); setNotifyEmail(""); setNotifyError(""); }}
                                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                        >
                                          <Bell className="w-3.5 h-3.5" />
                                          Notify Me
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => updateQty(i, -1)}
                                            disabled={qty <= 0}
                                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className="text-sm font-medium text-foreground w-8 text-center">{qty}</span>
                                          <button
                                            onClick={() => updateQty(i, 1)}
                                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {(() => {
                            const inStockVariants = variants.map((v, i) => ({ v, i })).filter(({ v }) => !isOutOfStock(v));
                            const totalItems = inStockVariants.reduce((sum, { i }) => sum + (selectedVariants[i] ?? 0), 0);
                             const totalPrice = inStockVariants.reduce((sum, { v, i }) => {
                               const price = parseFloat(v.price || "0");
                               const qty = selectedVariants[i] ?? 0;
                              return sum + price * qty;
                            }, 0);
                            return (
                              <div className="mt-3 border-t border-border pt-3">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                                  {!product.tax_exempt && (
                                    <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                                  )}
                                </div>
                                {!product.tax_exempt && (
                                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] ml-auto text-right">
                                    <span className="font-semibold text-foreground">Sales tax:</span> Calculated at checkout for U.S. shipping addresses. Not charged for non-U.S. shipping
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }
                    return !product.tax_exempt ? (
                      <div>
                        <p className="text-3xl font-bold text-foreground">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px]">
                          <span className="font-semibold text-foreground">Sales tax:</span> Calculated at checkout for U.S. shipping addresses. Not charged for non-U.S. shipping
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {/* Action buttons */}
                  {(() => {
                    const variants = getVariants(product);
                    const hasVariants = variants.length > 0;
                    const hasSelection = !hasVariants || variants.some((v, i) => !isOutOfStock(v) && (selectedVariants[i] ?? 0) > 0);
                    const showAddToCart = (product as any).cta_add_to_cart !== false;
                    const showRequestQuote = (product as any).cta_request_quote !== false;
                    return (
                    <div className="flex items-center gap-3 flex-wrap">
                    {showAddToCart && (
                    <button
                      onClick={() => {
                        if (hasVariants) {
                          const cartItems = variants
                            .map((v, i) => ({ v, i }))
                            .filter(({ v, i }) => !isOutOfStock(v) && (selectedVariants[i] ?? 0) > 0)
                            .map(({ v, i }) => ({
                              productId: product.id,
                              productName: product.name,
                              variantName: v.name,
                              sku: v.sku || undefined,
                              price: parseFloat(v.price) || 0,
                              quantity: selectedVariants[i] ?? 0,
                            }));
                          addItems(cartItems);
                        } else {
                          addItems([{
                            productId: product.id,
                            productName: product.name,
                            variantName: product.name,
                            sku: product.sku || undefined,
                            price: product.price,
                            quantity: 1,
                          }]);
                        }
                        toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
                      }}
                      disabled={!hasSelection}
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-sm font-semibold transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    )}
                    {showRequestQuote && (
                    <button
                      onClick={() => setInquiryOpen(true)}
                      className="inline-flex items-center gap-2 bg-maxir-dark hover:bg-maxir-dark/90 text-maxir-white px-6 py-3 text-sm font-semibold transition-colors rounded-md"
                    >
                      <FileText className="w-4 h-4" />
                      Request a Quote
                    </button>
                    )}
                    {!showAddToCart && !showRequestQuote && (
                      <p className="text-sm text-muted-foreground italic">Contact us for availability and pricing.</p>
                    )}
                  </div>
                    );
                  })()}

                  {/* SKU */}
                  {product.sku && (
                    <p className="text-sm text-muted-foreground font-semibold">
                      <span className="text-foreground">SKU:</span> {product.sku}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabbed section: Description / Specifications */}
              <div className="pb-20">
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
          <ProductInquiryForm
            open={inquiryOpen}
            onOpenChange={setInquiryOpen}
            productName={product.name}
            productId={product.id}
            selectedVariants={(() => {
              const variants = getVariants(product);
              return variants.map((v, i) => ({
                name: v.name,
                sku: v.sku,
                price: v.price,
                quantity: selectedVariants[i] ?? 1,
              } as SelectedVariantItem));
            })()}
          />
        )}
        {/* Notify Me Modal */}
        <Dialog open={!!notifyVariant} onOpenChange={(open) => { if (!open) setNotifyVariant(null); }}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="font-montserrat">Get Notified</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Enter your email and we'll let you know when <span className="font-medium text-foreground">{notifyVariant?.name}</span> is back in stock.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="notify-email">Email address</Label>
                <Input
                  id="notify-email"
                  type="email"
                  placeholder="you@example.com"
                  value={notifyEmail}
                  onChange={(e) => { setNotifyEmail(e.target.value); setNotifyError(""); }}
                />
                {notifyError && <p className="text-xs text-destructive">{notifyError}</p>}
              </div>
              <Button onClick={handleNotifySubmit} disabled={notifySubmitting} className="w-full">
                {notifySubmitting ? "Submitting…" : "Notify Me"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
