import ScrollReveal from "./ScrollReveal";

const TechnologySection = () => {
  const features = [
    { icon: "/images/icon-analyzes.svg", title: "Analyzes In Any Liquid" },
    { icon: "/images/icon-no-interference.svg", title: "No Liquid Interference" },
    { icon: "/images/icon-onsite.svg", title: "Operates On-site" },
    { icon: "/images/icon-realtime.svg", title: "Real-time Results" },
    { icon: "/images/icon-measurements.svg", title: "Accurate Measurements" },
  ];

  return (
    <section id="Technology" className="section-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <ScrollReveal>
          <div className="accent-line mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">The Technology</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-foreground/70 text-base md:text-lg leading-relaxed mb-6 max-w-4xl">
            Max-IR's patented technology unlocks the plethora of information that exists in the infrared spectra but is difficult to analyze.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="text-foreground/70 text-sm md:text-base leading-relaxed mb-6 max-w-4xl">
            Traditional techniques such as ultraviolet, electrochemical, colorimetric and direct infrared interacting with the analyte liquid suffer from fouling and interferences and are unstable over time. Our technology enables the use of infrared spectroscopy even in the case of thick and opaque liquids where other methods fail.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-foreground/70 text-sm md:text-base leading-relaxed mb-6 max-w-4xl">
            Based on ground-breaking research by its founder, Max-IR seeks to solve the issue of analyzing the composition of liquids without creating any reaction, with accuracy, in real-time. The non-reactive method of measurement, coupled with a self-calibration technology to avoid measurement drift, ensures a low-maintenance sensor suited for industrial, biomedical, research, and defense/security applications.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <p className="text-foreground/70 text-sm md:text-base leading-relaxed mb-12 max-w-4xl">
            An infrared signal is passed down a special optical fiber in contact with the liquid analyte. The electromagnetic field associated with the IR signal penetrates a short distance into the liquid analyte where it is absorbed by target compounds. This generates small changes in the IR signal, which are detected by the sensor.
          </p>
        </ScrollReveal>
      </div>

      {/* Diagram - full width, outside container */}
      <ScrollReveal variant="scaleIn">
        <div className="w-full mb-16">
          <img src="/images/diagram.gif" alt="MaxIR Diagram" className="w-full" />
        </div>
      </ScrollReveal>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {/* Feature icons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1} variant="fadeUp">
              <div className="flex flex-col items-center text-center gap-4">
                <img src={f.icon} alt={f.title} className="w-16 h-16" />
                <h3 className="text-foreground text-sm font-semibold">{f.title}</h3>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
