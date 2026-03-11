import { cn } from "@/lib/utils";
import { LAYOUT_TEMPLATES, type LayoutTemplate } from "./layoutTemplates";
import LayoutThumbnail from "./LayoutThumbnail";

interface Props {
  onSelect: (template: LayoutTemplate) => void;
  currentLayoutId?: string;
}

const LayoutPicker = ({ onSelect, currentLayoutId }: Props) => {
  const categories = [
    { key: "hero", label: "Hero Sections" },
    { key: "content", label: "Content" },
    { key: "social_proof", label: "Social Proof" },
    { key: "collections", label: "Collections" },
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
                  disabled={template.id === currentLayoutId}
                  className={cn(
                    "group rounded-lg border border-border bg-card p-2 text-left transition-all",
                    template.id === currentLayoutId
                      ? "border-primary bg-primary/5 opacity-70 cursor-default"
                      : "hover:border-primary hover:shadow-md hover:shadow-primary/5"
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
