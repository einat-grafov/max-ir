import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Save, GripVertical, ChevronDown, Eye, EyeOff, ArrowLeftRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import LayoutPicker from "./LayoutPicker";
import { LAYOUT_TEMPLATES, getDefaultContent, type LayoutTemplate, type LayoutField } from "./layoutTemplates";

interface SectionRow {
  id: string;
  page: string;
  section_key: string;
  content: any;
  sort_order: number;
  is_visible: boolean;
}

const TestPageBuilder = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["website-content", "test"] });
    queryClient.invalidateQueries({ queryKey: ["website-content"] });
  };

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["website-content", "test"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_content")
        .select("*")
        .eq("page", "test")
        .order("sort_order");
      if (error) throw error;
      return data as SectionRow[];
    },
  });

  const addSection = useMutation({
    mutationFn: async (template: LayoutTemplate) => {
      const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sort_order)) + 1 : 0;
      const { error } = await supabase.from("website_content").insert({
        page: "test",
        section_key: `test_${template.id}_${Date.now()}`,
        sort_order: maxOrder,
        is_visible: true,
        content: getDefaultContent(template.id),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setShowPicker(false);
      toast.success("Section added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("website_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Section removed");
    },
  });

  const reorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Batch update sort_order for all affected sections
    const updates = reordered.map((s, i) => ({ id: s.id, sort_order: i }));
    await Promise.all(
      updates.map(({ id, sort_order }) =>
        supabase.from("website_content").update({ sort_order } as any).eq("id", id)
      )
    );
    invalidate();
  };

  const handleDragEnd = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      reorder(dragIdx, overIdx);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const layoutId = section.content?.layout;
        const template = LAYOUT_TEMPLATES.find((t) => t.id === layoutId);
        return (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragIdx(index)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(index); }}
            onDragEnd={handleDragEnd}
            className={cn(
              "transition-all",
              dragIdx === index && "opacity-50",
              overIdx === index && dragIdx !== null && dragIdx !== index && "border-t-2 border-primary rounded-t-sm"
            )}
          >
            <SectionEditor
              section={section}
              template={template}
              onDelete={() => deleteSection.mutate(section.id)}
              onSaved={invalidate}
            />
          </div>
        );
      })}

      <button
        onClick={() => setShowPicker(true)}
        className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm font-medium">Add Section</span>
      </button>

      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-border pb-4">
            <DialogTitle>Choose a Layout</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pt-4 px-1 -mx-1 pb-1">
            <LayoutPicker onSelect={(t) => addSection.mutate(t)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Individual section editor with collapsible content fields
const SectionEditor = ({
  section,
  template,
  onDelete,
  onSaved,
}: {
  section: SectionRow;
  template?: LayoutTemplate;
  onDelete: () => void;
  onSaved: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<any>(section.content);
  const [isVisible, setIsVisible] = useState(section.is_visible);
  const [saving, setSaving] = useState(false);
  const [showLayoutSwitch, setShowLayoutSwitch] = useState(false);

  const layoutName = template?.name || content?.layout || "Unknown Layout";

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("website_content")
      .update({ content, is_visible: isVisible } as any)
      .eq("id", section.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    toast.success(`${layoutName} saved`);
    onSaved();
  };

  const toggleVisibility = async () => {
    const newVal = !isVisible;
    setIsVisible(newVal);
    await supabase
      .from("website_content")
      .update({ is_visible: newVal } as any)
      .eq("id", section.id);
    onSaved();
  };

  const updateField = (key: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleLayoutSwitch = async (newTemplate: LayoutTemplate) => {
    // Build new content, preserving matching field values
    const newDefault = getDefaultContent(newTemplate.id);
    const preserved: any = { layout: newTemplate.id };
    for (const field of newTemplate.fields) {
      if (field.key in content && content[field.key] !== undefined) {
        preserved[field.key] = content[field.key];
      } else {
        preserved[field.key] = newDefault[field.key];
      }
    }
    setContent(preserved);
    setShowLayoutSwitch(false);
    // Auto-save the layout change
    const { error } = await supabase
      .from("website_content")
      .update({ content: preserved } as any)
      .eq("id", section.id);
    if (error) {
      toast.error("Failed to switch layout");
    } else {
      toast.success(`Switched to ${newTemplate.name}`);
      onSaved();
    }
  };

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                <span className="font-semibold text-sm text-foreground">{layoutName}</span>
                {!isVisible && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Hidden</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowLayoutSwitch(true); }}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Change layout</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVisibility(); }}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                    >
                      {isVisible ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isVisible ? "Hide section" : "Show section"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete section</TooltipContent>
                </Tooltip>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border p-4 space-y-4">
              {template ? (
                <TemplateFields fields={template.fields} content={content} updateField={updateField} setContent={setContent} />
              ) : (
                <p className="text-sm text-muted-foreground">Unknown layout type: {content?.layout}</p>
              )}
              <div className="flex justify-end pt-2 border-t border-border">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Dialog open={showLayoutSwitch} onOpenChange={setShowLayoutSwitch}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0 border-b border-border pb-4">
            <DialogTitle>Switch Layout</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pt-4 px-1 -mx-1 pb-1">
            <p className="text-sm text-muted-foreground mb-2">Matching fields (title, description, etc.) will be preserved.</p>
            <LayoutPicker onSelect={handleLayoutSwitch} currentLayoutId={content?.layout} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Render fields dynamically based on template definition
const TemplateFields = ({
  fields,
  content,
  updateField,
  setContent,
}: {
  fields: LayoutField[];
  content: any;
  updateField: (key: string, value: any) => void;
  setContent: (fn: (prev: any) => any) => void;
}) => (
  <div className="space-y-4">
    {fields.map((field) => {
      if (field.type === "items" && field.itemFields) {
        return (
          <ItemListEditor
            key={field.key}
            fieldKey={field.key}
            label={field.label}
            itemFields={field.itemFields}
            items={content[field.key] || []}
            setContent={setContent}
          />
        );
      }
      return (
        <div key={field.key}>
          <Label className="text-sm font-medium text-foreground">{field.label}</Label>
          {field.type === "textarea" ? (
            <Textarea
              value={content[field.key] || ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          ) : (
            <Input
              value={content[field.key] || ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="mt-1.5"
            />
          )}
        </div>
      );
    })}
  </div>
);

// Reusable list editor for items (testimonials, metrics, logos)
const ItemListEditor = ({
  fieldKey,
  label,
  itemFields,
  items,
  setContent,
}: {
  fieldKey: string;
  label: string;
  itemFields: { key: string; label: string; type: string }[];
  items: any[];
  setContent: (fn: (prev: any) => any) => void;
}) => {
  const friendlyName = label.replace(/s$/, "").toLowerCase();

  return (
    <div>
      <Label className="text-sm font-medium text-foreground mb-2 block">{label}</Label>
      <div className="space-y-3">
        {items.map((item: any, i: number) => (
          <Card key={i} className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground capitalize">{friendlyName} {i + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:bg-destructive hover:text-white"
                onClick={() =>
                  setContent((prev: any) => ({
                    ...prev,
                    [fieldKey]: prev[fieldKey].filter((_: any, idx: number) => idx !== i),
                  }))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {itemFields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "col-span-2" : ""}>
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      value={item[f.key] || ""}
                      onChange={(e) =>
                        setContent((prev: any) => {
                          const updated = [...prev[fieldKey]];
                          updated[i] = { ...updated[i], [f.key]: e.target.value };
                          return { ...prev, [fieldKey]: updated };
                        })
                      }
                      rows={2}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={item[f.key] || ""}
                      onChange={(e) =>
                        setContent((prev: any) => {
                          const updated = [...prev[fieldKey]];
                          updated[i] = { ...updated[i], [f.key]: e.target.value };
                          return { ...prev, [fieldKey]: updated };
                        })
                      }
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newItem: any = {};
            itemFields.forEach((f) => (newItem[f.key] = ""));
            setContent((prev: any) => ({
              ...prev,
              [fieldKey]: [...(prev[fieldKey] || []), newItem],
            }));
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add {friendlyName}
        </Button>
      </div>
    </div>
  );
};

export default TestPageBuilder;
