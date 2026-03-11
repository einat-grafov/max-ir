import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Eye, EyeOff, Save, Plus, Trash2, GripVertical, ArrowLeftRight, Paintbrush, ImageIcon } from "lucide-react";
import ImagePickerDialog from "./ImagePickerDialog";
import { cn } from "@/lib/utils";
import { LAYOUT_TEMPLATES, getDefaultContent, type LayoutTemplate } from "./layoutTemplates";
import LayoutThumbnail from "./LayoutThumbnail";
import LayoutPicker from "./LayoutPicker";

interface SectionRow {
  id: string;
  page: string;
  section_key: string;
  content: any;
  sort_order: number;
  is_visible: boolean;
}

interface Props {
  section: SectionRow;
  label: string;
  onSaved: () => void;
  onDelete?: () => void;
}

const WebsiteSectionEditor = ({ section, label, onSaved, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<any>(section.content);
  const [isVisible, setIsVisible] = useState(section.is_visible);
  const [saving, setSaving] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);

  const currentLayoutId = content?.layout;
  const currentTemplate = currentLayoutId ? LAYOUT_TEMPLATES.find((t) => t.id === currentLayoutId) : null;

  const handleLayoutChange = (template: LayoutTemplate) => {
    // Preserve matching fields from old content
    const newContent = getDefaultContent(template.id);
    for (const field of template.fields) {
      if (content[field.key] !== undefined && content[field.key] !== "") {
        newContent[field.key] = content[field.key];
      }
    }
    setContent(newContent);
    setShowLayoutPicker(false);
  };

  const updateField = (path: string, value: any) => {
    setContent((prev: any) => {
      const keys = path.split(".");
      const updated = JSON.parse(JSON.stringify(prev));
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

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
    toast.success(`${label} saved`);
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

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <span className="font-semibold text-sm text-foreground">{label}</span>
              {!isVisible && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Hidden</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLayoutPicker(true);
                    }}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{currentTemplate ? "Switch layout" : "Choose layout"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility();
                    }}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    {isVisible ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isVisible ? "Hide section" : "Show section"}</TooltipContent>
              </Tooltip>
              {onDelete && (
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Delete section</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete section?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the "{label}" section. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={onDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            <button
              onClick={() => setShowLayoutPicker(true)}
              className="group flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 hover:border-primary hover:bg-primary/5 transition-all text-left w-auto"
            >
              {currentTemplate ? (
                <>
                  <div className="w-[140px] shrink-0 rounded overflow-hidden">
                    <LayoutThumbnail id={currentTemplate.id} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {currentTemplate.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to change layout</p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 py-1">
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      No layout selected
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click to choose a layout</p>
                  </div>
                </div>
              )}
            </button>

            {/* Background Design */}
            <BackgroundDesignFields content={content} updateField={updateField} />

            <SectionFields
              sectionKey={section.section_key}
              content={content}
              updateField={updateField}
              setContent={setContent}
            />
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>

      <Dialog open={showLayoutPicker} onOpenChange={setShowLayoutPicker}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Layout</DialogTitle>
          </DialogHeader>
          <LayoutPicker onSelect={handleLayoutChange} currentLayoutId={currentLayoutId} />
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
};

// Dynamic field renderer based on section type
const SectionFields = ({
  sectionKey,
  content,
  updateField,
  setContent,
}: {
  sectionKey: string;
  content: any;
  updateField: (path: string, value: any) => void;
  setContent: (fn: (prev: any) => any) => void;
}) => {
  switch (sectionKey) {
    case "hero":
      return <HeroFields content={content} updateField={updateField} />;
    case "technology":
      return <TechnologyFieldsRich content={content} updateField={updateField} setContent={setContent} />;
    case "sensor":
      return <SensorFieldsRich content={content} updateField={updateField} setContent={setContent} />;
    case "applications":
      return <ApplicationsFieldsRich content={content} updateField={updateField} setContent={setContent} />;
    case "awards":
      return <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="items" itemFields={["image", "title", "description"]} />;
    case "our_story":
      return <OurStoryFields content={content} updateField={updateField} setContent={setContent} />;
    case "team_members":
      return <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="members" itemFields={["name", "role", "image", "linkedin"]} />;
    case "advisory_board":
      return <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="advisors" itemFields={["name", "title", "image", "bio", "linkedin"]} />;
    case "publications":
      return <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="items" itemFields={["title", "date", "link", "image"]} />;
    case "fcoi":
      return <SimpleTextFields content={content} updateField={updateField} fields={["title", "content"]} />;
    case "careers":
      return <SimpleTextFields content={content} updateField={updateField} fields={["title", "description"]} />;
    default: {
      // Dynamic fields from layout template
      const layoutId = content?.layout;
      const template = layoutId ? LAYOUT_TEMPLATES.find((t) => t.id === layoutId) : null;
      if (template) {
        return <DynamicLayoutFields content={content} updateField={updateField} setContent={setContent} template={template} />;
      }
      return <p className="text-sm text-muted-foreground">No editor available for this section.</p>;
    }
  }
};

// Dynamic field renderer for layout-based sections
const DynamicLayoutFields = ({
  content,
  updateField,
  setContent,
  template,
}: {
  content: any;
  updateField: (p: string, v: any) => void;
  setContent: (fn: (prev: any) => any) => void;
  template: LayoutTemplate;
}) => (
  <div className="space-y-4">
    {template.fields.map((field) => {
      if (field.type === "items" && field.itemFields) {
        return (
          <ListSectionFields
            key={field.key}
            content={content}
            updateField={updateField}
            setContent={setContent}
            itemKey={field.key}
            itemFields={field.itemFields.map((f) => f.key)}
          />
        );
      }
      return (
        <Field
          key={field.key}
          label={field.label}
          value={content[field.key] || ""}
          onChange={(v) => updateField(field.key, v)}
          multiline={field.type === "textarea"}
          showImagePicker={field.type === "image" || isImageField(field.key)}
        />
      );
    })}
  </div>
);

// === Field Components ===

const HeroFields = ({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    {content.subtitle !== undefined && (
      <Field label="Subtitle" value={content.subtitle} onChange={(v) => updateField("subtitle", v)} multiline />
    )}
    <Field label="Background Image URL" value={content.background_image} onChange={(v) => updateField("background_image", v)} showImagePicker />
  </div>
);

const TechnologyFieldsRich = ({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: any }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    <Field label="Subtitle" value={content.subtitle} onChange={(v) => updateField("subtitle", v)} multiline />
    <Field label="Diagram Image URL" value={content.diagram_image} onChange={(v) => updateField("diagram_image", v)} showImagePicker />
    <OurStoryFields content={{ title: "", paragraphs: content.paragraphs || [] }} updateField={() => {}} setContent={(fn: any) => {
      setContent((prev: any) => {
        const temp = fn({ paragraphs: prev.paragraphs || [] });
        return { ...prev, paragraphs: temp.paragraphs };
      });
    }} />
    <Label className="text-sm font-medium text-foreground block">About Paragraphs (shown above Technology)</Label>
    <OurStoryFields content={{ title: "", paragraphs: content.about_paragraphs || [] }} updateField={() => {}} setContent={(fn: any) => {
      setContent((prev: any) => {
        const temp = fn({ paragraphs: prev.about_paragraphs || [] });
        return { ...prev, about_paragraphs: temp.paragraphs };
      });
    }} />
    <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="features" itemFields={["icon", "title"]} />
  </div>
);

const SensorFieldsRich = ({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: any }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    <OurStoryFields content={{ title: "", paragraphs: content.paragraphs || [] }} updateField={() => {}} setContent={(fn: any) => {
      setContent((prev: any) => {
        const temp = fn({ paragraphs: prev.paragraphs || [] });
        return { ...prev, paragraphs: temp.paragraphs };
      });
    }} />
  </div>
);

const ApplicationsFieldsRich = ({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: any }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="items" itemFields={["key", "title", "image", "image_alt", "shadow", "bg_image", "layout"]} />
    {/* Paragraphs per item are managed within each item */}
    <Label className="text-sm font-medium text-foreground block mt-2">Note: Each application item''s paragraphs can be edited as a JSON array in the description-like fields above.</Label>
  </div>
);

const TechnologyFields = ({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: any }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    <Field label="Subtitle" value={content.subtitle} onChange={(v) => updateField("subtitle", v)} multiline />
    <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="features" itemFields={["icon", "title", "description"]} />
  </div>
);

const ApplicationsFields = ({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: any }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    <ListSectionFields content={content} updateField={updateField} setContent={setContent} itemKey="items" itemFields={["key", "title", "description", "image", "bg_image"]} />
  </div>
);

const OurStoryFields = ({ content, updateField, setContent }: { content: any; updateField: (p: string, v: any) => void; setContent: any }) => (
  <div className="space-y-4">
    <Field label="Title" value={content.title} onChange={(v) => updateField("title", v)} />
    <div>
      <Label className="text-sm font-medium text-foreground mb-2 block">Paragraphs</Label>
      <div className="space-y-3">
        {(content.paragraphs || []).map((p: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Textarea
              value={p}
              onChange={(e) => {
                setContent((prev: any) => {
                  const updated = { ...prev, paragraphs: [...prev.paragraphs] };
                  updated.paragraphs[i] = e.target.value;
                  return updated;
                });
              }}
              className="flex-1"
              rows={3}
            />
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-white"
              onClick={() =>
                setContent((prev: any) => ({
                  ...prev,
                  paragraphs: prev.paragraphs.filter((_: any, idx: number) => idx !== i),
                }))
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setContent((prev: any) => ({
              ...prev,
              paragraphs: [...(prev.paragraphs || []), ""],
            }))
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add paragraph
        </Button>
      </div>
    </div>
  </div>
);

const SimpleTextFields = ({ content, updateField, fields }: { content: any; updateField: (p: string, v: any) => void; fields: string[] }) => (
  <div className="space-y-4">
    {fields.map((field) => (
      <Field
        key={field}
        label={field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")}
        value={content[field] || ""}
        onChange={(v) => updateField(field, v)}
        multiline={field === "content" || field === "description"}
      />
    ))}
  </div>
);

const ListSectionFields = ({
  content,
  updateField,
  setContent,
  itemKey,
  itemFields,
}: {
  content: any;
  updateField: (p: string, v: any) => void;
  setContent: any;
  itemKey: string;
  itemFields: string[];
}) => {
  const items = content[itemKey] || [];
  const friendlyName = itemKey === "items" ? "item" : itemKey.replace(/s$/, "");

  return (
    <div>
      <Label className="text-sm font-medium text-foreground mb-2 block capitalize">{itemKey.replace(/_/g, " ")}</Label>
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
                    [itemKey]: prev[itemKey].filter((_: any, idx: number) => idx !== i),
                  }))
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {itemFields.map((field) => (
                <div key={field} className={field === "description" || field === "bio" || field === "content" ? "col-span-2" : ""}>
                  <Label className="text-xs text-muted-foreground capitalize">{field.replace(/_/g, " ")}</Label>
                  {field === "description" || field === "bio" || field === "content" ? (
                    <Textarea
                      value={item[field] || ""}
                      onChange={(e) =>
                        setContent((prev: any) => {
                          const updated = { ...prev, [itemKey]: [...prev[itemKey]] };
                          updated[itemKey][i] = { ...updated[itemKey][i], [field]: e.target.value };
                          return updated;
                        })
                      }
                      rows={2}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={item[field] || ""}
                      onChange={(e) =>
                        setContent((prev: any) => {
                          const updated = { ...prev, [itemKey]: [...prev[itemKey]] };
                          updated[itemKey][i] = { ...updated[itemKey][i], [field]: e.target.value };
                          return updated;
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
            itemFields.forEach((f) => (newItem[f] = ""));
            setContent((prev: any) => ({
              ...prev,
              [itemKey]: [...(prev[itemKey] || []), newItem],
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

// Background design fields
const BackgroundDesignFields = ({ content, updateField }: { content: any; updateField: (p: string, v: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasBg = content.bg_color || content.bg_image;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left">
          <Paintbrush className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground flex-1">Background Design</span>
          {hasBg && (
            <div className="flex items-center gap-1.5">
              {content.bg_color && (
                <span
                  className="inline-block w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: content.bg_color }}
                />
              )}
              {content.bg_image && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">img</span>
              )}
            </div>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-border bg-card p-3 space-y-3">
          {/* Color */}
          <div>
            <Label className="text-xs font-medium text-foreground">Background Color</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="color"
                value={content.bg_color || "#000000"}
                onChange={(e) => updateField("bg_color", e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent p-0"
              />
              <Input
                value={content.bg_color || ""}
                onChange={(e) => updateField("bg_color", e.target.value)}
                placeholder="#000000 or transparent"
                className="flex-1 h-8 text-xs"
              />
              {content.bg_color && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => updateField("bg_color", "")}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Image */}
          <div>
            <Label className="text-xs font-medium text-foreground">Background Image</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input
                value={content.bg_image || ""}
                onChange={(e) => updateField("bg_image", e.target.value)}
                placeholder="/images/hero-bg.png or https://..."
                className="flex-1 h-8 text-xs"
              />
              <Button variant="outline" size="sm" className="h-8 shrink-0 text-xs gap-1.5" onClick={() => setPickerOpen(true)}>
                <ImageIcon className="h-3.5 w-3.5" />
                Library
              </Button>
            </div>
            <ImagePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => updateField("bg_image", url)} />
            {content.bg_image && (
              <div className="mt-2 relative rounded overflow-hidden border border-border">
                <img
                  src={content.bg_image}
                  alt="Background preview"
                  className="w-full h-20 object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 bg-background/80"
                  onClick={() => updateField("bg_image", "")}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Preview swatch */}
          {(content.bg_color || content.bg_image) && (
            <div className="rounded border border-border overflow-hidden">
              <div
                className="h-12 w-full"
                style={{
                  backgroundColor: content.bg_color || undefined,
                  backgroundImage: content.bg_image ? `url(${content.bg_image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <p className="text-[10px] text-muted-foreground text-center py-1">Combined preview</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Helper to detect image fields
const isImageField = (key: string) =>
  /image|shadow|bg_image|icon|logo|banner|avatar|thumbnail/i.test(key) && !/linkedin/i.test(key);

// Simple reusable field
const Field = ({
  label,
  value,
  onChange,
  multiline,
  showImagePicker,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  showImagePicker?: boolean;
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {multiline ? (
        <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1.5" rows={3} />
      ) : (
        <div className="flex items-center gap-2 mt-1.5">
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="flex-1" />
          {showImagePicker && (
            <>
              <Button variant="outline" size="sm" className="h-10 shrink-0 text-xs gap-1.5" onClick={() => setPickerOpen(true)}>
                <ImageIcon className="h-3.5 w-3.5" />
                Library
              </Button>
              <ImagePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => onChange(url)} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteSectionEditor;
