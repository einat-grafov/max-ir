import { useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Copy, ExternalLink, Trash2, Image as ImageIcon, Upload, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const isSvg = (filename: string) => filename.endsWith(".svg");

type Asset = { filename: string; url: string; source: "static" | "uploaded"; storagePath?: string };

const AssetCard = ({ asset, onDelete }: { asset: Asset; onDelete: (a: Asset) => void }) => {
  const svg = isSvg(asset.filename);

  const copyLink = () => {
    navigator.clipboard.writeText(asset.url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <div className={cn("aspect-square flex items-center justify-center overflow-hidden", svg ? "bg-foreground/5 p-4" : "bg-muted")}>
        <img
          src={asset.url}
          alt={asset.filename}
          className={cn("object-contain transition-transform group-hover:scale-105", svg ? "max-h-full max-w-full" : "w-full h-full object-cover")}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML =
              '<div class="flex flex-col items-center gap-1 text-muted-foreground"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs">Preview unavailable</span></div>';
          }}
        />
      </div>
      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          {asset.source === "uploaded" && (
            <span className="shrink-0 inline-block w-1.5 h-1.5 rounded-full bg-primary" title="Uploaded" />
          )}
          <p className="text-xs font-medium text-foreground truncate" title={asset.filename}>{asset.filename}</p>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyLink}><Copy className="h-3.5 w-3.5" /></Button>
          </TooltipTrigger><TooltipContent>Copy URL</TooltipContent></Tooltip>

          <Tooltip><TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(asset.url, "_blank")}><ExternalLink className="h-3.5 w-3.5" /></Button>
          </TooltipTrigger><TooltipContent>Open in new tab</TooltipContent></Tooltip>

          <AlertDialog>
            <Tooltip><TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </AlertDialogTrigger>
            </TooltipTrigger><TooltipContent>Delete asset</TooltipContent></Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete asset?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove <strong>{asset.filename}</strong>. {asset.source === "static" ? "It will be hidden from the library." : "The file will be permanently deleted from storage."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => onDelete(asset)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

const ACCEPTED_TYPES = "image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp";

const LibraryPanel = () => {
  const [search, setSearch] = useState("");
  const [hiddenStatic, setHiddenStatic] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch uploaded assets from storage
  const { data: uploadedFiles, refetch } = useQuery({
    queryKey: ["website-assets-storage"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("website-assets").list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
  });

  const allAssets = useMemo<Asset[]>(() => {
    const statics: Asset[] = WEBSITE_ASSETS
      .filter((f) => !hiddenStatic.has(f))
      .map((f) => ({ filename: f, url: `/images/${f}`, source: "static" as const }));

    const uploaded: Asset[] = (uploadedFiles || []).map((f) => {
      const { data } = supabase.storage.from("website-assets").getPublicUrl(f.name);
      return { filename: f.name, url: data.publicUrl, source: "uploaded" as const, storagePath: f.name };
    });

    return [...uploaded, ...statics];
  }, [hiddenStatic, uploadedFiles]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allAssets;
    const q = search.toLowerCase();
    return allAssets.filter((a) => a.filename.toLowerCase().includes(q));
  }, [allAssets, search]);

  const handleDelete = async (asset: Asset) => {
    if (asset.source === "uploaded" && asset.storagePath) {
      const { error } = await supabase.storage.from("website-assets").remove([asset.storagePath]);
      if (error) { toast.error("Failed to delete: " + error.message); return; }
      refetch();
      toast.success(`${asset.filename} deleted from storage`);
    } else {
      setHiddenStatic((prev) => new Set(prev).add(asset.filename));
      toast.success(`${asset.filename} removed from library`);
    }
  };

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) { toast.error("Please select image files"); return; }

    setUploading(true);
    setUploadProgress(0);
    let completed = 0;
    let errors = 0;

    for (const file of fileArr) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const { error } = await supabase.storage.from("website-assets").upload(safeName, file, { upsert: true });
      if (error) { errors++; console.error("Upload error:", error.message); }
      completed++;
      setUploadProgress(Math.round((completed / fileArr.length) * 100));
    }

    setUploading(false);
    setUploadProgress(0);
    refetch();

    if (errors > 0) toast.error(`${errors} file(s) failed to upload`);
    else toast.success(`${fileArr.length} file(s) uploaded successfully`);
  }, [refetch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {dragOver ? "Drop files here..." : "Click or drag & drop images to upload"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, SVG, WebP</p>
      </div>

      {uploading && (
        <div className="flex items-center gap-3">
          <Progress value={uploadProgress} className="flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{uploadProgress}%</span>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..." className="pl-9" />
      </div>

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
          {filtered.map((asset) => (
            <AssetCard key={`${asset.source}-${asset.filename}`} asset={asset} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPanel;
