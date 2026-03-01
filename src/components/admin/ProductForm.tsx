import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  sku: string;
  stock: string;
  trackInventory: boolean;
  requiresShipping: boolean;
  taxExempt: boolean;
  status: string;
  existingImageUrl: string | null;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  pageTitle: string;
  breadcrumbLabel: string;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (data: ProductFormData, imageUrl: string | null) => Promise<void>;
}

const ProductForm = ({
  initialData,
  pageTitle,
  breadcrumbLabel,
  submitLabel,
  savingLabel,
  onSubmit,
}: ProductFormProps) => {
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [price, setPrice] = useState(initialData?.price ?? "");
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [stock, setStock] = useState(initialData?.stock ?? "0");
  const [trackInventory, setTrackInventory] = useState(initialData?.trackInventory ?? true);
  const [requiresShipping, setRequiresShipping] = useState(initialData?.requiresShipping ?? true);
  const [taxExempt, setTaxExempt] = useState(initialData?.taxExempt ?? false);
  const [status, setStatus] = useState(initialData?.status ?? "active");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.existingImageUrl ?? null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim().length > 0;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageRemoved(false);
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      let imageUrl: string | null = initialData?.existingImageUrl ?? null;

      if (imageRemoved && !imageFile) {
        imageUrl = null;
      }

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      await onSubmit(
        { title, description, category, price, sku, stock, trackInventory, requiresShipping, taxExempt, status, existingImageUrl: null },
        imageUrl
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/admin/products">Discard</Link>
          </Button>
          <Button disabled={!canSubmit || saving} onClick={handleSave}>
            {saving ? savingLabel : submitLabel}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Short sleeve t-shirt" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Add a description for this product..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[160px]" />
            </div>
          </Card>

          <Card className="p-5">
            <Label className="mb-3 block">Media</Label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file); }} />
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Product preview" className="max-h-48 rounded-lg border border-border object-contain" />
                <button onClick={removeImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const file = e.dataTransfer.files?.[0]; if (file) handleFileSelect(file); }}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-2">
            <Label>Category</Label>
            <Input placeholder="e.g. Sensors, Accessories" value={category} onChange={(e) => setCategory(e.target.value)} />
            <p className="text-xs text-muted-foreground">Determines tax rates and adds metafields to improve search, filters, and cross-channel sales</p>
          </Card>

          <Card className="p-5 space-y-4">
            <Label>Price</Label>
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-7" min="0" step="0.01" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Charge tax</span>
              <Switch checked={!taxExempt} onCheckedChange={(v) => setTaxExempt(!v)} />
              <span className="text-xs text-muted-foreground">{taxExempt ? "No" : "Yes"}</span>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Inventory</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Inventory tracked</span>
                <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
              </div>
            </div>
            {trackInventory && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>Location</span>
                  <span className="text-right">Quantity</span>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4 py-3 items-center">
                  <span className="text-sm text-foreground">Default</span>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-24 ml-auto text-right" min="0" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="Stock Keeping Unit" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Shipping</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Physical product</span>
                <Switch checked={requiresShipping} onCheckedChange={setRequiresShipping} />
              </div>
            </div>
            {requiresShipping && (
              <p className="text-xs text-muted-foreground mt-3">Customers will need to enter their shipping address at checkout.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Product organization</h2>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input placeholder="e.g. Sensor, Module" />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input placeholder="e.g. MAX-IR Labs" />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input placeholder="Add tags separated by commas" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
