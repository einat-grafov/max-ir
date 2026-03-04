import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, User, Building2, Briefcase, MessageSquare, ListChecks, MessageCircle, CalendarCheck, Paperclip } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface NoteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Tables<"customer_notes"> | null;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
      </div>
    </div>
  );
};

const NoteDetailModal = ({ open, onOpenChange, note }: NoteDetailModalProps) => {
  if (!note) return null;

  const interactionType = note.interaction_type === "Other" && note.interaction_type_other
    ? note.interaction_type_other
    : note.interaction_type;

  const salesStage = note.sales_stage === "Other" && note.sales_stage_other
    ? note.sales_stage_other
    : note.sales_stage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Interaction Details
          </DialogTitle>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="text-xs">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(new Date(note.date_of_interaction), "MMM d, yyyy 'at' h:mm a")}
            </Badge>
            {interactionType && (
              <Badge variant="secondary" className="text-xs">
                {interactionType}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* People & Company */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={User} label="Customer" value={note.customer_name} />
            <DetailRow icon={Building2} label="Company" value={note.company} />
            <DetailRow icon={User} label="Contact Person" value={note.contact_person} />
            <DetailRow icon={Briefcase} label="Sales Rep" value={note.sales_representative} />
          </div>

          <Separator />

          {/* Summary */}
          <DetailRow icon={MessageSquare} label="Summary" value={note.summary} />

          {/* Note Content */}
          {note.content && note.content !== note.summary && (
            <DetailRow icon={MessageSquare} label="Notes" value={note.content} />
          )}

          {/* Action Items */}
          <DetailRow icon={ListChecks} label="Action Items / Next Steps" value={note.action_items} />

          {/* Customer Feedback */}
          <DetailRow icon={MessageCircle} label="Customer Feedback / Requests" value={note.customer_feedback} />

          <Separator />

          {/* Sales & Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            {salesStage && (
              <DetailRow icon={Briefcase} label="Sales Stage" value={salesStage} />
            )}
            {note.assigned_sales_rep && (
              <DetailRow icon={User} label="Assigned Sales Rep" value={note.assigned_sales_rep} />
            )}
          </div>

          {note.follow_up_required && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium text-foreground">Follow-up Required</p>
              </div>
              {note.next_follow_up_date && (
                <p className="text-sm text-muted-foreground pl-6">
                  Due: {format(new Date(note.next_follow_up_date), "MMM d, yyyy")}
                </p>
              )}
              {note.follow_up_details && (
                <p className="text-sm text-muted-foreground pl-6">{note.follow_up_details}</p>
              )}
            </div>
          )}

          {/* Attachment */}
          {note.attachment_url && note.attachment_name && (
            <>
              <Separator />
              <a
                href={note.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Paperclip className="h-4 w-4" />
                {note.attachment_name}
              </a>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDetailModal;
