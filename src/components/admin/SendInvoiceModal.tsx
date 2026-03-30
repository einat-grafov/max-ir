import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Lock, Settings, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SendInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerEmail?: string | null;
  customerName?: string;
  invoiceSent: boolean;
  onInvoiceSent: () => void;
}

const SendInvoiceModal = ({ open, onOpenChange, customerEmail, customerName, invoiceSent, onInvoiceSent }: SendInvoiceModalProps) => {
  const [step, setStep] = useState<"compose" | "preview">("compose");
  const [to, setTo] = useState(customerEmail ?? "");
  const [fromAddress] = useState("noreply@max-ir.com");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(`Invoice ${customerName ?? ""}`);
  const [customMessage, setCustomMessage] = useState("");
  const [lockPrices, setLockPrices] = useState(true);
  const [allowDiscountCodes, setAllowDiscountCodes] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setStep("compose");
      setTo(customerEmail ?? "");
      setSubject(`Invoice ${customerName ?? ""}`);
      setCustomMessage("");
      setShowCcBcc(false);
      setCc("");
      setBcc("");
      setLockPrices(true);
      setAllowDiscountCodes(false);
    }
    onOpenChange(newOpen);
  };

  const handleSend = () => {
    onInvoiceSent();
    onOpenChange(false);
    toast.success("Invoice sent successfully");
  };

  if (step === "preview") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setStep("compose")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </button>
              Review invoice
            </DialogTitle>
          </DialogHeader>

          {/* Email preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Email header */}
            <div className="bg-muted/50 px-5 py-3 text-sm space-y-1 border-b border-border">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">To:</span>
                <span className="text-foreground">{to}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">From:</span>
                <span className="text-foreground">"MAX-IR" &lt;{fromAddress}&gt;</span>
              </div>
              {cc && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-14 shrink-0">Cc:</span>
                  <span className="text-foreground">{cc}</span>
                </div>
              )}
              {bcc && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-14 shrink-0">Bcc:</span>
                  <span className="text-foreground">{bcc}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">Subject:</span>
                <span className="text-foreground font-medium">{subject}</span>
              </div>
            </div>

            {/* Email body */}
            <div className="px-6 py-6 space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-foreground">MAX-IR</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Invoice</p>
              </div>

              <div className="border-t border-border pt-4 text-sm text-foreground space-y-3">
                <p>Hi {customerName ?? "there"},</p>
                <p>Here is your invoice. Please review the details and complete payment at your convenience.</p>
                {customMessage && (
                  <div className="bg-muted/40 rounded-md p-3 text-sm text-foreground italic">
                    {customMessage}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <div className="bg-primary text-primary-foreground rounded-md px-6 py-2.5 text-sm font-medium">
                  View Invoice
                </div>
              </div>

              <div className="border-t border-border pt-4 text-xs text-muted-foreground text-center space-y-1">
                <p>If you have any questions, reply to this email or contact us at {fromAddress}</p>
                <p>© {new Date().getFullYear()} MAX-IR. All rights reserved.</p>
              </div>
            </div>
          </div>

          {/* Options summary */}
          <div className="text-xs text-muted-foreground space-y-1 px-1">
            <p>• Prices {lockPrices ? "locked" : "not locked"}</p>
            <p>• Discount codes {allowDiscountCodes ? "allowed" : "not allowed"}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSend}>
              {invoiceSent ? "Resend invoice" : "Send invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{invoiceSent ? "Resend invoice" : "Send invoice"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* To / From */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={fromAddress} disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={fromAddress}>"MAX-IR" &lt;{fromAddress}&gt;</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cc/Bcc toggle */}
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
            onClick={() => setShowCcBcc(!showCcBcc)}
          >
            Cc and Bcc recipients
            {showCcBcc ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showCcBcc && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Cc</label>
                <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Bcc</label>
                <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          {/* Custom message */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Custom message (optional)</label>
            <Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} className="min-h-[120px] resize-none" />
          </div>

          {/* Options */}
          <div className="border border-border rounded-lg divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Product prices</p>
                  <p className="text-xs text-muted-foreground">Lock all product prices so they don't change</p>
                </div>
              </div>
              <Switch checked={lockPrices} onCheckedChange={setLockPrices} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Discount codes</p>
                  <p className="text-xs text-muted-foreground">Allow your customer to enter discount codes</p>
                </div>
              </div>
              <Switch checked={allowDiscountCodes} onCheckedChange={setAllowDiscountCodes} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => setStep("preview")}>Review invoice</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceModal;
