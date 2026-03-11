import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, FlaskConical, Plus } from "lucide-react";
import { toast } from "sonner";
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Layout</DialogTitle>
          </DialogHeader>
          <LayoutPicker onSelect={(t) => addSection.mutate(t)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const PageSections = ({ sections, isLoading, page, onInvalidate }: { sections: any[]; isLoading: boolean; page: string; onInvalidate: () => void }) => {
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <WebsiteSectionEditor
          key={section.id}
          section={section}
          label={SECTION_LABELS[section.section_key] || (section.content?.layout ? `Custom: ${section.content.layout}` : section.section_key)}
          onSaved={onInvalidate}
        />
      ))}
      <AddSectionButton page={page} sections={sections} onAdded={onInvalidate} />
    </div>
  );
};

const Website = () => {
  const [activeTab, setActiveTab] = useState("home");
  const queryClient = useQueryClient();

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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website</h1>
          <p className="text-sm text-muted-foreground">Manage the content of your public-facing website pages.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="about">About Us Page</TabsTrigger>
          <TabsTrigger value="team">Team Page</TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" />
            Test Page
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

        <TabsContent value="test">
          <TestPageBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Website;
