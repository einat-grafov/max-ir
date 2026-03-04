import ScrollReveal from "./ScrollReveal";

const DEFAULTS = [
  "Founded in 2017, Max-IR Labs develops infrared solutions for industrial process control, medical diagnostics and biochemical analysis. Our R&D is conducted in close coordination with customers, focusing on their application needs, and backed by market analysis.",
  "We are moving infrared technologies from the lab into the field, bridging the gap between laboratory research and real-world application solutions meeting the needs of industrial, biomedical and defense end-users. Max-IR Labs' intellectual property is protected by a strategic patent portfolio.",
];

const AboutSection = ({ content }: { content?: any }) => {
  const paragraphs: string[] = content?.about_paragraphs || DEFAULTS;

  return (
    <section className="section-white pb-16 lg:pb-24 mt-[60px]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {paragraphs.map((p, i) => (
            <ScrollReveal key={i} delay={i * 0.15}>
              <p className="text-foreground text-base md:text-lg font-medium leading-relaxed">{p}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
