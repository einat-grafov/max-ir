import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface HotspotDetail {
  term: string;
  text: string;
}

interface Hotspot {
  id: string;
  title: string;
  description: string;
  details?: HotspotDetail[];
  /** Position as percentage of diagram width/height */
  x: number;
  y: number;
  /** Where the anchor dot sits on the card's top edge */
  anchorPosition: "left" | "center" | "right";
}

const hotspots: Hotspot[] = [
  {
    id: "qcl",
    title: "Quantum Cascade Laser",
    description:
      "The source of the infrared light. QCLs are semiconductor lasers that emit infrared in the mid- and long-wave bands. We develop technology based on compact, high-power QCLs. Tunable QCLs are implemented for accurate spectral analysis of compounds in the examined liquid.",
    x: 13.2,
    y: 50,
    anchorPosition: "left",
  },
  {
    id: "cartridge",
    title: "Replaceable Cartridge",
    description:
      "Holds an infrared wave guide to lead the infrared radiation while in contact with the analyte, and an ion-selective material to concentrate compounds of interest.",
    details: [
      {
        term: "Infrared light waveguide",
        text: "Special optical fiber which is transparent in the infrared spectral range. These are immersed in the analyzed liquid to allow transmission of the optical signal through highly infrared-absorbing liquids.",
      },
      {
        term: "Ion-selective material",
        text: "Allows monitoring of compounds of interest in liquids with high specificity and sensitivity by selectively concentrating compounds in the material.",
      },
    ],
    x: 50,
    y: 50,
    anchorPosition: "center",
  },
  {
    id: "detector",
    title: "Infrared Detector",
    description:
      "An infrared sensor that can detect minute changes in the IR radiation that interacts with various compounds. With noise-cancellation algorithms it is able to extract information on the composition of the analyzed liquid. The sensor delivers real-time, continuous, accurate readings.",
    x: 89,
    y: 50,
    anchorPosition: "right",
  },
];

/* ─── Shared card component ─── */
interface InfoCardProps {
  hotspot: Hotspot;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const InfoCard = ({ hotspot, onMouseEnter, onMouseLeave }: InfoCardProps) => (
  <div
    className="absolute z-30"
    style={{
      left: `${hotspot.x}%`,
      top: `calc(${hotspot.y}% + 14px)`,
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div
      className={
        hotspot.anchorPosition === "left"
          ? ""
          : hotspot.anchorPosition === "center"
            ? "-translate-x-1/2"
            : "-translate-x-full"
      }
    >
      <motion.div
        key={hotspot.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-[min(860px,90vw)]"
      >
        <CardBody hotspot={hotspot} />
      </motion.div>
    </div>
  </div>
);

const CardBody = ({ hotspot }: { hotspot: Hotspot }) => (
  <div
    className="rounded-xl border-2 border-[#FF2D55] bg-[#F2F2F2] shadow-xl text-left"
    style={{ padding: "28px 36px" }}
  >
    <h3 className="text-[#FF2D55] font-bold text-xl md:text-2xl mb-3">
      {hotspot.title}
    </h3>
    <p className="text-[#1a1a1a] text-sm md:text-base leading-relaxed mb-4">
      {hotspot.description}
    </p>
    {hotspot.details?.map((d, j) => (
      <div
        key={j}
        className="border-l-[3px] border-[#FF2D55] pl-4 md:pl-5 mb-4 last:mb-0"
      >
        <p className="text-[#1a1a1a] text-sm md:text-base leading-relaxed">
          <strong className="font-bold">{d.term}</strong> – {d.text}
        </p>
      </div>
    ))}
  </div>
);

/* ─── Main section ─── */
const TechnologyDiagramSection = ({ embedded }: { embedded?: boolean }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCard = useCallback((id: string) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setActiveId(id);
  }, []);

  const hideCard = useCallback(() => {
    hideTimeout.current = setTimeout(() => setActiveId(null), 160);
  }, []);

  // Tap-to-toggle for touch devices
  const toggleCard = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  // Close on click outside (touch)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveId(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const activeHotspot = hotspots.find((h) => h.id === activeId) ?? null;

  // Highlighted diagram variant based on active hotspot
  const diagramSrc = activeId
    ? `/images/sensor-${activeId === "qcl" ? "left" : activeId === "cartridge" ? "middle" : "right"}.svg`
    : "/images/sensor-full.svg";

  const content = (
    <div
      ref={containerRef}
      className="relative w-full max-w-[1100px] mx-auto overflow-visible"
    >
      {/* Diagram image */}
      <div className="relative w-full" style={{ aspectRatio: "933 / 245" }}>
        <img
          src={diagramSrc}
          alt="Technology diagram showing sensor components"
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
            onClick={() => toggleCard(spot.id)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setActiveId(null);
            }}
          >
            {/* Pulse ring */}
            <span
              className="absolute inset-[-6px] rounded-full border-2 border-[#FF9FAF] motion-safe:animate-[techDot-pulse_1.4s_ease-in-out_infinite] group-hover:animate-none group-focus:animate-none"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            {/* Core dot */}
            <span className="relative block w-4 h-4 md:w-5 md:h-5 group-hover:brightness-125 group-focus:brightness-125 transition-all">
              <span className="absolute inset-[3px] md:inset-[4px] rounded-full bg-[#FF2D55]" />
              <span className="absolute inset-0 rounded-full border-2 border-[#FF9FAF]" />
            </span>
          </button>
        ))}

        {/* Desktop info card overlay (absolute) */}
        <AnimatePresence>
          {activeHotspot && (
            <div className="hidden md:block">
              <InfoCard
                hotspot={activeHotspot}
                onMouseEnter={() => showCard(activeHotspot.id)}
                onMouseLeave={hideCard}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile info card (flows below diagram) */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            key={activeHotspot.id + "-mobile"}
            className="md:hidden mt-4 px-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <CardBody hotspot={activeHotspot} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (embedded) return content;

  return (
    <section className="bg-black py-20 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <ScrollReveal>{content}</ScrollReveal>
      </div>
    </section>
  );
};

export default TechnologyDiagramSection;
