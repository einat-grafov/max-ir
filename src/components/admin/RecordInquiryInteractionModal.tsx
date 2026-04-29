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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const SALES_LEAD_STATUSES = [
  "New",
  "Outreach",
  "Connected",
  "Qualified",
  "Unqualified",
  "Active buying process",
  "Closed Won",
  "Closed Lost",
];

const SUPPORT_STATUSES = [
  "New",
  "In Progress",
  "Resolved",
  "Closed",
];

const UNQUALIFIED_REASONS = [
  "No budget",
  "Wrong industry",
  "Too small",
  "Too large",
  "Not decision maker",
];

const CLOSED_LOST_REASONS = [
  "Chose competitor",
  "No decision",
  "Timing not right",
  "Lost to internal solution",
];

type InquiryNote = Tables<"inquiry_notes">;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiryId: string;
  defaultContact?: string;
  editNote?: InquiryNote | null;
  source?: string;
}

const RecordInquiryInteractionModal = ({
  open,
  onOpenChange,
  inquiryId,
  defaultContact = "",
  editNote,
  source = "sales",
}: Props) => {
  const queryClient = useQueryClient();
  const isEditing = !!editNote;

  const [dateOfInteraction, setDateOfInteraction] = useState<Date>(new Date());
  const [contact, setContact] = useState(defaultContact);
  const [interactionType, setInteractionType] = useState("");
  const [interactionTypeOther, setInteractionTypeOther] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [leadStatusReason, setLeadStatusReason] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [customerFeedback, setCustomerFeedback] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDetails, setFollowUpDetails] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>();

  const resetForm = () => {
    setDateOfInteraction(new Date());
    setContact(defaultContact);
    setInteractionType("");
    setInteractionTypeOther("");
    setLeadStatus("");
    setLeadStatusReason("");
    setSummary("");
    setActionItems("");
    setCustomerFeedback("");
    setFollowUpRequired(false);
    setFollowUpDetails("");
    setNextFollowUpDate(undefined);
  };

  useEffect(() => {
    if (open && editNote) {
      setDateOfInteraction(new Date(editNote.date_of_interaction));
      setContact(editNote.contact_person || defaultContact);
      const isOther = editNote.interaction_type_other && !INTERACTION_TYPES.slice(0, -1).includes(editNote.interaction_type || "");
      if (isOther) {
        setInteractionType("Other");
        setInteractionTypeOther(editNote.interaction_type_other || "");
      } else {
        setInteractionType(editNote.interaction_type || "");
        setInteractionTypeOther("");
      }
      setSummary(editNote.summary || "");
      setActionItems(editNote.action_items || "");
      setCustomerFeedback(editNote.customer_feedback || "");
      setLeadStatus((editNote as any).lead_status || "");
      setLeadStatusReason((editNote as any).lead_status_reason || "");
      setFollowUpRequired(editNote.follow_up_required);
      setFollowUpDetails(editNote.follow_up_details || "");
      setNextFollowUpDate(editNote.next_follow_up_date ? new Date(editNote.next_follow_up_date) : undefined);
    } else if (open && !editNote) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editNote]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const interactionLabel = interactionType === "Other" ? interactionTypeOther : interactionType;
      const contentParts = [interactionLabel ? `[${interactionLabel}]` : "", summary].filter(Boolean);

      const noteData = {
        inquiry_id: inquiryId,
        content: contentParts.join(" ") || "Interaction recorded",
        date_of_interaction: dateOfInteraction.toISOString(),
        contact_person: contact || null,
        interaction_type: interactionType === "Other" ? interactionTypeOther : interactionType || null,
        interaction_type_other: interactionType === "Other" ? interactionTypeOther : null,
        summary: summary || null,
        action_items: actionItems || null,
        customer_feedback: customerFeedback || null,
        lead_status: leadStatus || null,
        lead_status_reason:
          (leadStatus === "Unqualified" || leadStatus === "Closed Lost")
            ? leadStatusReason || null
            : null,
        follow_up_required: followUpRequired,
        follow_up_details: followUpRequired ? followUpDetails || null : null,
        next_follow_up_date: nextFollowUpDate ? format(nextFollowUpDate, "yyyy-MM-dd") : null,
      };

      if (isEditing && editNote) {
        const { error } = await supabase
          .from("inquiry_notes")
          .update(noteData as any)
          .eq("id", editNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inquiry_notes").insert(noteData as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiry-notes", inquiryId] });
      toast.success(isEditing ? "Interaction updated" : "Interaction recorded");
      resetForm();
      onOpenChange(false);
    },
    onError: () => toast.error(isEditing ? "Failed to update interaction" : "Failed to save interaction"),
  });

  const canSave = summary.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <DialogTitle>{isEditing ? "Edit Interaction" : "Record Inquiry Interaction"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto flex-1 pt-4 px-1 -mx-1 pb-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Date of Interaction</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal mt-1.5", !dateOfInteraction && "text-muted-foreground")}
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

          <div>
            <Label className="text-sm font-medium">{source === "support" ? "Status" : "Lead Status"}</Label>
            <Select
              value={leadStatus}
              onValueChange={(v) => {
                setLeadStatus(v);
                if (v !== "Unqualified" && v !== "Closed Lost") setLeadStatusReason("");
              }}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {(source === "support" ? SUPPORT_STATUSES : SALES_LEAD_STATUSES).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(leadStatus === "Unqualified" || leadStatus === "Closed Lost") && (
            <div>
              <Label className="text-sm font-medium">
                {leadStatus === "Unqualified" ? "Reason (Unqualified)" : "Reason (Closed Lost)"}
              </Label>
              <Select value={leadStatusReason} onValueChange={setLeadStatusReason}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {(leadStatus === "Unqualified" ? UNQUALIFIED_REASONS : CLOSED_LOST_REASONS).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          <div>
            <Label className="text-sm font-medium">Action Items / Next Steps</Label>
            <Textarea
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="Enter next steps, actions, or follow-up tasks"
              className="mt-1.5 min-h-[60px] resize-none"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Customer's Feedback / Requests</Label>
            <Textarea
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              placeholder="Insert any feedback, product interests, or concerns raised by the customer."
              className="mt-1.5 min-h-[60px] resize-none"
            />
          </div>

          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Follow-up Required</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">Check this if the inquiry needs a follow-up action.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={followUpRequired}
                onCheckedChange={(checked) => setFollowUpRequired(checked === true)}
                id="inquiry-follow-up-yes"
              />
              <label htmlFor="inquiry-follow-up-yes" className="text-sm">Yes, follow-up needed</label>
            </div>
            {followUpRequired && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Follow-up Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal mt-1.5", !nextFollowUpDate && "text-muted-foreground")}
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
                <div>
                  <Label className="text-sm font-medium">Follow-up Details</Label>
                  <Input
                    value={followUpDetails}
                    onChange={(e) => setFollowUpDetails(e.target.value)}
                    placeholder="Describe the follow-up action needed"
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 shrink-0 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => saveMutation.mutate()} disabled={!canSave || saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordInquiryInteractionModal;
