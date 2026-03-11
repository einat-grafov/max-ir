import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const WEBSITE_ASSETS = [
  "advisor-abraham-katzir.png", "advisor-david-hitt.png", "advisor-john-randall.png",
  "applications-bg.png", "arrow-circle.svg", "award-nsf.png", "award-patent.png",
  "award-usaf.png", "blood-shadow.svg", "diagram.gif", "drops.png", "energy-bg.png",
  "energy-image.png", "energy-shadow.svg", "food-bg.png", "food-image.png",
  "food-shadow.svg", "footer-bg.png", "hero-bg.png", "hero-ribbon-droplet.png",
  "icon-analyzes.svg", "icon-measurements.svg", "icon-no-interference.svg",
  "icon-onsite.svg", "icon-realtime.svg", "left-drop.png", "linkedin-white.svg",
  "main-drop.png", "maxir-logo.svg", "patent-banner.png", "patent-icon.png",
  "publications-bg.png", "quality-bg.png", "quality-monitoring-image.png",
  "read-arrow.svg", "right-drop.png", "sensor-full.svg", "sensor-left.svg",
  "sensor-middle.svg", "sensor-right.svg", "team-dennis-robbins.png",
  "team-hero-bg.jpg", "team-katy-roodenko.png", "team-kevin-clark.png",
  "water-bg.png", "water-image.png", "water-shadow.svg", "wave-left.png", "wave.png",
];

type Asset = { filename: string; url: string };

interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

const ImagePickerDialog = ({ open, onOpenChange, onSelect }: ImagePickerDialogProps) => {
  const [search, setSearch] = useState("");

  const { data: uploadedFiles } = useQuery({
    queryKey: ["website-assets-storage"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("website-assets").list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
    enabled: open,
  });

  const allAssets = useMemo<Asset[]>(() => {
    const statics: Asset[] = WEBSITE_ASSETS.map((f) => ({ filename: f, url: `/images/${f}` }));
    const uploaded: Asset[] = (uploadedFiles || []).map((f) => {
      const { data } = supabase.storage.from("website-assets").getPublicUrl(f.name);
      return { filename: f.name, url: data.publicUrl };
    });
    return [...uploaded, ...statics];
  }, [uploadedFiles]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allAssets;
    const q = search.toLowerCase();
    return allAssets.filter((a) => a.filename.toLowerCase().includes(q));
  }, [allAssets, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pick an image</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="pl-9"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-2">
              {filtered.map((asset) => (
                <button
                  key={asset.url}
                  onClick={() => { onSelect(asset.url); onOpenChange(false); }}
                  className="group rounded-lg border border-border bg-card overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <div className={cn(
                    "aspect-square flex items-center justify-center overflow-hidden",
                    asset.filename.endsWith(".svg") ? "bg-foreground/5 p-3" : "bg-muted"
                  )}>
                    <img
                      src={asset.url}
                      alt={asset.filename}
                      className={cn(
                        "object-contain transition-transform group-hover:scale-105",
                        asset.filename.endsWith(".svg") ? "max-h-full max-w-full" : "w-full h-full object-cover"
                      )}
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate px-1.5 py-1" title={asset.filename}>
                    {asset.filename}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerDialog;
