import ScrollReveal from "./ScrollReveal";
import ApplicationMedia from "./ApplicationMedia";

const ApplicationsSection = () => {
  return (
    <section id="Applications" className="relative text-maxir-white" style={{ backgroundColor: "#000000" }}>
      {/* Section Header */}
      <div className="py-16 lg:py-24 pb-0 lg:pb-0" style={{ backgroundImage: "url('/images/applications-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <ScrollReveal>
            <div className="accent-line-center mb-6" />
            <h2 className="text-[40px] md:text-[60px] lg:text-[80px] leading-none font-bold text-maxir-white mb-16 text-center">Applications</h2>
          </ScrollReveal>
        </div>
      </div>

      {/* Water & Wastewater */}
      <div className="py-16 lg:py-20" style={{ backgroundImage: "url('/images/water-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal variant="fadeLeft">
              <ApplicationMedia
                imageSrc="/images/water-image.png"
                imageAlt="Cyanophyta on water surface"
                shadowSrc="/images/water-shadow.svg"
              />
            </ScrollReveal>
            <ScrollReveal variant="fadeRight" delay={0.15}>
              <div>
                <h3 className="text-[24px] font-bold text-maxir-white mb-4">Water & Wastewater treatment</h3>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed mb-4">
                  Wastewater treatment plants are turning to sensor-based automation to enable inline process control, enhance energy efficiency, and reduce operating costs while improving treatment performance.
                </p>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed mb-4">
                  The Max-IR sensor measures nitrate and ammonia levels to monitor treatment efficacy, provide an early warning of process drift, and trigger a timely response in case of process failure. In the critical process of aeration, the introduction of air into the treated water uses more than 50% of plant energy consumption. Our sensor allows real-time feedback on the aeration process, reducing energy consumption and lowering overall operational costs.
                </p>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed">
                  Our sensor does not require constant maintenance, as is the case with competing sensor technologies (UV and ion-selective electrode). This robust, reliable performance in challenging environments drives cost savings and better water quality.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Quality Monitoring */}
      <div className="py-16 lg:py-20" style={{ backgroundImage: "url('/images/quality-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal variant="fadeLeft">
              <div>
                <h3 className="text-[24px] font-bold text-maxir-white mb-4">Quality Monitoring and Analysis Services</h3>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed">
                  Max-IR Labs provides specialized water and industrial fluid analysis services for quality control purposes. Our team is currently in the early stages of service deployment and is seeking pilot study partners to demonstrate our capabilities for monitoring of inorganic carbon, PFAS and nitrate in water and wastewater streams. We offer monitoring and analysis tailored to industry specific needs, helping ensure reliable, actionable results. Potential clients can <a href="mailto:info@max-ir-labs.com" className="text-primary hover:underline font-semibold">email us</a> at info@max-ir-labs.com to learn more or schedule an initial consultation.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fadeRight" delay={0.15}>
              <ApplicationMedia
                imageSrc="/images/quality-monitoring-image.png"
                imageAlt="Quality monitoring analysis"
                shadowSrc="/images/food-shadow.svg"
                position="right"
              />
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Food and beverage */}
      <div className="py-16 lg:py-20" style={{ backgroundImage: "url('/images/food-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal variant="fadeLeft" className="order-2 lg:order-1">
              <div>
                <h3 className="text-[24px] font-bold text-maxir-white mb-4">Food and beverage process control</h3>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed mb-4">
                  The Max-IR sensor works accurately in complex environments, such as food safety where there is a constant need for fast, efficient and accurate sensing. Applications include food safety, bacterial contamination, and measurements of antibiotic levels in food products to ensure quality control.
                </p>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed mb-4">
                  Indicators such as sugar levels, alcohol content, CO2 levels and other parameters can be measured inline, without any interference with flowing liquids. Clean-in-place (CIP) protocols can be improved, for better water and cleaning solution usage efficiency.
                </p>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed">
                  Analyzed fluids are not altered or interfered with, making Max-IR's sensor a great candidate for process control in the food and beverage industry, where flowing liquids require continuous monitoring.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fadeRight" delay={0.15} className="order-1 lg:order-2">
              <ApplicationMedia
                imageSrc="/images/food-image.png"
                imageAlt="Pathogenic bacteria"
                shadowSrc="/images/food-shadow.svg"
                position="right"
              />
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Energy */}
      <div className="py-16 lg:py-20" style={{ backgroundImage: "url('/images/energy-bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <ScrollReveal variant="fadeLeft">
              <ApplicationMedia
                imageSrc="/images/energy-image.png"
                imageAlt="Liquid petrol surface"
                shadowSrc="/images/energy-shadow.svg"
              />
            </ScrollReveal>
            <ScrollReveal variant="fadeRight" delay={0.15}>
              <div>
                <h3 className="text-[24px] font-bold text-maxir-white mb-4">Energy industry</h3>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed mb-4">
                  In oil and gas and petrochemical industries, real-time chemical analysis is required in a broad range of operations, from fuel-blending to monitoring of biodiesel properties. Infrared spectroscopy allows real-time analysis of hydrocarbon composition such as aromatics content, olefins, benzene, and ethanol, among others.
                </p>
                <p className="text-maxir-white/70 text-[18px] font-normal leading-relaxed">
                  Another example is monitoring of methanol in subsea methanol reuse and recovery operations, where methanol is used in deep, cold waters to inhibit the formation of hydrates that can block production flow.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
