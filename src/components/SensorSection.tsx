import { useState } from "react";

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
    <section id="Sensor" className="section-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="accent-line mb-6" />
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">The Sensor</h2>

        <div className="max-w-4xl mb-8">
          <p className="text-foreground/70 text-base leading-relaxed mb-4">
            Max-IR develops infrared (IR) sensors for analysis of compounds in liquids, from clear to thick and murky. Using cutting-edge patented technology, our sensors enable accurate, real-time, continuous measurements, without change or drift over time.
          </p>
          <p className="text-foreground/70 text-base leading-relaxed mb-4">
            Max-IR's pioneering industrial grade sensor is based on infrared light passing through an immersed optical fiber.
          </p>
          <p className="text-foreground/70 text-base leading-relaxed">
            Implementation of ion-selective material enhances differentiation between various molecules, making it ideal for on-site operations.
          </p>
        </div>

        {/* Sensor diagram */}
        <div className="flex justify-center mb-12">
          <img
            src={activePart ? sensorParts.find(p => p.id === activePart)?.highlightImg || "/images/sensor-full.svg" : "/images/sensor-full.svg"}
            alt="Sensor diagram"
            className="max-w-full md:max-w-[800px]"
          />
        </div>

        {/* Sensor parts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sensorParts.map((part) => (
            <div
              key={part.id}
              className="cursor-pointer group"
              onMouseEnter={() => setActivePart(part.id)}
              onMouseLeave={() => setActivePart(null)}
            >
              <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{part.title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">{part.description}</p>
              {part.extra?.map((text, i) => (
                <p key={i} className="text-foreground/60 text-sm leading-relaxed mt-3">
                  <strong>{text.split(" - ")[0]}</strong> - {text.split(" - ").slice(1).join(" - ")}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SensorSection;
