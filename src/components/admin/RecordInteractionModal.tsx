import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const INTERACTION_TYPES = [
  "Email",
  "Phone call",
  "Meeting (In-person/Virtual)",
  "Chat / Support Ticket",
  "Other",
];

const SALES_STAGES = [
  "New lead",
  "Discovery",
  "Solution proposed",
  "Quote sent",
  "Negotiation",
  "Other",
];

interface RecordInteractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  companyName: string;
  contactPerson: string;
  editNote?: Tables<"customer_notes"> | null;
}

const RecordInteractionModal = ({
  open,
  onOpenChange,
  customerId,
  customerName,
  companyName,
  contactPerson,
  editNote,
}: RecordInteractionModalProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!editNote;

  const [dateOfInteraction, setDateOfInteraction] = useState<Date>(new Date());
  const [contact, setContact] = useState(contactPerson);
  const [interactionType, setInteractionType] = useState("");
  const [interactionTypeOther, setInteractionTypeOther] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [customerFeedback, setCustomerFeedback] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDetails, setFollowUpDetails] = useState("");
  const [salesStage, setSalesStage] = useState("");
  const [salesStageOther, setSalesStageOther] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>();

  const populateFromNote = (note: Tables<"customer_notes">) => {
    setDateOfInteraction(new Date(note.date_of_interaction));
    setContact(note.contact_person || contactPerson);
    const isOtherInteraction = note.interaction_type_other && !INTERACTION_TYPES.slice(0, -1).includes(note.interaction_type || "");
    if (isOtherInteraction) {
      setInteractionType("Other");
      setInteractionTypeOther(note.interaction_type_other || "");
    } else {
      setInteractionType(note.interaction_type || "");
      setInteractionTypeOther("");
    }
    setSummary(note.summary || "");
    setActionItems(note.action_items || "");
    setCustomerFeedback(note.customer_feedback || "");
    setFollowUpRequired(note.follow_up_required);
    setFollowUpDetails(note.follow_up_details || "");
    const isOtherStage = note.sales_stage_other && !SALES_STAGES.slice(0, -1).includes(note.sales_stage || "");
    if (isOtherStage) {
      setSalesStage("Other");
      setSalesStageOther(note.sales_stage_other || "");
    } else {
      setSalesStage(note.sales_stage || "");
      setSalesStageOther("");
    }
    setNextFollowUpDate(note.next_follow_up_date ? new Date(note.next_follow_up_date) : undefined);
  };

  const resetForm = () => {
    setDateOfInteraction(new Date());
    setContact(contactPerson);
    setInteractionType("");
    setInteractionTypeOther("");
    setSummary("");
    setActionItems("");
    setCustomerFeedback("");
    setFollowUpRequired(false);
    setFollowUpDetails("");
    setSalesStage("");
    setSalesStageOther("");
    setNextFollowUpDate(undefined);
  };

  // Populate form when opening in edit mode
  useEffect(() => {
    if (open && editNote) {
      populateFromNote(editNote);
    } else if (open && !editNote) {
      resetForm();
    }
  }, [open, editNote]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const interactionLabel =
        interactionType === "Other" ? interactionTypeOther : interactionType;
      const contentParts = [
        interactionLabel ? `[${interactionLabel}]` : "",
        summary,
      ].filter(Boolean);

      const noteData = {
        customer_id: customerId,
        content: contentParts.join(" ") || "Interaction recorded",
        date_of_interaction: dateOfInteraction.toISOString(),
        customer_name: customerName || null,
        company: companyName || null,
        contact_person: contact || null,
        interaction_type: interactionType === "Other" ? interactionTypeOther : interactionType || null,
        interaction_type_other: interactionType === "Other" ? interactionTypeOther : null,
        summary: summary || null,
        action_items: actionItems || null,
        customer_feedback: customerFeedback || null,
        follow_up_required: followUpRequired,
        follow_up_details: followUpRequired ? followUpDetails || null : null,
        sales_stage: salesStage === "Other" ? salesStageOther : salesStage || null,
        sales_stage_other: salesStage === "Other" ? salesStageOther : null,
        next_follow_up_date: nextFollowUpDate ? format(nextFollowUpDate, "yyyy-MM-dd") : null,
      };

      if (isEditing && editNote) {
        const { error } = await supabase
          .from("customer_notes")
          .update(noteData as any)
          .eq("id", editNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customer_notes").insert(noteData as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      toast.success(isEditing ? "Interaction updated" : "Interaction recorded");
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast.error(isEditing ? "Failed to update interaction" : "Failed to save interaction");
    },
  });

  const canSave = summary.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Interaction" : "Record Customer Interaction"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Row 1: Date + Contact Person */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Date of Interaction</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5",
                      !dateOfInteraction && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateOfInteraction ? format(dateOfInteraction, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfInteraction}
                    onSelect={(d) => d && setDateOfInteraction(d)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm font-medium">Contact Person</Label>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {/* Interaction Type */}
          <div>
            <Label className="text-sm font-medium">Type of Interaction</Label>
            <Select value={interactionType} onValueChange={setInteractionType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {interactionType === "Other" && (
            <div>
              <Label className="text-sm font-medium">Specify Interaction Type</Label>
              <Input
                value={interactionTypeOther}
                onChange={(e) => setInteractionTypeOther(e.target.value)}
                placeholder="e.g. Trade show, Conference"
                className="mt-1.5"
              />
            </div>
          )}

          {/* Summary */}
          <div>
            <Label className="text-sm font-medium">
              Summary of Interaction <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter key points discussed"
              className="mt-1.5 min-h-[80px] resize-none"
            />
          </div>

          {/* Action Items */}
          <div>
            <Label className="text-sm font-medium">Action Items / Next Steps</Label>
            <Textarea
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="Enter next steps, actions, or follow-up tasks"
              className="mt-1.5 min-h-[60px] resize-none"
            />
          </div>

          {/* Customer Feedback */}
          <div>
            <Label className="text-sm font-medium">Customer's Feedback / Requests</Label>
            <Textarea
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              placeholder="Insert any feedback, product interests, or concerns raised by the customer."
              className="mt-1.5 min-h-[60px] resize-none"
            />
          </div>

          {/* Follow-up Required */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Follow-up Required</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">Check this if the customer needs a follow-up action, such as a call-back, quote, or demo.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={followUpRequired}
                onCheckedChange={(checked) => setFollowUpRequired(checked === true)}
                id="follow-up-yes"
              />
              <label htmlFor="follow-up-yes" className="text-sm">Yes, follow-up needed</label>
            </div>
            {followUpRequired && (
              <div>
                <Label className="text-sm font-medium">Follow-up Details</Label>
                <Input
                  value={followUpDetails}
                  onChange={(e) => setFollowUpDetails(e.target.value)}
                  placeholder="Specify follow-up date and action needed"
                  className="mt-1.5"
                />
              </div>
            )}
          </div>

          {/* Row: Sales Stage + Follow-up Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Sales Stage</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">Track where this customer is in the sales pipeline.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={salesStage} onValueChange={setSalesStage}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  {SALES_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Next Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5",
                      !nextFollowUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {nextFollowUpDate ? format(nextFollowUpDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={nextFollowUpDate}
                    onSelect={setNextFollowUpDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {salesStage === "Other" && (
            <div>
              <Label className="text-sm font-medium">Specify Sales Stage</Label>
              <Input
                value={salesStageOther}
                onChange={(e) => setSalesStageOther(e.target.value)}
                placeholder="e.g. Pilot, Custom stage"
                className="mt-1.5"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordInteractionModal;
