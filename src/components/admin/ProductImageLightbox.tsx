import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductImageLightbox = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ProductImageLightboxProps) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrent(initialIndex);
  }, [open, initialIndex]);

  const prev = useCallback(() => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0)), [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] p-0 bg-background/95 backdrop-blur-sm border-border gap-0 [&>button]:hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-10 rounded-full bg-muted/80 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative flex items-center justify-center min-h-[50vh] max-h-[75vh] p-6">
          {images.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-3 z-10 rounded-full bg-muted/80 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <img
            src={images[current]}
            alt={`Product image ${current + 1}`}
            className="max-h-[70vh] max-w-full object-contain rounded-lg"
          />

          {images.length > 1 && (
            <button
              onClick={next}
              className="absolute right-3 z-10 rounded-full bg-muted/80 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4 px-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-14 w-14 rounded-md border-2 overflow-hidden transition-all ${
                  i === current
                    ? "border-primary ring-1 ring-primary scale-105"
                    : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {images.length > 1 && (
          <p className="text-center text-xs text-muted-foreground pb-3">
            {current + 1} / {images.length}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductImageLightbox;
