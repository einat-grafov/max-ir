import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageSeo from "@/hooks/usePageSeo";
import { useLegalPageContent, type LegalDocumentContent } from "@/hooks/useLegalPageContent";

interface Props {
  page: string;
  seo: { title: string; description: string; canonicalPath: string };
  fallback: LegalDocumentContent;
}

const LegalPage = ({ page, seo, fallback }: Props) => {
  usePageSeo(seo);
  const { data, isLoading } = useLegalPageContent(page);
  const content: LegalDocumentContent = data ?? fallback;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{content.title}</h1>
        {content.effective_date && (
          <p className="text-sm text-muted-foreground mb-10">{content.effective_date}</p>
        )}

        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-8 legal-content">
          {content.intro && <p>{content.intro}</p>}
          {content.sections?.map((section, idx) => (
            <section key={idx}>
              {section.heading && (
                <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
              )}
              <div
                className="space-y-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:text-primary [&_a:hover]:underline [&_p.uppercase]:uppercase [&_p.uppercase]:text-sm [&_address]:not-italic"
                dangerouslySetInnerHTML={{ __html: section.body || "" }}
              />
            </section>
          ))}
          {isLoading && !data && (
            <p className="sr-only">Loading latest content…</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalPage;
