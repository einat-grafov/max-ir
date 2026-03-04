import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { ShoppingCart, Mail, UserPlus, MessageSquare, Paperclip, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import RecordInteractionModal from "@/components/admin/RecordInteractionModal";
import NoteDetailModal from "@/components/admin/NoteDetailModal";
import type { Tables } from "@/integrations/supabase/types";

interface TimelineEvent {
  id: string;
  type: "order" | "inquiry" | "created" | "note";
  message: string;
  date: Date;
  link?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  noteData?: Tables<"customer_notes">;
}

interface CustomerTimelineProps {
  customerId: string;
  customerName: string;
  customerCreatedAt: string;
  companyName?: string;
  contactPerson?: string;
}

const groupLabel = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

const EventIcon = ({ type }: { type: TimelineEvent["type"] }) => {
  switch (type) {
    case "order":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 translate-x-[calc(50%-0.5px)] rounded-full bg-primary flex items-center justify-center">
          <ShoppingCart className="h-2 w-2 text-primary-foreground" />
        </div>
      );
    case "inquiry":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 translate-x-[calc(50%-0.5px)] rounded-full bg-blue-500 flex items-center justify-center">
          <Mail className="h-2 w-2 text-white" />
        </div>
      );
    case "note":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 translate-x-[calc(50%-0.5px)] rounded-full bg-amber-500 flex items-center justify-center">
          <MessageSquare className="h-2 w-2 text-white" />
        </div>
      );
    case "created":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 translate-x-[calc(50%-0.5px)] rounded-full bg-green-500 flex items-center justify-center">
          <UserPlus className="h-2 w-2 text-white" />
        </div>
      );
  }
};

const CustomerTimeline = ({ customerId, customerName, customerCreatedAt, companyName, contactPerson }: CustomerTimelineProps) => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Tables<"customer_notes"> | null>(null);
  const { data: orders } = useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total, created_at, status, payment_status")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: inquiries } = useQuery({
    queryKey: ["customer-inquiries", customerName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("id, product_name, created_at, company_name")
        .or(`company_name.eq.${customerName},name.eq.${customerName}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!customerName,
  });

  const { data: notes } = useQuery({
    queryKey: ["customer-notes", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_notes")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Build events list
  const events: TimelineEvent[] = [];

  events.push({
    id: "created",
    type: "created",
    message: "Customer account created",
    date: new Date(customerCreatedAt),
  });

  orders?.forEach((order) => {
    events.push({
      id: `order-${order.id}`,
      type: "order",
      message: `Order #D${order.order_number} placed — $${Number(order.total).toFixed(2)}`,
      date: new Date(order.created_at),
      link: `/admin/orders/${order.id}`,
    });
  });

  inquiries?.forEach((inquiry) => {
    events.push({
      id: `inquiry-${inquiry.id}`,
      type: "inquiry",
      message: `Inquiry received for ${inquiry.product_name}`,
      date: new Date(inquiry.created_at),
      link: `/admin/inquiries`,
    });
  });

  notes?.forEach((note) => {
    const displayMessage = note.summary || note.content;
    events.push({
      id: `note-${note.id}`,
      type: "note",
      message: displayMessage,
      date: new Date(note.created_at),
      attachmentName: note.attachment_name || undefined,
      attachmentUrl: note.attachment_url || undefined,
      noteData: note,
    });
  });

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by day
  const grouped: { label: string; events: TimelineEvent[] }[] = [];
  let lastLabel = "";
  for (const event of events) {
    const label = groupLabel(event.date);
    if (label !== lastLabel) {
      grouped.push({ label, events: [event] });
      lastLabel = label;
    } else {
      grouped[grouped.length - 1].events.push(event);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Timeline</h2>
      </div>

      {/* Leave a note button */}
      <Button
        variant="outline"
        className="w-full mb-5"
        onClick={() => setModalOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Leave a note
      </Button>

      <RecordInteractionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        customerId={customerId}
        customerName={customerName}
        companyName={companyName || customerName}
        contactPerson={contactPerson || ""}
      />

      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

        {/* Events */}
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {group.label}
              </p>
              {group.events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "relative mb-4 last:mb-0",
                    event.noteData && "cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md transition-colors"
                  )}
                  onClick={() => {
                    if (event.noteData) setSelectedNote(event.noteData);
                  }}
                >
                  <EventIcon type={event.type} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">
                        {event.link ? (
                          <Link to={event.link} className="hover:underline">
                            {event.message}
                          </Link>
                        ) : (
                          event.message
                        )}
                      </p>
                      {event.attachmentUrl && event.attachmentName && (
                        <a
                          href={event.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 mt-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Paperclip className="h-3 w-3" />
                          <span>{event.attachmentName}</span>
                        </a>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(event.date, "h:mm a")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <NoteDetailModal
        open={!!selectedNote}
        onOpenChange={(open) => { if (!open) setSelectedNote(null); }}
        note={selectedNote}
        customerId={customerId}
        customerName={customerName}
        companyName={companyName || customerName}
        contactPerson={contactPerson || ""}
      />
    </Card>
  );
};

export default CustomerTimeline;
