import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Customer {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;
  country: string;
}

interface CustomerSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSearchModal = ({ open, onOpenChange, onSelectCustomer }: CustomerSearchModalProps) => {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCustomers();
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    let query = supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, city, country");
    if (search.trim()) {
      query = query.or(
        `first_name.ilike.%${search.trim()}%,last_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
      );
    }
    const { data } = await query.order("first_name").limit(50);
    setCustomers((data as Customer[]) || []);
    setLoading(false);
  };

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>Select customer</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Table header */}
        <div className="px-6 pt-3">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center text-sm text-muted-foreground border-b border-border pb-2">
            <span>Name</span>
            <span>Email</span>
            <span className="w-32 text-right">Location</span>
          </div>
        </div>

        {/* Customer list */}
        <div className="flex-1 overflow-y-auto px-6">
          {loading && (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          )}
          {!loading && customers.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No customers found.</p>
          )}
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center py-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSelect(customer)}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {customer.first_name}{customer.last_name ? ` ${customer.last_name}` : ""}
                </span>
              </div>
              <span className="text-sm text-muted-foreground truncate">
                {customer.email || "—"}
              </span>
              <span className="w-32 text-right text-sm text-muted-foreground">
                {[customer.city, customer.country].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSearchModal;
