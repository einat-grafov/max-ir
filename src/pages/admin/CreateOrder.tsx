import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card } from "@/components/ui/card";

const CreateOrder = () => {
  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-foreground mb-6">Create order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Products</h2>
            <div className="space-y-3">
              <div>
                <Label htmlFor="product-search">Search or add a product</Label>
                <Input id="product-search" placeholder="Search products..." className="mt-1.5" />
              </div>
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Add products to this order by searching above.
                </p>
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Payment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subtotal">Subtotal</Label>
                <Input id="subtotal" value="₪0.00" readOnly className="mt-1.5 bg-muted/50" />
              </div>
              <div>
                <Label htmlFor="shipping">Shipping</Label>
                <Input id="shipping" placeholder="₪0.00" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" placeholder="₪0.00" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="total">Total</Label>
                <Input id="total" value="₪0.00" readOnly className="mt-1.5 bg-muted/50 font-semibold" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Notes</h2>
            <Textarea placeholder="Add a note to this order..." rows={3} />
          </Card>

          {/* Customer */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Customer</h2>
            <Input placeholder="Search or create a customer" />
          </Card>

          {/* Status */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Status</h2>
            <Select defaultValue="draft">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button variant="outline" asChild>
          <Link to="/admin/orders">Discard</Link>
        </Button>
        <Button>Save order</Button>
      </div>
    </div>
  );
};

export default CreateOrder;
