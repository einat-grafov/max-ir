import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AboutSection {
  id: string;
  section_key: string;
  content: any;
  is_visible: boolean;
  sort_order: number;
}

export const useAboutContent = () => {
  const { data: sections, isLoading } = useQuery({
    queryKey: ["website-content", "about"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_content")
        .select("*")
        .eq("page", "about")
        .order("sort_order");
      if (error) throw error;
      return data as AboutSection[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const getSection = (key: string): any | null => {
    const section = sections?.find((s) => s.section_key === key);
    if (!section || !section.is_visible) return null;
    return section.content;
  };

  const isSectionVisible = (key: string): boolean => {
    const section = sections?.find((s) => s.section_key === key);
    return section?.is_visible !== false;
  };

  return { sections, isLoading, getSection, isSectionVisible };
};
