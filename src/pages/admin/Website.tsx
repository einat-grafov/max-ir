import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Plus, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import WebsiteSectionEditor from "@/components/admin/website/WebsiteSectionEditor";
import TestPageBuilder from "@/components/admin/website/TestPageBuilder";

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
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              {homeSections.map((section) => (
                <WebsiteSectionEditor
                  key={section.id}
                  section={section}
                  label={SECTION_LABELS[section.section_key] || section.section_key}
                  onSaved={() => queryClient.invalidateQueries({ queryKey: ["website-content"] })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              {aboutSections.map((section) => (
                <WebsiteSectionEditor
                  key={section.id}
                  section={section}
                  label={SECTION_LABELS[section.section_key] || section.section_key}
                  onSaved={() => queryClient.invalidateQueries({ queryKey: ["website-content"] })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              {teamSections.map((section) => (
                <WebsiteSectionEditor
                  key={section.id}
                  section={section}
                  label={SECTION_LABELS[section.section_key] || section.section_key}
                  onSaved={() => queryClient.invalidateQueries({ queryKey: ["website-content"] })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="test">
          <TestPageBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Website;
