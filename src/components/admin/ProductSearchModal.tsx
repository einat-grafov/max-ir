import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  requires_shipping: boolean;
  tax_exempt: boolean;
}

interface ProductSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProducts: (products: Product[]) => void;
}

const ProductSearchModal = ({ open, onOpenChange, onAddProducts }: ProductSearchModalProps) => {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      setSelected(new Set());
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from("products").select("id, name, price, stock, image_url, requires_shipping, tax_exempt");
    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }
    const { data } = await query.order("name").limit(50);
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    const selectedProducts = products.filter((p) => selected.has(p.id));
    onAddProducts(selectedProducts);
    onOpenChange(false);
  };

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USD";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <DialogTitle>Select products</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Table header */}
          <div className="pt-3">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center text-sm text-muted-foreground border-b border-border pb-2">
              <span className="w-6" />
              <span>Product</span>
              <span className="w-20 text-center">Available</span>
              <span className="w-32 text-right">Price</span>
            </div>
          </div>

          {/* Product list */}
          <div>
            {loading && (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
            )}
            {!loading && products.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No products found.</p>
            )}
            {products.map((product) => (
              <div key={product.id}>
                <div
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSelect(product.id)}
                >
                  <Checkbox
                    checked={selected.has(product.id)}
                    onCheckedChange={() => toggleSelect(product.id)}
                    className="w-5 h-5"
                  />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{product.name}</span>
                  </div>
                  <span className="w-20 text-center text-sm text-foreground">{product.stock}</span>
                  <span className="w-32 text-right text-sm text-foreground">{fmt(product.price)}</span>
                </div>
                {product.stock === 0 && selected.has(product.id) && (
                  <Alert variant="destructive" className="mt-1 mb-1">
                    <AlertDescription className="text-xs">
                      This product is out of stock. You can still add it to the order.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border shrink-0">
          <span className="text-sm text-muted-foreground">
            {selected.size}/{products.length} variants selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={selected.size === 0}>
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSearchModal;
