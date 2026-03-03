import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Plus, Trash2 } from "lucide-react";

interface Contact {
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  email: string;
}

const emptyContact = (): Contact => ({
  first_name: "",
  last_name: "",
  role: "",
  phone: "",
  email: "",
});

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);

  const addContact = () => setContacts((prev) => [...prev, emptyContact()]);

  const removeContact = (index: number) =>
    setContacts((prev) => prev.filter((_, i) => i !== index));

  const updateContact = (index: number, field: keyof Contact, value: string) =>
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSaving(true);
    try {
      // Create customer with company name as first_name
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          first_name: companyName.trim(),
          company: companyName.trim(),
        })
        .select("id")
        .single();

      if (customerError) throw customerError;

      // Insert contacts if any
      const validContacts = contacts.filter((c) => c.first_name.trim());
      if (validContacts.length > 0) {
        const { error: contactsError } = await supabase
          .from("customer_contacts")
          .insert(
            validContacts.map((c) => ({
              customer_id: customer.id,
              first_name: c.first_name.trim(),
              last_name: c.last_name.trim() || null,
              role: c.role.trim() || null,
              phone: c.phone.trim() || null,
              email: c.email.trim() || null,
            }))
          );
        if (contactsError) throw contactsError;
      }

      toast.success("Customer created");
      navigate("/admin/customers");
    } catch {
      toast.error("Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
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
                <BreadcrumbPage>Add customer</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-foreground">Add customer</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save customer"}
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Name */}
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
            <p className="text-xs text-muted-foreground mt-1">
              This will be used as the customer name.
            </p>
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
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Contact {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        First name
                      </Label>
                      <Input
                        value={contact.first_name}
                        onChange={(e) =>
                          updateContact(index, "first_name", e.target.value)
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Last name
                      </Label>
                      <Input
                        value={contact.last_name}
                        onChange={(e) =>
                          updateContact(index, "last_name", e.target.value)
                        }
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Role</Label>
                    <Input
                      value={contact.role}
                      onChange={(e) =>
                        updateContact(index, "role", e.target.value)
                      }
                      placeholder="e.g. CEO, CTO, Purchasing Manager"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Phone
                      </Label>
                      <Input
                        value={contact.phone}
                        onChange={(e) =>
                          updateContact(index, "phone", e.target.value)
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Email
                      </Label>
                      <Input
                        value={contact.email}
                        onChange={(e) =>
                          updateContact(index, "email", e.target.value)
                        }
                        type="email"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateCustomer;
