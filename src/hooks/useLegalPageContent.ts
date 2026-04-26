import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocumentContent {
  layout: "legal_document";
  title: string;
  effective_date?: string;
  intro?: string;
  sections: LegalSection[];
}

export const useLegalPageContent = (page: string) => {
  return useQuery({
    queryKey: ["website-content", page, "legal_document"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_content")
        .select("content,is_visible")
        .eq("page", page)
        .eq("section_key", "legal_document")
        .maybeSingle();
      if (error) throw error;
      if (!data || !data.is_visible) return null;
      return data.content as LegalDocumentContent;
    },
    staleTime: 5 * 60 * 1000,
  });
};
