import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Copy, RotateCcw, Save } from "lucide-react";

interface TemplateMeta {
  key: string;
  name: string;
  defaultSubject: string;
  variables: { name: string; description: string }[];
  defaultSections: { greeting: string; body: string; closing: string };
}

const TEMPLATE_META: Record<string, TemplateMeta> = {
  "order-confirmation": {
    key: "order-confirmation",
    name: "Order Confirmation",
    defaultSubject: "Order #{{orderNumber}} confirmed",
    variables: [
      { name: "customerName", description: "Customer's display name" },
      { name: "orderNumber", description: "Order number (e.g. 1042)" },
      { name: "total", description: "Formatted order total (e.g. $2,500.00)" },
      { name: "items", description: "Comma-separated list of items" },
    ],
    defaultSections: {
      greeting: "Hi {{customerName}}, thank you for your order (#{{orderNumber}})!",
      body: "Items: {{items}}\nTotal: {{total}}\n\nWe'll be in touch with updates on your order. If you have any questions, feel free to reply to this email.",
      closing: "Best regards, The MAX-IR Team",
    },
  },
  "invoice-email": {
    key: "invoice-email",
    name: "Invoice Email",
    defaultSubject: "{{subject}}",
    variables: [
      { name: "customerName", description: "Customer's display name" },
      { name: "subject", description: "Invoice subject line" },
      { name: "customMessage", description: "Custom message from admin" },
    ],
    defaultSections: {
      greeting: "Hi {{customerName}},",
      body: "Here is your invoice. Please review the details and complete payment at your convenience.\n\n{{customMessage}}",
      closing: "If you have any questions about this invoice, feel free to reply to this email.\n\nBest regards, The MAX-IR Team",
    },
  },
  "inquiry-confirmation": {
    key: "inquiry-confirmation",
    name: "Inquiry Confirmation",
    defaultSubject: "We received your inquiry",
    variables: [
      { name: "name", description: "Inquirer's name" },
      { name: "products", description: "Product name(s) inquired about" },
    ],
    defaultSections: {
      greeting: "{{name}} ? Thank you, {{name}}! : Thank you for your inquiry!",
      body: "We have received your product inquiry regarding {{products}} and our team will review it shortly.\n\nA member of our team will get back to you as soon as possible.",
      closing: "Best regards, The MAX-IR Team",
    },
  },
  "contact-confirmation": {
    key: "contact-confirmation",
    name: "Contact Confirmation",
    defaultSubject: "We received your message",
    variables: [
      { name: "name", description: "Contact's name" },
      { name: "subject", description: "Subject of the message" },
    ],
    defaultSections: {
      greeting: "{{name}} ? Thank you, {{name}}! : Thank you for reaching out!",
      body: "We have received your message regarding \"{{subject}}\" and will get back to you as soon as possible.\n\nOur team typically responds within 1–2 business days.",
      closing: "Best regards, The MAX-IR Team",
    },
  },
  "careers-confirmation": {
    key: "careers-confirmation",
    name: "Careers Confirmation",
    defaultSubject: "We received your application",
    variables: [
      { name: "name", description: "Applicant's name" },
    ],
    defaultSections: {
      greeting: "{{name}} ? Thank you, {{name}}! : Thank you for applying!",
      body: "We have received your application and appreciate your interest in joining MAX-IR.\n\nOur team will review your application and get back to you if there's a good fit.",
      closing: "Best regards, The MAX-IR Team",
    },
  },
};

const EmailTemplateEditor = () => {
  const { templateKey } = useParams<{ templateKey: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const meta = templateKey ? TEMPLATE_META[templateKey] : null;

  const [subject, setSubject] = useState("");
  const [greeting, setGreeting] = useState("");
  const [body, setBody] = useState("");
  const [closing, setClosing] = useState("");

  const { data: existingTemplate, isLoading } = useQuery({
    queryKey: ["email-template", templateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", templateKey!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!templateKey,
  });

  useEffect(() => {
    if (!meta) return;
    if (existingTemplate) {
      setSubject(existingTemplate.subject || meta.defaultSubject);
      const sections = existingTemplate.sections as any;
      setGreeting(sections?.greeting || meta.defaultSections.greeting);
      setBody(sections?.body || meta.defaultSections.body);
      setClosing(sections?.closing || meta.defaultSections.closing);
    } else {
      setSubject(meta.defaultSubject);
      setGreeting(meta.defaultSections.greeting);
      setBody(meta.defaultSections.body);
      setClosing(meta.defaultSections.closing);
    }
  }, [existingTemplate, meta]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        template_key: templateKey!,
        subject,
        sections: { greeting, body, closing },
        updated_by: user?.id || null,
      };

      if (existingTemplate) {
        const { error } = await supabase
          .from("email_templates")
          .update(payload)
          .eq("id", existingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("email_templates")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-template", templateKey] });
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template saved");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save template");
    },
  });

  const handleReset = () => {
    if (!meta) return;
    setSubject(meta.defaultSubject);
    setGreeting(meta.defaultSections.greeting);
    setBody(meta.defaultSections.body);
    setClosing(meta.defaultSections.closing);
  };

  const copyVariable = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    toast.success(`Copied {{${varName}}}`);
  };

  if (!meta) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-muted-foreground mb-4">Template not found</p>
        <Button variant="outline" asChild>
          <Link to="/admin/settings/emails">Back to templates</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/settings/emails">Email Templates</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{meta.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/settings/emails")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{meta.name}</h1>
          {existingTemplate && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Customized
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to default
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject" className="text-sm font-medium">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5"
                  placeholder="Email subject..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Email Content</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="greeting" className="text-sm font-medium">Greeting</Label>
                <Textarea
                  id="greeting"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="mt-1.5"
                  rows={2}
                  placeholder="e.g. Hi {{customerName}},"
                />
              </div>
              <div>
                <Label htmlFor="body" className="text-sm font-medium">Body</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1.5"
                  rows={6}
                  placeholder="Main email content..."
                />
              </div>
              <div>
                <Label htmlFor="closing" className="text-sm font-medium">Closing</Label>
                <Textarea
                  id="closing"
                  value={closing}
                  onChange={(e) => setClosing(e.target.value)}
                  className="mt-1.5"
                  rows={2}
                  placeholder="e.g. Best regards, The Team"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Variable picker sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-3">Available Variables</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Click to copy a variable, then paste it into any field above.
            </p>
            <div className="space-y-2">
              {meta.variables.map((v) => (
                <button
                  key={v.name}
                  onClick={() => copyVariable(v.name)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                >
                  <div>
                    <code className="text-xs font-mono text-primary">{`{{${v.name}}}`}</code>
                    <p className="text-xs text-muted-foreground mt-0.5">{v.description}</p>
                  </div>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-3">Preview</h2>
            <div className="border border-border rounded-lg p-4 bg-background text-sm space-y-3">
              <p className="text-xs text-muted-foreground">
                <strong>Subject:</strong> {subject}
              </p>
              <hr className="border-border" />
              <p className="text-foreground whitespace-pre-wrap">{greeting}</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{body}</p>
              <p className="text-muted-foreground text-xs whitespace-pre-wrap">{closing}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
