import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, User, Building2, Briefcase, MessageSquare, ListChecks, MessageCircle, CalendarCheck, Paperclip, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import RecordInteractionModal from "@/components/admin/RecordInteractionModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface NoteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Tables<"customer_notes"> | null;
  customerId: string;
  customerName: string;
  companyName: string;
  contactPerson: string;
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

const NoteDetailModal = ({ open, onOpenChange, note, customerId, customerName, companyName, contactPerson }: NoteDetailModalProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Tables<"customer_notes"> | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const interactionType = note?.interaction_type === "Other" && note?.interaction_type_other
    ? note.interaction_type_other
    : note?.interaction_type;

  const salesStage = note?.sales_stage === "Other" && note?.sales_stage_other
    ? note.sales_stage_other
    : note?.sales_stage;

  const handleEditClick = () => {
    setEditingNote(note);
    onOpenChange(false);
    setTimeout(() => setEditOpen(true), 150);
  };

  const handleEditClose = (open: boolean) => {
    setEditOpen(open);
    if (!open) setEditingNote(null);
  };

  const handleDelete = async () => {
    if (!note) return;
    setIsDeleting(true);
    const { error } = await supabase.from("customer_notes").delete().eq("id", note.id);
    setIsDeleting(false);
    if (error) {
      toast.error("Failed to delete note");
    } else {
      toast.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {note && (
          <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  Interaction Details
                </DialogTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEditClick}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={User} label="Customer" value={note.customer_name} />
                <DetailRow icon={Building2} label="Company" value={note.company} />
                <DetailRow icon={User} label="Contact Person" value={note.contact_person} />
                <DetailRow icon={Briefcase} label="Sales Rep" value={note.sales_representative} />
              </div>

              <Separator />

              <DetailRow icon={MessageSquare} label="Summary" value={note.summary} />

              {note.content && note.content !== note.summary && (
                <DetailRow icon={MessageSquare} label="Notes" value={note.content} />
              )}

              <DetailRow icon={ListChecks} label="Action Items / Next Steps" value={note.action_items} />
              <DetailRow icon={MessageCircle} label="Customer Feedback / Requests" value={note.customer_feedback} />

              <Separator />

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
        )}
      </Dialog>

      <RecordInteractionModal
        open={editOpen}
        onOpenChange={handleEditClose}
        customerId={customerId}
        customerName={customerName}
        companyName={companyName}
        contactPerson={contactPerson}
        editNote={editingNote}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The interaction record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NoteDetailModal;
