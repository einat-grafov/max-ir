import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";


interface HeroContent {
  title?: string;
  subtitle?: string;
  background_image?: string;
}

const DEFAULTS: HeroContent = {
  title: "Making Infrared Sense",
  subtitle: "Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications.",
  background_image: "/images/hero-bg.png",
};

const HeroSection = ({ content, showDecorations = true }: { content?: HeroContent | null; showDecorations?: boolean }) => {
  const c = { ...DEFAULTS, ...content };
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const dropsY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[85vh] md:min-h-screen flex items-start justify-center overflow-x-clip section-dark pt-[120px] md:pt-[160px]"
      style={{ '--wave-height': '120px', '--wave-height-md': '180px' } as React.CSSProperties}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src={c.background_image} alt="Pulse power lines" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maxir-dark/40 via-transparent to-transparent" />
      </div>

      {/* Decorative drops background layer */}
      <motion.div
        className="absolute bottom-[calc(-5%)] md:bottom-[calc(-2%)] left-1/2 w-[60%] md:w-[45%] pointer-events-none"
        style={{ zIndex: 22, x: "-50%", y: dropsY }}
      >
        <img src="/images/drops.png" alt="" aria-hidden="true" className="w-full h-auto" />
      </motion.div>

      {/* Decorative ribbon + droplet layer */}
      <img
        src="/images/hero-ribbon-droplet.png"
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 w-full h-[55%] md:h-[65%] object-cover object-bottom pointer-events-none"
        style={{ zIndex: 25 }}
      />

      {/* Content */}
      <div className="relative z-30 text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-[40px] md:text-[60px] lg:text-[100px] font-semibold text-maxir-white mb-6 tracking-tight leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
        >
          {c.title}
        </motion.h1>
      </div>

      {/* Wave SVG divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[var(--wave-height)] md:h-[var(--wave-height-md)]">
        <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,90 C200,130 400,170 600,160 C800,150 950,20 1100,10 C1250,0 1380,40 1440,70 L1440,180 L0,180 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
