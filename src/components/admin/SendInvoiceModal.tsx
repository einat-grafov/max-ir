import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Lock, Settings } from "lucide-react";

interface SendInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerEmail?: string | null;
  customerName?: string;
}

const SendInvoiceModal = ({ open, onOpenChange, customerEmail, customerName }: SendInvoiceModalProps) => {
  const [to, setTo] = useState(customerEmail ?? "");
  const [fromAddress] = useState("noreply@max-ir.com");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(`Invoice ${customerName ?? ""}`);
  const [customMessage, setCustomMessage] = useState("");
  const [lockPrices, setLockPrices] = useState(true);
  const [allowDiscountCodes, setAllowDiscountCodes] = useState(false);

  // Reset state when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Send invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* To / From */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">To</label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">From</label>
              <Select value={fromAddress} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={fromAddress}>
                    "MAX-IR" &lt;{fromAddress}&gt;
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cc and Bcc toggle */}
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
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Options card */}
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

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Review invoice</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceModal;
