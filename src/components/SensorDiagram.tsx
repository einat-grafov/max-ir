import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Hotspot {
  id: string;
  title: string;
  description: string;
  details?: { term: string; text: string }[];
  /** Position as percentage of the diagram's width/height */
  x: number;
  y: number;
}

const hotspots: Hotspot[] = [
  {
    id: "laser",
    title: "Quantum Cascade Laser",
    description:
      "the source of the infrared light. QCLs are semiconductor lasers that emit infrared in the mid- and long-wave bands. We develop technology based on compact, high-power QCLs. Tunable QCLs are implemented for accurate spectral analysis of compounds in the examined liquid.",
    x: 11,
    y: 50,
  },
  {
    id: "cartridge",
    title: "Replaceable Cartridge",
    description:
      "holds an infrared wave guide to lead the infrared radiation while in contact with the analyte, and an ion-selective material to concentrate compounds of interest.",
    details: [
      {
        term: "Infrared light waveguide",
        text: "special optical fiber which is transparent in the infrared spectral range. These are immersed in the analyzed liquid to allow transmission of the optical signal through highly infrared-absorbing liquids. The infrared radiation transits from the QCL to a detector through the fiber, and the infrared radiation at the interface between the fiber and the analyte liquid is able to detect the characteristic infrared absorption spectra of compounds in the analyte.",
      },
      {
        term: "Ion-selective material",
        text: "allows monitoring of compounds of interest in liquids with high specificity and sensitivity by selectively concentrating compounds in the material",
      },
    ],
    x: 50,
    y: 50,
  },
  {
    id: "detector",
    title: "Infrared Detector",
    description:
      "an infrared sensor that can detect minute changes in the IR radiation that interacts with various compounds. With noise-cancellation algorithms it is able to extract information on the composition of the analyzed liquid. The sensor delivers real-time, continuous, accurate readings and due to self-calibration, does not suffer from drift or inaccuracies over time.",
    x: 90.3,
    y: 50,
  },
];

const SensorDiagram = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCard = useCallback((id: string) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setActiveId(id);
  }, []);

  const hideCard = useCallback(() => {
    hideTimeout.current = setTimeout(() => setActiveId(null), 140);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  const activeHotspot = hotspots.find((h) => h.id === activeId) ?? null;

  // Build the highlighted SVG src based on active hotspot
  const diagramSrc = activeId
    ? `/images/sensor-${activeId === "laser" ? "left" : activeId === "cartridge" ? "middle" : "right"}.svg`
    : "/images/sensor-full.svg";

  return (
    <div className="relative w-full max-w-[900px] mx-auto">
      {/* Diagram image – maintains aspect ratio */}
      <div className="relative w-full" style={{ aspectRatio: "933 / 245" }}>
        <img
          src={diagramSrc}
          alt="Sensor diagram"
          className="w-full h-full object-contain select-none"
          draggable={false}
        />

        {/* Hotspot dots */}
        {hotspots.map((spot, i) => (
          <button
            key={spot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer focus:outline-none group"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            aria-label={`Show details for ${spot.title}`}
            onMouseEnter={() => showCard(spot.id)}
            onMouseLeave={hideCard}
            onFocus={() => showCard(spot.id)}
            onBlur={hideCard}
            onKeyDown={(e) => {
              if (e.key === "Escape") setActiveId(null);
            }}
          >
            {/* Pulse ring */}
            <span
              className="absolute inset-0 rounded-full border-2 border-[#FF9FAF] motion-safe:animate-[hotspot-pulse_1.6s_ease-out_infinite]"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            {/* Core dot */}
            <span className="relative block w-4 h-4 md:w-5 md:h-5">
              <span className="absolute inset-[3px] md:inset-[4px] rounded-full bg-[#FF2D55]" />
              <span className="absolute inset-0 rounded-full border-2 border-[#FF9FAF]" />
            </span>
          </button>
        ))}
      </div>

      {/* Hover card */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[calc(100%+16px)] w-[calc(100%-2rem)] max-w-[680px] z-30"
            onMouseEnter={() => showCard(activeHotspot.id)}
            onMouseLeave={hideCard}
          >
            {/* Anchor dot */}
            <div className="flex justify-center -mb-2 relative z-10">
              <span className="block w-4 h-4 rounded-full border-2 border-[#FF2D55] bg-[#FF2D55]/30" />
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-[#FF2D55]/60 bg-[#F5F5F5] shadow-lg p-6 md:p-8 text-left">
              <h3 className="text-[#FF2D55] font-bold text-xl md:text-2xl mb-3">
                {activeHotspot.title}
              </h3>
              <p className="text-[#222] text-sm md:text-base leading-relaxed mb-4">
                {activeHotspot.description}
              </p>
              {activeHotspot.details?.map((d, j) => (
                <div
                  key={j}
                  className="border-l-[3px] border-[#FF2D55] pl-4 md:pl-5 mb-4 last:mb-0"
                >
                  <p className="text-[#222] text-sm md:text-base leading-relaxed">
                    <strong className="font-bold">{d.term}</strong> - {d.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SensorDiagram;
