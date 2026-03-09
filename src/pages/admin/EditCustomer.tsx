import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "flag-icons/css/flag-icons.min.css";
import { COUNTRIES, getCountryCode } from "@/lib/countries";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import CustomerTimeline from "@/components/admin/CustomerTimeline";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 cursor-pointer" },
  new_lead: { label: "New Lead", className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer" },
  new_inquiry: { label: "New Inquiry", className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 cursor-pointer" },
};

interface ContactState {
  id?: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  email: string;
}

const emptyContact = (): ContactState => ({
  first_name: "",
  last_name: "",
  role: "",
  phone: "",
  email: "",
});


const EditCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("customers")
        .update({ status: newStatus } as any)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("Israel");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [contacts, setContacts] = useState<ContactState[]>([]);

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: existingContacts } = useQuery({
    queryKey: ["customer-contacts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_contacts")
        .select("*")
        .eq("customer_id", id!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (customer) {
      setCompanyName(customer.company || customer.first_name || "");
      setCountry(customer.country || "Israel");
      setAddress(customer.address || "");
      setApartment(customer.apartment || "");
      setCity(customer.city || "");
      setPostalCode(customer.postal_code || "");
    }
  }, [customer]);

  useEffect(() => {
    if (existingContacts) {
      setContacts(
        existingContacts.map((c) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name || "",
          role: c.role || "",
          phone: c.phone || "",
          email: c.email || "",
        }))
      );
    }
  }, [existingContacts]);

  const hasUnsavedChanges = useMemo(() => {
    if (!customer || !existingContacts) return false;
    const saved = {
      company: customer.company || customer.first_name || "",
      country: customer.country || "Israel",
      address: customer.address || "",
      apartment: customer.apartment || "",
      city: customer.city || "",
      postal: customer.postal_code || "",
    };
    if (companyName !== saved.company || country !== saved.country || address !== saved.address || apartment !== saved.apartment || city !== saved.city || postalCode !== saved.postal) return true;
    if (contacts.length !== existingContacts.length) return true;
    for (let i = 0; i < existingContacts.length; i++) {
      const ec = existingContacts[i];
      const c = contacts[i];
      if (!c) return true;
      if (c.first_name !== ec.first_name || c.last_name !== (ec.last_name || "") || c.role !== (ec.role || "") || c.phone !== (ec.phone || "") || c.email !== (ec.email || "")) return true;
    }
    return false;
  }, [customer, existingContacts, companyName, country, address, apartment, city, postalCode, contacts]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const addContact = () => setContacts((prev) => [...prev, emptyContact()]);
  const removeContact = (index: number) =>
    setContacts((prev) => prev.filter((_, i) => i !== index));
  const updateContact = (index: number, field: keyof ContactState, value: string) =>
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );

  const hasValidContact = contacts.some((c) => c.first_name.trim());

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!hasValidContact) {
      toast.error("At least one contact is required");
      return;
    }
    setSaving(true);
    try {
      const { error: customerError } = await supabase
        .from("customers")
        .update({
          first_name: companyName.trim(),
          company: companyName.trim(),
          country,
          address: address.trim() || null,
          apartment: apartment.trim() || null,
          city: city.trim() || null,
          postal_code: postalCode.trim() || null,
        })
        .eq("id", id!);
      if (customerError) throw customerError;

      // Delete all existing contacts and re-insert
      await supabase.from("customer_contacts").delete().eq("customer_id", id!);

      const validContacts = contacts.filter((c) => c.first_name.trim());
      if (validContacts.length > 0) {
        const { error: contactsError } = await supabase
          .from("customer_contacts")
          .insert(
            validContacts.map((c) => ({
              customer_id: id!,
              first_name: c.first_name.trim(),
              last_name: c.last_name.trim() || null,
              role: c.role.trim() || null,
              phone: c.phone.trim() || null,
              email: c.email.trim() || null,
            }))
          );
        if (contactsError) throw contactsError;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer", id] }),
        queryClient.invalidateQueries({ queryKey: ["customer-contacts", id] }),
        queryClient.invalidateQueries({ queryKey: ["customers"] }),
      ]);

      toast.success("Customer updated");
    } catch {
      toast.error("Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await supabase.from("customer_contacts").delete().eq("customer_id", id!);
      const { error } = await supabase.from("customers").delete().eq("id", id!);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
      navigate("/admin/customers");
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm p-6">Loading...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Customer not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/customers">Customers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{customer.company || customer.first_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 leading-none">
            {customer.company || customer.first_name}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Badge variant="outline" className={((statusConfig as any)[(customer as any).status] || statusConfig.new_lead).className}>
                    {((statusConfig as any)[(customer as any).status] || statusConfig.new_lead).label}
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => {
                      updateStatusMutation.mutate(key);
                    }}
                    className="gap-2"
                  >
                    <Badge variant="outline" className={config.className.replace("hover:bg-emerald-200 cursor-pointer", "").replace("hover:bg-blue-200 cursor-pointer", "").replace("hover:bg-amber-200 cursor-pointer", "")}>
                      {config.label}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/orders/create", {
              state: {
                preselectedCustomer: {
                  id: customer?.id,
                  first_name: customer?.first_name,
                  last_name: customer?.last_name,
                  email: customer?.email,
                },
              },
            })}
          >
            Create order
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-destructive hover:text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete customer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this customer and all their contacts. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium animate-in fade-in">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            disabled={!hasUnsavedChanges}
            onClick={() => {
              if (customer) {
                setCompanyName(customer.company || customer.first_name || "");
                setCountry(customer.country || "Israel");
                setAddress(customer.address || "");
                setApartment(customer.apartment || "");
                setCity(customer.city || "");
                setPostalCode(customer.postal_code || "");
              }
              if (existingContacts) {
                setContacts(
                  existingContacts.map((c) => ({
                    id: c.id,
                    first_name: c.first_name,
                    last_name: c.last_name || "",
                    role: c.role || "",
                    phone: c.phone || "",
                    email: c.email || "",
                  }))
                );
              }
            }}
          >
            Discard
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasValidContact || !hasUnsavedChanges}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          {/* Company */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Company</h2>
            <div>
              <Label className="text-sm font-medium text-foreground">Company name</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                className="mt-1.5"
              />
            </div>
          </Card>

          {/* Contacts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Contacts</h2>
              <Button variant="outline" size="sm" onClick={addContact}>
                <Plus className="h-4 w-4 mr-1" />
                Add contact
              </Button>
            </div>

            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contacts added yet. Click "Add contact" to add one.
              </p>
            ) : (
              <div className="space-y-6">
                {contacts.map((contact, index) => (
                  <div key={contact.id || index} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Contact {index + 1}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-white" onClick={() => removeContact(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">First name</Label>
                        <Input value={contact.first_name} onChange={(e) => updateContact(index, "first_name", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Last name</Label>
                        <Input value={contact.last_name} onChange={(e) => updateContact(index, "last_name", e.target.value)} className="mt-1.5" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">Role</Label>
                      <Input value={contact.role} onChange={(e) => updateContact(index, "role", e.target.value)} placeholder="e.g. CEO, CTO, Purchasing Manager" className="mt-1.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Phone</Label>
                        <Input value={contact.phone} onChange={(e) => updateContact(index, "phone", e.target.value)} className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Email</Label>
                        <Input value={contact.email} onChange={(e) => updateContact(index, "email", e.target.value)} type="email" className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Address */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Default address</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Country / region</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue>
                      <span className="inline-flex items-center gap-2">
                        {getCountryCode(country) && <span className={`fi fi-${getCountryCode(country)} rounded-sm`} />}
                        {country}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        <span className="inline-flex items-center gap-2">
                          <span className={`fi fi-${c.code} rounded-sm`} />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Apartment, suite, etc</Label>
                <Input value={apartment} onChange={(e) => setApartment(e.target.value)} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Postal code</Label>
                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar – Timeline */}
        <div className="space-y-6">
          <CustomerTimeline
            customerId={id!}
            customerName={companyName || customer.company || customer.first_name}
            customerCreatedAt={customer.created_at}
            companyName={companyName || customer.company || ""}
            contactPerson={contacts.length > 0 ? `${contacts[0].first_name} ${contacts[0].last_name}`.trim() : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;
