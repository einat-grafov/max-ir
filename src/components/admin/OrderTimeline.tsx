import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, AtSign, Hash, Paperclip } from "lucide-react";

interface TimelineEvent {
  id: string;
  message: string;
  timestamp: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  onAddComment?: (comment: string) => void;
}

const OrderTimeline = ({ events, onAddComment }: OrderTimelineProps) => {
  const [comment, setComment] = useState("");

  const handlePost = () => {
    if (comment.trim() && onAddComment) {
      onAddComment(comment.trim());
      setComment("");
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Timeline</h2>

      {/* Timeline line + comment box */}
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
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment..."
              className="border-0 resize-none min-h-[60px] focus-visible:ring-0 shadow-none"
            />
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-t border-border">
              <div className="flex gap-2 text-muted-foreground">
                <button className="hover:text-foreground"><Smile className="h-4 w-4" /></button>
                <button className="hover:text-foreground"><AtSign className="h-4 w-4" /></button>
                <button className="hover:text-foreground"><Hash className="h-4 w-4" /></button>
                <button className="hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={!comment.trim()}
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
              <div className="flex-1 flex items-center justify-between">
                <p className="text-sm text-foreground">{event.message}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{event.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default OrderTimeline;
