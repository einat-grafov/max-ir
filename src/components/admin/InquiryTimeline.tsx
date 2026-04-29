import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Plus, Pencil, Trash2 } from "lucide-react";
import IconTooltipButton from "@/components/admin/IconTooltipButton";
import RecordInquiryInteractionModal from "@/components/admin/RecordInquiryInteractionModal";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type InquiryNote = Tables<"inquiry_notes">;

interface TimelineEvent {
  id: string;
  type: "received" | "note";
  message: string;
  date: Date;
  noteData?: InquiryNote;
}

interface Props {
  inquiryId: string;
  inquiryCreatedAt: string;
  productName: string;
  defaultContact?: string;
}

const groupLabel = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

const iconColors: Record<TimelineEvent["type"], string> = {
  received: "bg-blue-500",
  note: "bg-amber-500",
};

const iconElements: Record<TimelineEvent["type"], React.ReactNode> = {
  received: <Mail className="h-2 w-2 text-white" />,
  note: <MessageSquare className="h-2 w-2 text-white" />,
};

const InquiryTimeline = ({ inquiryId, inquiryCreatedAt, productName, defaultContact }: Props) => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<InquiryNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<InquiryNote | null>(null);

  const { data: notes } = useQuery({
    queryKey: ["inquiry-notes", inquiryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiry_notes")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InquiryNote[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiry_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiry-notes", inquiryId] });
      toast.success("Interaction deleted");
      setDeletingNote(null);
    },
    onError: () => toast.error("Failed to delete interaction"),
  });

  const receivedEvent: TimelineEvent = {
    id: "received",
    type: "received",
    message: `Inquiry received for ${productName}`,
    date: new Date(inquiryCreatedAt),
  };
  const events: TimelineEvent[] = [
    receivedEvent,
    ...(notes || []).map<TimelineEvent>((n) => ({
      id: `note-${n.id}`,
      type: "note",
      message: n.summary || n.content,
      date: new Date(n.created_at),
      noteData: n,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const grouped: { label: string; events: TimelineEvent[] }[] = [];
  let lastLabel = "";
  for (const ev of events) {
    const label = groupLabel(ev.date);
    if (label !== lastLabel) {
      grouped.push({ label, events: [ev] });
      lastLabel = label;
    } else {
      grouped[grouped.length - 1].events.push(ev);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Timeline</h2>
      </div>

      <Button variant="outline" className="w-full mb-5" onClick={() => { setEditingNote(null); setModalOpen(true); }}>
        <Plus className="h-4 w-4 mr-2" />
        Record interaction
      </Button>

      <RecordInquiryInteractionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        inquiryId={inquiryId}
        defaultContact={defaultContact}
        editNote={editingNote}
      />

      <div className="relative">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-8">No activity yet.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide pl-8">
                {group.label}
              </p>
              {group.events.map((event) => (
                <div key={event.id} className="flex gap-3 mb-4 last:mb-0 group">
                  <div className="relative flex flex-col items-center w-[14px] shrink-0 pt-1">
                    <div className="absolute inset-0 left-1/2 w-px -translate-x-1/2 bg-border" />
                    <div className={cn("relative z-10 h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0", iconColors[event.type])}>
                      {iconElements[event.type]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-3">{event.message}</p>
                      {event.noteData?.action_items && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Next: </span>{event.noteData.action_items}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(event.date, "h:mm a")}
                      </span>
                      {event.noteData && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                          <IconTooltipButton
                            label="Edit"
                            className="h-7 w-7"
                            onClick={() => { setEditingNote(event.noteData!); setModalOpen(true); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </IconTooltipButton>
                          <IconTooltipButton
                            label="Delete"
                            className="h-7 w-7 hover:bg-destructive hover:text-white"
                            onClick={() => setDeletingNote(event.noteData!)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </IconTooltipButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!deletingNote} onOpenChange={(o) => !o && setDeletingNote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingNote && deleteMutation.mutate(deletingNote.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default InquiryTimeline;
