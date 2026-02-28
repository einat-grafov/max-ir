import ScrollReveal from "./ScrollReveal";
import TechnologyDiagramSection from "./TechnologyDiagramSection";

const SensorSection = () => {
  return (
    <section id="Sensor" className="relative pt-[calc(1.6rem+96px)] md:pt-[calc(2.4rem+144px)] pb-[51px] lg:pb-[77px] mt-[120px] md:mt-[180px] text-white" style={{ backgroundColor: "#000000" }}>
      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 z-10 h-[120px] md:h-[180px] -translate-y-[calc(100%-1px)]">
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,90 C200,130 400,170 600,160 C800,150 950,20 1100,10 C1250,0 1380,40 1440,70 L1440,180 L0,180 Z"
            fill="#000000"
          />
        </svg>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 text-center">
        <ScrollReveal>
          <div className="accent-line-center mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-bold mb-8 leading-[1.05]">The Sensor</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto mb-[40px]">
            <p className="text-maxir-white/70 text-base leading-relaxed mb-4">
              Max-IR develops infrared (IR) sensors for analysis of compounds in liquids, from clear to thick and murky. Using cutting-edge patented technology, our sensors enable accurate, real-time, continuous measurements, without change or drift over time.
            </p>
            <p className="text-maxir-white/70 text-base leading-relaxed mb-4">
              Max-IR's pioneering industrial grade sensor is based on infrared light passing through an immersed optical fiber.
            </p>
            <p className="text-maxir-white/70 text-base leading-relaxed">
              Implementation of ion-selective material enhances differentiation between various molecules, making it ideal for on-site operations.
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive sensor diagram */}
        <ScrollReveal variant="scaleIn" className="overflow-visible">
          <div className="mb-12 pb-16 md:pb-24 overflow-visible">
            <TechnologyDiagramSection embedded />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SensorSection;
