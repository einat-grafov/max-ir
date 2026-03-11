import { cn } from "@/lib/utils";
import { LAYOUT_TEMPLATES, type LayoutTemplate } from "./layoutTemplates";

interface Props {
  onSelect: (template: LayoutTemplate) => void;
  currentLayoutId?: string;
}

// SVG thumbnail renderers for each layout
const LayoutThumbnail = ({ id }: { id: string }) => {
  const base = "w-full h-full";
  switch (id) {
    case "hero_center":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {/* Centered title */}
          <rect x="80" y="20" width="120" height="10" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {/* Left text block */}
          <rect x="20" y="55" width="120" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="65" width="110" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="75" width="100" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          {/* Button */}
          <rect x="20" y="95" width="60" height="16" rx="2" fill="hsl(var(--foreground))" />
          {/* Right image */}
          <rect x="160" y="45" width="100" height="75" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    case "hero_left":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {/* Left title */}
          <rect x="20" y="30" width="100" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {/* Left text */}
          <rect x="20" y="55" width="120" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="65" width="110" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          {/* Button */}
          <rect x="20" y="85" width="55" height="16" rx="2" fill="hsl(var(--foreground))" />
          {/* Right image */}
          <rect x="160" y="25" width="100" height="85" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    case "hero_right":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {/* Left image */}
          <rect x="20" y="25" width="100" height="85" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
          {/* Right title */}
          <rect x="140" y="30" width="110" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {/* Right text */}
          <rect x="140" y="55" width="120" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="140" y="65" width="110" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          {/* Button */}
          <rect x="140" y="85" width="55" height="16" rx="2" fill="hsl(var(--foreground))" />
        </svg>
      );
    case "hero_stack":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {/* Centered title */}
          <rect x="80" y="15" width="120" height="10" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {/* Centered text */}
          <rect x="60" y="32" width="160" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="75" y="40" width="130" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          {/* Button */}
          <rect x="110" y="52" width="60" height="14" rx="2" fill="hsl(var(--foreground))" />
          {/* Image below */}
          <rect x="50" y="75" width="180" height="70" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    case "hero_no_image":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {/* Centered title */}
          <rect x="70" y="40" width="140" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {/* Centered text */}
          <rect x="50" y="62" width="180" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="65" y="72" width="150" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          {/* Button */}
          <rect x="110" y="92" width="60" height="16" rx="2" fill="hsl(var(--foreground))" />
        </svg>
      );
    case "testimonial_slider":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {/* Card */}
          <rect x="20" y="15" width="240" height="110" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Quote mark */}
          <text x="35" y="48" fontSize="28" fill="hsl(var(--muted-foreground) / 0.3)" fontFamily="serif">"</text>
          {/* Quote text */}
          <rect x="35" y="55" width="100" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
          <rect x="35" y="65" width="90" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
          {/* Author avatar */}
          <circle cx="45" cy="100" r="10" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="60" y="95" width="50" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
          <rect x="60" y="103" width="35" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          {/* Side image */}
          <rect x="160" y="25" width="90" height="90" rx="4" fill="hsl(var(--muted-foreground) / 0.15)" />
          {/* Dots */}
          <circle cx="125" cy="140" r="3" fill="hsl(var(--foreground))" />
          <circle cx="135" cy="140" r="3" fill="hsl(var(--muted-foreground) / 0.3)" />
          <circle cx="145" cy="140" r="3" fill="hsl(var(--muted-foreground) / 0.3)" />
          <circle cx="155" cy="140" r="3" fill="hsl(var(--muted-foreground) / 0.3)" />
        </svg>
      );
    case "metrics":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={20 + i * 65} y="50" width="50" height="14" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
              <rect x={22 + i * 65} y="72" width="46" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
            </g>
          ))}
        </svg>
      );
    case "logos":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={18 + i * 42} y="65" width="32" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.25)" />
          ))}
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
        </svg>
      );
  }
};

const LayoutPicker = ({ onSelect, currentLayoutId }: Props) => {
  const categories = [
    { key: "hero", label: "Hero Sections" },
    { key: "content", label: "Content" },
    { key: "social_proof", label: "Social Proof" },
  ] as const;

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const templates = LAYOUT_TEMPLATES.filter((t) => t.category === cat.key);
        if (templates.length === 0) return null;
        return (
          <div key={cat.key}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {cat.label}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className={cn(
                    "group rounded-lg border border-border bg-card p-2 text-left transition-all",
                    "hover:border-primary hover:shadow-md hover:shadow-primary/5"
                  )}
                >
                  <div className="aspect-[7/4] rounded overflow-hidden mb-2">
                    <LayoutThumbnail id={template.id} />
                  </div>
                  <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    {template.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LayoutPicker;
