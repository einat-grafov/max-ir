import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DEFAULT_TEMPLATES = [
  {
    key: "order-confirmation",
    name: "Order Confirmation",
    description: "Sent automatically when a new order is created",
    defaultSubject: "Order #{{orderNumber}} confirmed",
    variables: ["customerName", "orderNumber", "total", "items"],
  },
  {
    key: "invoice-email",
    name: "Invoice Email",
    description: "Sent when an invoice is issued to a customer",
    defaultSubject: "Your invoice",
    variables: ["customerName", "subject", "customMessage"],
  },
  {
    key: "inquiry-confirmation",
    name: "Inquiry Confirmation",
    description: "Sent when a product inquiry is submitted",
    defaultSubject: "We received your inquiry",
    variables: ["name", "products"],
  },
  {
    key: "contact-confirmation",
    name: "Contact Confirmation",
    description: "Sent when the contact form is submitted",
    defaultSubject: "We received your message",
    variables: ["name", "subject"],
  },
  {
    key: "careers-confirmation",
    name: "Careers Confirmation",
    description: "Sent when a job application is submitted",
    defaultSubject: "We received your application",
    variables: ["name"],
  },
];

const EmailSettings = () => {
  const { data: customTemplates = [] } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const getCustomTemplate = (key: string) =>
    customTemplates.find((t: any) => t.template_key === key);

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/home">Settings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Email Templates</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize the emails sent to your customers
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DEFAULT_TEMPLATES.map((template) => {
          const custom = getCustomTemplate(template.key);
          const isCustomized = !!custom;

          return (
            <Link key={template.key} to={`/admin/settings/emails/${template.key}`}>
              <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground">
                        {template.name}
                      </h3>
                      {isCustomized && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                          Customized
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Subject: {custom?.subject || template.defaultSubject}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EmailSettings;
