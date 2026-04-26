import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Accessibility as AccessibilityIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POSITIONS = [
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
];

const Accessibility = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["accessibility-settings", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accessibility_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [enabled, setEnabled] = useState(true);
  const [color, setColor] = useState("#FF2D55");
  const [position, setPosition] = useState("bottom-left");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled);
      setColor(data.button_color);
      setPosition(data.position);
    }
  }, [data]);

  const handleSave = async () => {
    if (!data?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("accessibility_settings")
      .update({ enabled, button_color: color, position })
      .eq("id", data.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save settings");
      return;
    }
    toast.success("Accessibility settings saved");
    queryClient.invalidateQueries({ queryKey: ["accessibility-settings"] });
    queryClient.invalidateQueries({ queryKey: ["accessibility-settings", "admin"] });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <AccessibilityIcon className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Accessibility Widget</h1>
          <p className="text-sm text-muted-foreground">
            A floating widget that lets visitors adjust contrast, font size, and other accessibility preferences.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 space-y-6">
          {/* Enable */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <Label className="text-base">Enable widget</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show the accessibility widget on every public-facing page.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Button color</Label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-[10px] border border-input bg-background"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#FF2D55"
                className="max-w-[160px] font-mono text-sm uppercase"
              />
            </div>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label>Position on screen</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {POSITIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPosition(p.value)}
                  className={cn(
                    "rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors",
                    position === p.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accessibility;
