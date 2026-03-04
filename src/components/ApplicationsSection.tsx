import ScrollReveal from "./ScrollReveal";
import ApplicationMedia from "./ApplicationMedia";

interface AppItem {
  key: string;
  title: string;
  paragraphs: string[];
  image: string;
  image_alt?: string;
  shadow: string;
  bg_image: string;
  layout: "image-left" | "text-left";
}

const DEFAULT_ITEMS: AppItem[] = [
  {
    key: "water",
    title: "Water & Wastewater treatment",
    paragraphs: [
      "Wastewater treatment plants are turning to sensor-based automation to enable inline process control, enhance energy efficiency, and reduce operating costs while improving treatment performance.",
      "The Max-IR sensor measures nitrate and ammonia levels to monitor treatment efficacy, provide an early warning of process drift, and trigger a timely response in case of process failure. In the critical process of aeration, the introduction of air into the treated water uses more than 50% of plant energy consumption. Our sensor allows real-time feedback on the aeration process, reducing energy consumption and lowering overall operational costs.",
      "Our sensor does not require constant maintenance, as is the case with competing sensor technologies (UV and ion-selective electrode). This robust, reliable performance in challenging environments drives cost savings and better water quality.",
    ],
    image: "/images/water-image.png",
    image_alt: "Cyanophyta on water surface",
    shadow: "/images/water-shadow.svg",
    bg_image: "/images/water-bg.png",
    layout: "image-left",
  },
  {
    key: "quality",
    title: "Quality Monitoring and Analysis Services",
    paragraphs: [
      "Max-IR Labs provides specialized water and industrial fluid analysis services for quality control purposes. Our team is currently in the early stages of service deployment and is seeking pilot study partners to demonstrate our capabilities for monitoring of inorganic carbon, PFAS and nitrate in water and wastewater streams. We offer monitoring and analysis tailored to industry specific needs, helping ensure reliable, actionable results.",
    ],
    image: "/images/quality-monitoring-image.png",
    image_alt: "Quality monitoring analysis",
    shadow: "/images/food-shadow.svg",
    bg_image: "/images/quality-bg.png",
    layout: "text-left",
  },
  {
    key: "food",
    title: "Food and beverage process control",
    paragraphs: [
      "The Max-IR sensor works accurately in complex environments, such as food safety where there is a constant need for fast, efficient and accurate sensing. Applications include food safety, bacterial contamination, and measurements of antibiotic levels in food products to ensure quality control.",
      "Indicators such as sugar levels, alcohol content, CO2 levels and other parameters can be measured inline, without any interference with flowing liquids. Clean-in-place (CIP) protocols can be improved, for better water and cleaning solution usage efficiency.",
      "Analyzed fluids are not altered or interfered with, making Max-IR's sensor a great candidate for process control in the food and beverage industry, where flowing liquids require continuous monitoring.",
    ],
    image: "/images/food-image.png",
    image_alt: "Pathogenic bacteria",
    shadow: "/images/food-shadow.svg",
    bg_image: "/images/food-bg.png",
    layout: "text-left",
  },
  {
    key: "energy",
    title: "Energy industry",
    paragraphs: [
      "In oil and gas and petrochemical industries, real-time chemical analysis is required in a broad range of operations, from fuel-blending to monitoring of biodiesel properties. Infrared spectroscopy allows real-time analysis of hydrocarbon composition such as aromatics content, olefins, benzene, and ethanol, among others.",
      "Another example is monitoring of methanol in subsea methanol reuse and recovery operations, where methanol is used in deep, cold waters to inhibit the formation of hydrates that can block production flow.",
    ],
    image: "/images/energy-image.png",
    image_alt: "Liquid petrol surface",
    shadow: "/images/energy-shadow.svg",
    bg_image: "/images/energy-bg.png",
    layout: "image-left",
  },
];

const ApplicationsSection = ({ content }: { content?: any }) => {
  const title = content?.title || "Applications";
  const items: AppItem[] = content?.items || DEFAULT_ITEMS;

  return (
    <section id="Applications" className="relative text-maxir-white" style={{ backgroundColor: "#000000" }}>
      {/* Section Header */}
      <div className="py-16 lg:py-24 pb-0 lg:pb-0">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <ScrollReveal>
            <div className="accent-line-center mb-6" />
            <h2 className="text-[40px] md:text-[60px] lg:text-[80px] leading-none font-semibold text-maxir-white mb-16 text-center">{title}</h2>
          </ScrollReveal>
        </div>
      </div>

      {/* Application items */}
      {items.map((item, idx) => {
        const isImageLeft = item.layout === "image-left";
        return (
          <div
            key={item.key || idx}
            className="py-16 lg:py-20"
            style={{ backgroundImage: `url('${item.bg_image}')`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
          >
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {isImageLeft ? (
                  <>
                    <ScrollReveal variant="fadeLeft">
                      <ApplicationMedia
                        imageSrc={item.image}
                        imageAlt={item.image_alt || item.title}
                        shadowSrc={item.shadow}
                      />
                    </ScrollReveal>
                    <ScrollReveal variant="fadeRight" delay={0.15}>
                      <div>
                        <h3 className="text-[24px] font-bold text-maxir-white mb-4">{item.title}</h3>
                        {item.paragraphs.map((p, pi) => (
                          <p key={pi} className="text-maxir-white text-[18px] font-normal leading-relaxed mb-4 last:mb-0">{p}</p>
                        ))}
                      </div>
                    </ScrollReveal>
                  </>
                ) : (
                  <>
                    <ScrollReveal variant="fadeLeft" className={idx % 2 !== 0 ? "" : "order-2 lg:order-1"}>
                      <div>
                        <h3 className="text-[24px] font-bold text-maxir-white mb-4">{item.title}</h3>
                        {item.paragraphs.map((p, pi) => (
                          <p key={pi} className="text-maxir-white text-[18px] font-normal leading-relaxed mb-4 last:mb-0">{p}</p>
                        ))}
                      </div>
                    </ScrollReveal>
                    <ScrollReveal variant="fadeRight" delay={0.15} className={idx % 2 !== 0 ? "" : "order-1 lg:order-2"}>
                      <ApplicationMedia
                        imageSrc={item.image}
                        imageAlt={item.image_alt || item.title}
                        shadowSrc={item.shadow}
                        position="right"
                      />
                    </ScrollReveal>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ApplicationsSection;
