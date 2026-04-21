import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type SchemaType = "auto" | "WebPage" | "Article" | "Service" | "LocalBusiness" | "Product";

export interface SchemaData {
  service_name?: string;
  service_area?: string;
  street_address?: string;
  locality?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  opening_hours?: string;
  article_section?: string;
  product_brand?: string;
}

const SCHEMA_OPTIONS: { value: SchemaType; label: string; description: string }[] = [
  { value: "auto", label: "Auto (recommended)", description: "WebPage for pages, Product for product detail. FAQ added when items exist." },
  { value: "WebPage", label: "WebPage", description: "Generic page. Good for About, overview pages." },
  { value: "Product", label: "Product", description: "For product detail pages. Auto-fills brand, price, image." },
  { value: "Service", label: "Service", description: "For service offerings. Auto-fills provider and image." },
  { value: "Article", label: "Article", description: "For long-form content. Adds author and publish date." },
  { value: "LocalBusiness", label: "LocalBusiness", description: "For Contact page. Adds address & opening hours." },
];

interface Props {
  schemaType: SchemaType;
  schemaData: SchemaData;
  onChange: (type: SchemaType, data: SchemaData) => void;
}

const SchemaPicker = ({ schemaType, schemaData, onChange }: Props) => {
  const updateData = (patch: Partial<SchemaData>) => onChange(schemaType, { ...schemaData, ...patch });
  const setType = (next: SchemaType) => onChange(next, schemaData);

  return (
    <div className="space-y-3 p-3 rounded-md border bg-muted/20">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Structured Data (Schema.org)
      </Label>

      <div>
        <Label className="text-xs mb-1 block">Schema Type</Label>
        <select
          value={schemaType}
          onChange={(e) => setType(e.target.value as SchemaType)}
          className="w-full h-8 text-sm rounded-md border border-input bg-background px-2"
        >
          {SCHEMA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-[10px] text-muted-foreground mt-1">
          {SCHEMA_OPTIONS.find((o) => o.value === schemaType)?.description}
        </p>
      </div>

      {schemaType === "Service" && (
        <div className="space-y-2 pt-1">
          <div>
            <Label className="text-xs mb-1 block">Service Name</Label>
            <Input value={schemaData.service_name || ""} onChange={(e) => updateData({ service_name: e.target.value })} className="h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Area Served</Label>
            <Input value={schemaData.service_area || ""} onChange={(e) => updateData({ service_area: e.target.value })} placeholder="Worldwide, EU, United States" className="h-8 text-sm" />
          </div>
        </div>
      )}

      {schemaType === "Product" && (
        <div className="space-y-2 pt-1">
          <div>
            <Label className="text-xs mb-1 block">Brand</Label>
            <Input value={schemaData.product_brand || "MAX-IR Labs"} onChange={(e) => updateData({ product_brand: e.target.value })} className="h-8 text-sm" />
          </div>
          <p className="text-[10px] text-muted-foreground">Name, description, image, and price come from the product record.</p>
        </div>
      )}

      {schemaType === "LocalBusiness" && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs mb-1 block">Street Address</Label>
              <Input value={schemaData.street_address || ""} onChange={(e) => updateData({ street_address: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">City / Locality</Label>
              <Input value={schemaData.locality || ""} onChange={(e) => updateData({ locality: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Region / State</Label>
              <Input value={schemaData.region || ""} onChange={(e) => updateData({ region: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Postal Code</Label>
              <Input value={schemaData.postal_code || ""} onChange={(e) => updateData({ postal_code: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Country</Label>
              <Input value={schemaData.country || ""} onChange={(e) => updateData({ country: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Opening Hours</Label>
            <Textarea value={schemaData.opening_hours || ""} onChange={(e) => updateData({ opening_hours: e.target.value })} placeholder="Mo-Fr 09:00-18:00" rows={2} className="text-sm min-h-[44px]" />
          </div>
        </div>
      )}

      {schemaType === "Article" && (
        <div>
          <Label className="text-xs mb-1 block">Article Section</Label>
          <Input value={schemaData.article_section || ""} onChange={(e) => updateData({ article_section: e.target.value })} placeholder="Research, Engineering" className="h-8 text-sm" />
        </div>
      )}
    </div>
  );
};

export default SchemaPicker;
