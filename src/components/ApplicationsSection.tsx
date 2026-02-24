const ApplicationsSection = () => {
  return (
    <section id="Applications" className="section-dark py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="accent-line mb-6" />
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-maxir-white mb-16">Applications</h2>

        {/* Water & Wastewater */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          <div className="relative">
            <img src="/images/water-shadow.svg" alt="" className="absolute -bottom-4 -right-4 w-full opacity-30" />
            <img src="/images/water-image.png" alt="Cyanophyta on water surface" className="relative z-10 w-full rounded" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-maxir-white mb-4">Water & Wastewater treatment</h3>
            <p className="text-maxir-white/70 text-sm leading-relaxed mb-4">
              Wastewater treatment plants are turning to sensor-based automation to enable inline process control, enhance energy efficiency, and reduce operating costs while improving treatment performance.
            </p>
            <p className="text-maxir-white/70 text-sm leading-relaxed mb-4">
              The Max-IR sensor measures nitrate and ammonia levels to monitor treatment efficacy, provide an early warning of process drift, and trigger a timely response in case of process failure. In the critical process of aeration, the introduction of air into the treated water uses more than 50% of plant energy consumption. Our sensor allows real-time feedback on the aeration process, reducing energy consumption and lowering overall operational costs.
            </p>
            <p className="text-maxir-white/70 text-sm leading-relaxed">
              Our sensor does not require constant maintenance, as is the case with competing sensor technologies (UV and ion-selective electrode). This robust, reliable performance in challenging environments drives cost savings and better water quality.
            </p>
          </div>
        </div>

        {/* Quality Monitoring */}
        <div className="mb-20 max-w-4xl">
          <h3 className="text-2xl font-bold text-maxir-white mb-4">Quality Monitoring and Analysis Services</h3>
          <p className="text-maxir-white/70 text-sm leading-relaxed">
            Max-IR Labs provides specialized water and industrial fluid analysis services for quality control purposes. Our team is currently in the early stages of service deployment and is seeking pilot study partners to demonstrate our capabilities for monitoring of inorganic carbon, PFAS and nitrate in water and wastewater streams. We offer monitoring and analysis tailored to industry specific needs, helping ensure reliable, actionable results. Potential clients can <a href="mailto:info@max-ir-labs.com" className="text-primary hover:underline font-semibold">email us</a> at info@max-ir-labs.com to learn more or schedule an initial consultation.
          </p>
        </div>

        {/* Food and beverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-bold text-maxir-white mb-4">Food and beverage process control</h3>
            <p className="text-maxir-white/70 text-sm leading-relaxed mb-4">
              The Max-IR sensor works accurately in complex environments, such as food safety where there is a constant need for fast, efficient and accurate sensing. Applications include food safety, bacterial contamination, and measurements of antibiotic levels in food products to ensure quality control.
            </p>
            <p className="text-maxir-white/70 text-sm leading-relaxed mb-4">
              Indicators such as sugar levels, alcohol content, CO2 levels and other parameters can be measured inline, without any interference with flowing liquids. Clean-in-place (CIP) protocols can be improved, for better water and cleaning solution usage efficiency.
            </p>
            <p className="text-maxir-white/70 text-sm leading-relaxed">
              Analyzed fluids are not altered or interfered with, making Max-IR's sensor a great candidate for process control in the food and beverage industry, where flowing liquids require continuous monitoring.
            </p>
          </div>
          <div className="relative order-1 lg:order-2">
            <img src="/images/food-shadow.svg" alt="" className="absolute -bottom-4 -left-4 w-full opacity-30" />
            <img src="/images/food-image.png" alt="Pathogenic bacteria" className="relative z-10 w-full rounded" />
          </div>
        </div>

        {/* Energy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <img src="/images/energy-shadow.svg" alt="" className="absolute -bottom-4 -right-4 w-full opacity-30" />
            <img src="/images/energy-image.png" alt="Liquid petrol surface" className="relative z-10 w-full rounded" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-maxir-white mb-4">Energy industry</h3>
            <p className="text-maxir-white/70 text-sm leading-relaxed mb-4">
              In oil and gas and petrochemical industries, real-time chemical analysis is required in a broad range of operations, from fuel-blending to monitoring of biodiesel properties. Infrared spectroscopy allows real-time analysis of hydrocarbon composition such as aromatics content, olefins, benzene, and ethanol, among others.
            </p>
            <p className="text-maxir-white/70 text-sm leading-relaxed">
              Another example is monitoring of methanol in subsea methanol reuse and recovery operations, where methanol is used in deep, cold waters to inhibit the formation of hydrates that can block production flow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationsSection;
