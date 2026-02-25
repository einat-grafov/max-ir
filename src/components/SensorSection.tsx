import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const sensorParts = [
  {
    id: "laser",
    title: "Quantum Cascade Laser",
    description: "the source of the infrared light. QCLs are semiconductor lasers that emit infrared in the mid- and long-wave bands. We develop technology based on compact, high-power QCLs. Tunable QCLs are implemented for accurate spectral analysis of compounds in the examined liquid.",
    highlightImg: "/images/sensor-left.svg",
  },
  {
    id: "cartridge",
    title: "Replaceable Cartridge",
    description: "holds an infrared wave guide to lead the infrared radiation while in contact with the analyte, and an ion-selective material to concentrate compounds of interest.",
    extra: [
      "Infrared light waveguide - special optical fiber which is transparent in the infrared spectral range. These are immersed in the analyzed liquid to allow transmission of the optical signal through highly infrared-absorbing liquids.",
      "Ion-selective material - allows monitoring of compounds of interest in liquids with high specificity and sensitivity by selectively concentrating compounds in the material",
    ],
    highlightImg: "/images/sensor-middle.svg",
  },
  {
    id: "detector",
    title: "Infrared Detector",
    description: "an infrared sensor that can detect minute changes in the IR radiation that interacts with various compounds. With noise-cancellation algorithms it is able to extract information on the composition of the analyzed liquid. The sensor delivers real-time, continuous, accurate readings and due to self-calibration, does not suffer from drift or inaccuracies over time.",
    highlightImg: "/images/sensor-right.svg",
  },
];

const SensorSection = () => {
  const [activePart, setActivePart] = useState<string | null>(null);

  return (
    <section id="Sensor" className="relative section-dark pt-[calc(4rem+120px)] md:pt-[calc(6rem+180px)] pb-16 lg:pb-24 mt-[120px] md:mt-[180px]">
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
            fill="hsl(var(--maxir-dark))"
          />
        </svg>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 text-center">
        <ScrollReveal>
          <div className="accent-line-center mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-bold mb-8 leading-[1.05]">The Sensor</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto mb-8">
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

        {/* Sensor diagram */}
        <ScrollReveal variant="scaleIn">
          <div className="flex justify-center mb-12">
            <img
              src={activePart ? sensorParts.find(p => p.id === activePart)?.highlightImg || "/images/sensor-full.svg" : "/images/sensor-full.svg"}
              alt="Sensor diagram"
              className="max-w-full md:max-w-[800px]"
            />
          </div>
        </ScrollReveal>

        {/* Sensor parts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sensorParts.map((part, i) => (
            <ScrollReveal key={part.id} delay={i * 0.12}>
              <div
                className="cursor-pointer group"
                onMouseEnter={() => setActivePart(part.id)}
                onMouseLeave={() => setActivePart(null)}
              >
                <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{part.title}</h3>
                <p className="text-maxir-white/60 text-sm leading-relaxed">{part.description}</p>
                {part.extra?.map((text, j) => (
                  <p key={j} className="text-maxir-white/60 text-sm leading-relaxed mt-3">
                    <strong>{text.split(" - ")[0]}</strong> - {text.split(" - ").slice(1).join(" - ")}
                  </p>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SensorSection;
