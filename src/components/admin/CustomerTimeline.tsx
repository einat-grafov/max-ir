import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, isToday, isYesterday } from "date-fns";
import { ShoppingCart, Mail, UserPlus, MessageSquare, Smile, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface TimelineEvent {
  id: string;
  type: "order" | "inquiry" | "created" | "note";
  message: string;
  date: Date;
  link?: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

interface CustomerTimelineProps {
  customerId: string;
  customerName: string;
  customerCreatedAt: string;
}

const formatEventDate = (date: Date) => {
  if (isToday(date)) return format(date, "'Today at' h:mm a");
  if (isYesterday(date)) return format(date, "'Yesterday at' h:mm a");
  return format(date, "MMM d, yyyy 'at' h:mm a");
};

const groupLabel = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

const EventIcon = ({ type }: { type: TimelineEvent["type"] }) => {
  switch (type) {
    case "order":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center">
          <ShoppingCart className="h-2 w-2 text-primary-foreground" />
        </div>
      );
    case "inquiry":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-blue-500 flex items-center justify-center">
          <Mail className="h-2 w-2 text-white" />
        </div>
      );
    case "note":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-amber-500 flex items-center justify-center">
          <MessageSquare className="h-2 w-2 text-white" />
        </div>
      );
    case "created":
      return (
        <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-green-500 flex items-center justify-center">
          <UserPlus className="h-2 w-2 text-white" />
        </div>
      );
  }
};

const CustomerTimeline = ({ customerId, customerName, customerCreatedAt }: CustomerTimelineProps) => {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const addNoteMutation = useMutation({
    mutationFn: async ({ content, attachmentName, attachmentUrl }: { content: string; attachmentName?: string; attachmentUrl?: string }) => {
      const { error } = await supabase.from("customer_notes").insert({
        customer_id: customerId,
        content,
        attachment_name: attachmentName || null,
        attachment_url: attachmentUrl || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      setComment("");
      setAttachment(null);
    },
    onError: () => {
      toast.error("Failed to post note");
    },
  });

  const handlePost = async () => {
    const trimmed = comment.trim();
    if (!trimmed && !attachment) return;
    if (trimmed.length > 5000) {
      toast.error("Note must be under 5000 characters");
      return;
    }

    let attachmentName: string | undefined;
    let attachmentUrl: string | undefined;

    if (attachment) {
      const filePath = `customer-notes/${customerId}/${Date.now()}-${attachment.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, attachment);
      if (uploadError) {
        toast.error("Failed to upload attachment");
        return;
      }
      const { data: publicData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      attachmentName = attachment.name;
      attachmentUrl = publicData.publicUrl;
    }

    addNoteMutation.mutate({ content: trimmed, attachmentName, attachmentUrl });
  };

  const handleEmojiSelect = (emoji: any) => {
    const native = emoji.native;
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = comment.slice(0, start) + native + comment.slice(end);
      setComment(newValue);
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(start + native.length, start + native.length);
        textareaRef.current?.focus();
      }, 0);
    } else {
      setComment((prev) => prev + native);
    }
    setEmojiOpen(false);
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
    e.target.value = "";
  };

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
      link: `/admin/orders`,
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
    events.push({
      id: `note-${note.id}`,
      type: "note",
      message: note.content,
      date: new Date(note.created_at),
      attachmentName: note.attachment_name || undefined,
      attachmentUrl: note.attachment_url || undefined,
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
      <h2 className="text-base font-semibold text-foreground mb-4">Timeline</h2>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />

        {/* Comment box */}
        <div className="relative mb-6">
          <div className="absolute -left-6 top-3 h-3.5 w-3.5 rounded-sm bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground">
            A
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <Textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a note..."
              className="border-0 resize-none min-h-[60px] focus-visible:ring-0 shadow-none"
            />
            {attachment && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 text-sm text-foreground">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate flex-1">{attachment.name}</span>
                <button
                  onClick={() => setAttachment(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-t border-border">
              <div className="flex gap-2 text-muted-foreground">
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild>
                    <button className="hover:text-foreground">
                      <Smile className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    className="w-auto p-0 border-0 shadow-lg"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="light"
                      previewPosition="none"
                      skinTonePosition="none"
                    />
                  </PopoverContent>
                </Popover>
                <button className="hover:text-foreground" onClick={handleFileClick}>
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={(!comment.trim() && !attachment) || addNoteMutation.isPending}
                onClick={handlePost}
              >
                {addNoteMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            Only you and other staff can see notes
          </p>
        </div>

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
                <div key={event.id} className="relative mb-4 last:mb-0">
                  <EventIcon type={event.type} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
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
    </Card>
  );
};

export default CustomerTimeline;
