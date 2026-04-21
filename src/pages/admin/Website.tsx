import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, FlaskConical, Plus, Search, BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import WebsiteSectionEditor from "@/components/admin/website/WebsiteSectionEditor";
import TestPageBuilder from "@/components/admin/website/TestPageBuilder";
import LayoutPicker from "@/components/admin/website/LayoutPicker";
import { getDefaultContent, type LayoutTemplate } from "@/components/admin/website/layoutTemplates";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  technology: "Technology",
  sensor: "How It Works",
  applications: "Applications",
  awards: "Awards & Recognition",
  our_story: "Our Story",
  team_members: "Team Members",
  advisory_board: "Advisory Board",
  publications: "Publications",
  fcoi: "FCOI Policy",
  careers: "Careers",
  test_hero: "Hero Section",
  test_content: "Main Content",
  test_cta: "Call to Action",
};

const AddSectionButton = ({ page, sections, onAdded }: { page: string; sections: any[]; onAdded: () => void }) => {
  const [showPicker, setShowPicker] = useState(false);

  const addSection = useMutation({
    mutationFn: async (template: LayoutTemplate) => {
      const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.sort_order)) + 1 : 0;
      const { error } = await supabase.from("website_content").insert({
        page,
        section_key: `${page}_${template.id}_${Date.now()}`,
        sort_order: maxOrder,
        is_visible: true,
        content: getDefaultContent(template.id),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      onAdded();
      setShowPicker(false);
      toast.success("Section added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <>
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
          <div className="overflow-y-auto flex-1 pt-4">
            <LayoutPicker onSelect={(t) => addSection.mutate(t)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PageSections = ({ sections, isLoading, page, onInvalidate }: { sections: any[]; isLoading: boolean; page: string; onInvalidate: () => void }) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("website_content").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete section");
      return;
    }
    toast.success("Section deleted");
    onInvalidate();
  };

  const reorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    await Promise.all(
      reordered.map((s, i) =>
        supabase.from("website_content").update({ sort_order: i } as any).eq("id", s.id)
      )
    );
    onInvalidate();
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
      {sections.map((section, index) => (
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
          <WebsiteSectionEditor
            section={section}
            label={SECTION_LABELS[section.section_key] || (section.content?.layout ? `Custom: ${section.content.layout}` : section.section_key)}
            onSaved={onInvalidate}
            onDelete={() => handleDelete(section.id)}
          />
        </div>
      ))}
      <AddSectionButton page={page} sections={sections} onAdded={onInvalidate} />
    </div>
  );
};

import SeoPanel from "@/components/admin/website/SeoPanel";

import LibraryPanel from "@/components/admin/website/LibraryPanel";

const Website = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "seo" || searchParams.get("tab") === "library" ? searchParams.get("tab")! : "pages";
  const [topTab, setTopTab] = useState(initialTab);
  const [activePageTab, setActivePageTab] = useState("home");
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "seo" || t === "pages" || t === "library") setTopTab(t);
  }, [searchParams]);

  const { data: sections, isLoading } = useQuery({
    queryKey: ["website-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_content")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["website-content"] });

  const homeSections = sections?.filter((s) => s.page === "home") || [];
  const aboutSections = sections?.filter((s) => s.page === "about") || [];
  const teamSections = sections?.filter((s) => s.page === "team") || [];
  const privacySections = sections?.filter((s) => s.page === "privacy-policy") || [];
  const refundSections = sections?.filter((s) => s.page === "refund-and-return") || [];
  const shippingSections = sections?.filter((s) => s.page === "shipping-policy") || [];
  const termsSections = sections?.filter((s) => s.page === "terms-and-conditions") || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website</h1>
          <p className="text-sm text-muted-foreground">Manage the content of your public-facing website pages.</p>
        </div>
      </div>

      {/* Top-level tabs: SEO | Pages | Library */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-6">
          {[
            { value: "seo", label: "SEO", icon: Search },
            { value: "pages", label: "Pages", icon: FileText },
            { value: "library", label: "Library", icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTopTab(tab.value)}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px",
                topTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs value={topTab} onValueChange={setTopTab}>
        {/* Hidden TabsList for radix state */}
        <TabsList className="hidden">
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <SeoPanel />
        </TabsContent>

        <TabsContent value="pages">
          {/* Nested page tabs */}
          <Tabs value={activePageTab} onValueChange={setActivePageTab}>
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="about">About Us</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="privacy-policy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="refund-and-return">Refund & Return</TabsTrigger>
              <TabsTrigger value="shipping-policy">Shipping Policy</TabsTrigger>
              <TabsTrigger value="terms-and-conditions">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="test" className="gap-1.5">
                <FlaskConical className="h-3.5 w-3.5" />
                Test
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home">
              <PageSections sections={homeSections} isLoading={isLoading} page="home" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="about">
              <PageSections sections={aboutSections} isLoading={isLoading} page="about" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="team">
              <PageSections sections={teamSections} isLoading={isLoading} page="team" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="privacy-policy">
              <PageSections sections={privacySections} isLoading={isLoading} page="privacy-policy" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="refund-and-return">
              <PageSections sections={refundSections} isLoading={isLoading} page="refund-and-return" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="shipping-policy">
              <PageSections sections={shippingSections} isLoading={isLoading} page="shipping-policy" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="terms-and-conditions">
              <PageSections sections={termsSections} isLoading={isLoading} page="terms-and-conditions" onInvalidate={invalidate} />
            </TabsContent>

            <TabsContent value="test">
              <TestPageBuilder />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="library">
          <LibraryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Website;
