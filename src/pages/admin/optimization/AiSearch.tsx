import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import PerPageGeoEditor from "@/components/admin/ai-search/PerPageGeoEditor";
import LlmsTxtSettings from "@/components/admin/ai-search/LlmsTxtSettings";
import BotTrafficControls from "@/components/admin/ai-search/BotTrafficControls";

const AiSearch = () => {
  const [tab, setTab] = useState("per-page");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> AI Search & GEO
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Optimize how AI search engines (ChatGPT, Perplexity, Claude, Gemini) discover, cite, and represent your content.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="per-page">Per Page</TabsTrigger>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="bots">Bot Traffic</TabsTrigger>
        </TabsList>

        <TabsContent value="per-page" className="mt-6">
          <PerPageGeoEditor />
        </TabsContent>

        <TabsContent value="site" className="mt-6">
          <LlmsTxtSettings />
        </TabsContent>

        <TabsContent value="bots" className="mt-6">
          <BotTrafficControls />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiSearch;
