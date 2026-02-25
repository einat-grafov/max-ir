import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const dropsY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-start justify-center overflow-hidden section-dark pt-[120px] md:pt-[160px]"
      style={{ '--wave-height': '120px', '--wave-height-md': '180px' } as React.CSSProperties}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-bg.png" alt="Pulse power lines" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maxir-dark/40 via-transparent to-transparent" />
      </div>

      {/* Decorative drops background layer */}
      <motion.div
        className="absolute bottom-[calc(5%-24px)] md:bottom-[calc(8%-24px)] left-1/2 w-[60%] md:w-[45%] pointer-events-none"
        style={{ zIndex: 22, x: "-50%", y: dropsY }}
      >
        <img
          src="/images/drops.png"
          alt=""
          aria-hidden="true"
          className="w-full h-auto"
        />
      </motion.div>

      {/* Decorative ribbon + droplet layer */}
      <img
        src="/images/hero-ribbon-droplet.png"
        alt=""
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 w-full h-[55%] md:h-[60%] object-contain object-[50%_100%] pointer-events-none"
        style={{ zIndex: 25 }}
      />

      {/* Content */}
      <div className="relative z-30 text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-maxir-white mb-6 tracking-tight"
        >
          Making Infrared Sense
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="accent-line-center mb-8"
        />
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="text-maxir-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications.
        </motion.p>
      </div>


      {/* Wave SVG divider – sits at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[var(--wave-height)] md:h-[var(--wave-height-md)]">
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,90 C200,130 400,170 600,160 C800,150 950,20 1100,10 C1250,0 1380,40 1440,70 L1440,180 L0,180 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
