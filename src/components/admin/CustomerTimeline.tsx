import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { ShoppingCart, Mail, UserPlus, MessageSquare, Paperclip, Plus, Filter, CalendarIcon, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import RecordInteractionModal from "@/components/admin/RecordInteractionModal";
import NoteDetailModal from "@/components/admin/NoteDetailModal";
import type { Tables } from "@/integrations/supabase/types";
import type { DateRange } from "react-day-picker";

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

const iconColors: Record<TimelineEvent["type"], string> = {
  order: "bg-primary",
  inquiry: "bg-blue-500",
  note: "bg-amber-500",
  created: "bg-green-500",
};

const iconElements: Record<TimelineEvent["type"], React.ReactNode> = {
  order: <ShoppingCart className="h-2 w-2 text-primary-foreground" />,
  inquiry: <Mail className="h-2 w-2 text-white" />,
  note: <MessageSquare className="h-2 w-2 text-white" />,
  created: <UserPlus className="h-2 w-2 text-white" />,
};

const EVENT_TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "note", label: "Notes" },
  { value: "order", label: "Orders" },
  { value: "inquiry", label: "Inquiries" },
];

const DATE_PRESETS = [
  { value: "all", label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

const CustomerTimeline = ({ customerId, customerName, customerCreatedAt, companyName, contactPerson }: CustomerTimelineProps) => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Tables<"customer_notes"> | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
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

  // Apply filters
  const isFiltering = typeFilter !== "all" || datePreset !== "all";

  const filteredEvents = useMemo(() => {
    let result = events;

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter);
    }

    // Date filter
    if (datePreset !== "all" && datePreset !== "custom") {
      const days = parseInt(datePreset);
      const start = startOfDay(subDays(new Date(), days));
      const end = endOfDay(new Date());
      result = result.filter((e) => isWithinInterval(e.date, { start, end }));
    } else if (datePreset === "custom" && customDateRange?.from) {
      const start = startOfDay(customDateRange.from);
      const end = endOfDay(customDateRange.to || customDateRange.from);
      result = result.filter((e) => isWithinInterval(e.date, { start, end }));
    }

    return result;
  }, [events, typeFilter, datePreset, customDateRange]);

  // Group by day
  const grouped: { label: string; events: TimelineEvent[] }[] = [];
  let lastLabel = "";
  for (const event of filteredEvents) {
    const label = groupLabel(event.date);
    if (label !== lastLabel) {
      grouped.push({ label, events: [event] });
      lastLabel = label;
    } else {
      grouped[grouped.length - 1].events.push(event);
    }
  }

  const clearFilters = () => {
    setTypeFilter("all");
    setDatePreset("all");
    setCustomDateRange(undefined);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Timeline</h2>
        <div className="flex items-center gap-1">
          {isFiltering && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-8 w-8", isFiltering && "text-primary")}>
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4" align="end">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Event type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EVENT_TYPE_FILTERS.map((f) => (
                      <Badge
                        key={f.value}
                        variant={typeFilter === f.value ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setTypeFilter(f.value)}
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Date range</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map((p) => (
                      <Badge
                        key={p.value}
                        variant={datePreset === p.value ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setDatePreset(p.value)}
                      >
                        {p.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                {datePreset === "custom" && (
                  <div>
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={setCustomDateRange}
                      numberOfMonths={1}
                      className={cn("p-0 pointer-events-auto")}
                    />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
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

      <div className="relative">
        {/* Events */}
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground pl-8">{isFiltering ? "No matching events found." : "No activity yet."}</p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide pl-8">
                {group.label}
              </p>
              {group.events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "flex gap-3 mb-4 last:mb-0",
                    event.noteData && "cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                  )}
                  onClick={() => {
                    if (event.noteData) setSelectedNote(event.noteData);
                  }}
                >
                  {/* Icon column — fixed width, line runs through center */}
                  <div className="relative flex flex-col items-center w-[14px] shrink-0 pt-1">
                    <div className="absolute inset-0 left-1/2 w-px -translate-x-1/2 bg-border" />
                    <div className={cn("relative z-10 h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0", iconColors[event.type])}>
                      {iconElements[event.type]}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
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
