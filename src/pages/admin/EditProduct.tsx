import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (data: ProductFormData, imageUrl: string | null, allImageUrls: string[]) => {
    const { error } = await supabase
      .from("products")
      .update({
        name: data.title.trim(),
        overview: data.overview || "",
        description: data.description || "",
        category: data.category || null,
        price: parseFloat(data.price) || 0,
        sku: data.sku || null,
        stock: parseInt(data.stock) || 0,
        requires_shipping: data.requiresShipping,
        tax_exempt: data.taxExempt,
        image_url: imageUrl,
        images: allImageUrls as unknown as Json,
        specifications: (data.specifications.length > 0 ? data.specifications : []) as unknown as Json,
      })
      .eq("id", id!);
    if (error) throw error;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["product", id] }),
      queryClient.invalidateQueries({ queryKey: ["products"] }),
    ]);
    toast.success("Product updated successfully");
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("products").delete().eq("id", id!);
    if (error) throw error;
    toast.success("Product deleted");
    navigate("/admin/products");
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm p-6">Loading...</div>;
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  return (
    <ProductForm
      key={`${product.id}-${product.updated_at}`}
      pageTitle="Edit product"
      breadcrumbLabel={product.name}
      submitLabel="Save changes"
      savingLabel="Saving..."
      initialData={{
        title: product.name,
        overview: (product as any).overview ?? "",
        description: (product as any).description ?? "",
        category: product.category ?? "",
        price: product.price.toString(),
        sku: product.sku ?? "",
        stock: product.stock.toString(),
        trackInventory: true,
        requiresShipping: product.requires_shipping,
        taxExempt: product.tax_exempt,
        status: "active",
        existingImageUrl: product.image_url,
        existingImages: Array.isArray((product as any).images) ? (product as any).images as string[] : [],
        specifications: Array.isArray(product.specifications) && (product.specifications as any[]).length > 0 ? (product.specifications as any[]).map((s: any) => ({ label: s.label ?? "", value: s.value ?? "" })) : [{ label: "", value: "" }],
      }}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    />
  );
};

export default EditProduct;
