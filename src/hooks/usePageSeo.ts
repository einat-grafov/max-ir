import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalPath?: string;
}

const usePageSeo = ({ title, description, ogTitle, ogDescription, ogImage, canonicalPath }: SeoProps) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", ogTitle || title, "property");
    setMeta("og:description", ogDescription || description, "property");
    setMeta("og:type", "website", "property");

    if (ogImage) setMeta("og:image", ogImage, "property");

    let canonicalEl = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (canonicalPath) {
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute("href", `https://max-ir.lovable.app${canonicalPath}`);
    }

    return () => {
      document.title = prev;
    };
  }, [title, description, ogTitle, ogDescription, ogImage, canonicalPath]);
};

export default usePageSeo;
