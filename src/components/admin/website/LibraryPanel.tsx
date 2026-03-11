import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Copy, ExternalLink, Trash2, Image as ImageIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const WEBSITE_ASSETS = [
  "advisor-abraham-katzir.png",
  "advisor-david-hitt.png",
  "advisor-john-randall.png",
  "applications-bg.png",
  "arrow-circle.svg",
  "award-nsf.png",
  "award-patent.png",
  "award-usaf.png",
  "blood-shadow.svg",
  "diagram.gif",
  "drops.png",
  "energy-bg.png",
  "energy-image.png",
  "energy-shadow.svg",
  "food-bg.png",
  "food-image.png",
  "food-shadow.svg",
  "footer-bg.png",
  "hero-bg.png",
  "hero-ribbon-droplet.png",
  "icon-analyzes.svg",
  "icon-measurements.svg",
  "icon-no-interference.svg",
  "icon-onsite.svg",
  "icon-realtime.svg",
  "left-drop.png",
  "linkedin-white.svg",
  "main-drop.png",
  "maxir-logo.svg",
  "patent-banner.png",
  "patent-icon.png",
  "publications-bg.png",
  "quality-bg.png",
  "quality-monitoring-image.png",
  "read-arrow.svg",
  "right-drop.png",
  "sensor-full.svg",
  "sensor-left.svg",
  "sensor-middle.svg",
  "sensor-right.svg",
  "team-dennis-robbins.png",
  "team-hero-bg.jpg",
  "team-katy-roodenko.png",
  "team-kevin-clark.png",
  "water-bg.png",
  "water-image.png",
  "water-shadow.svg",
  "wave-left.png",
  "wave.png",
];

const getAssetPath = (filename: string) => `/images/${filename}`;

const isSvg = (filename: string) => filename.endsWith(".svg");

const AssetCard = ({ filename, onDelete }: { filename: string; onDelete: (f: string) => void }) => {
  const path = getAssetPath(filename);
  const svg = isSvg(filename);

  const copyLink = () => {
    navigator.clipboard.writeText(path);
    toast.success("Path copied to clipboard");
  };

  const openLink = () => {
    window.open(path, "_blank");
  };

  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      {/* Preview */}
      <div
        className={cn(
          "aspect-square flex items-center justify-center overflow-hidden",
          svg ? "bg-foreground/5 p-4" : "bg-muted"
        )}
      >
        <img
          src={path}
          alt={filename}
          className={cn(
            "object-contain transition-transform group-hover:scale-105",
            svg ? "max-h-full max-w-full" : "w-full h-full object-cover"
          )}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML =
              '<div class="flex flex-col items-center gap-1 text-muted-foreground"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs">Preview unavailable</span></div>';
          }}
        />
      </div>

      {/* Info + actions */}
      <div className="p-2.5">
        <p className="text-xs font-medium text-foreground truncate mb-2" title={filename}>
          {filename}
        </p>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy path</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openLink}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in new tab</TooltipContent>
          </Tooltip>

          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete asset</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete asset?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove <strong>{filename}</strong> from the library. Sections using this asset may break.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(filename)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

const LibraryPanel = () => {
  const [search, setSearch] = useState("");
  const [assets, setAssets] = useState(WEBSITE_ASSETS);

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter((f) => f.toLowerCase().includes(q));
  }, [assets, search]);

  const handleDelete = (filename: string) => {
    setAssets((prev) => prev.filter((f) => f !== filename));
    toast.success(`${filename} removed from library`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets..."
          className="pl-9"
        />
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground mb-1">No assets found</h3>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((filename) => (
            <AssetCard key={filename} filename={filename} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPanel;
