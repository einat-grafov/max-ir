import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Paperclip } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface TimelineEvent {
  id: string;
  message: string;
  timestamp: string;
  attachment?: { name: string; url: string } | null;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  onAddComment?: (comment: string, attachment?: File) => void;
}

const OrderTimeline = ({ events, onAddComment }: OrderTimelineProps) => {
  const [comment, setComment] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePost = () => {
    if ((comment.trim() || attachment) && onAddComment) {
      onAddComment(comment.trim(), attachment || undefined);
      setComment("");
      setAttachment(null);
    }
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
    e.target.value = "";
  };

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Timeline</h2>

      <div className="relative pl-6">
        {/* Vertical line */}
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
              placeholder="Leave a comment..."
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
                disabled={!comment.trim() && !attachment}
                onClick={handlePost}
              >
                Post
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-right">
            Only you and other staff can see comments
          </p>
        </div>

        {/* Events */}
        {events.map((event, i) => (
          <div key={event.id} className="relative mb-4 last:mb-0">
            {i === 0 && (
              <p className="text-sm text-muted-foreground mb-3">Today</p>
            )}
            <div className="flex items-start gap-3">
              <div className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">{event.message}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{event.timestamp}</span>
                </div>
                {event.attachment && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-primary">
                    <Paperclip className="h-3 w-3" />
                    <span>{event.attachment.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default OrderTimeline;
