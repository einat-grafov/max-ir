import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type ColumnKey = "inquiries_notification_email" | "careers_notification_email";

interface NotificationEmailCardProps {
  /** Which column in notification_settings to read/write */
  column: ColumnKey;
  /** Headline shown above the input. */
  title: string;
  /** Helper text shown beneath the headline. */
  description: string;
}

/**
 * Singleton-row editor for the notification email that receives a copy of
 * every public form submission (inquiries or careers). Used at the top of
 * the matching admin list page.
 */
const NotificationEmailCard = ({ column, title, description }: NotificationEmailCardProps) => {
  const [value, setValue] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("notification_settings")
        .select(column)
        .eq("singleton", true)
        .maybeSingle();
      if (!active) return;
      const current = (data as Record<string, unknown> | null)?.[column];
      const initial = typeof current === "string" ? current : "";
      setValue(initial);
      setOriginal(initial);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [column]);

  const isDirty = value.trim() !== original.trim();
  const isValidOrEmpty =
    value.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSave = async () => {
    if (!isValidOrEmpty) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSaving(true);
    const trimmed = value.trim();
    const { error } = await supabase
      .from("notification_settings")
      .update({ [column]: trimmed.length > 0 ? trimmed : null })
      .eq("singleton", true);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOriginal(trimmed);
    toast.success(
      trimmed.length > 0
        ? "Notification email saved"
        : "Notification email cleared",
    );
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-[260px]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {original && (
              <span className="inline-flex items-center gap-1 text-xs text-secondary">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>

          <div className="mt-3 flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <Label htmlFor={`notif-${column}`} className="sr-only">
                Email
              </Label>
              {loading ? (
                <div className="h-9 flex items-center text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Loading…
                </div>
              ) : (
                <Input
                  id={`notif-${column}`}
                  type="email"
                  placeholder="alerts@yourcompany.com"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="h-9 text-sm"
                  autoComplete="off"
                />
              )}
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading || saving || !isDirty || !isValidOrEmpty}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            {isDirty && !saving && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setValue(original)}
                disabled={loading}
              >
                Discard
              </Button>
            )}
          </div>
          {!isValidOrEmpty && value.trim().length > 0 && (
            <p className="text-xs text-destructive mt-1">
              Please enter a valid email address.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NotificationEmailCard;
