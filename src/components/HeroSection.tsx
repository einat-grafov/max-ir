const HeroSection = () => {
  return (
    <section
      className="relative h-screen flex items-start justify-center overflow-hidden section-dark pt-[120px] md:pt-[160px]"
      style={{ '--wave-height': '80px', '--wave-height-md': '120px' } as React.CSSProperties}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-bg.png" alt="Pulse power lines" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-maxir-dark/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-30 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-maxir-white mb-6 tracking-tight">
          Making Infrared Sense
        </h1>
        <div className="accent-line-center mb-8" />
        <p className="text-maxir-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications.
        </p>
      </div>


      {/* Wave SVG divider – sits at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-[var(--wave-height)] md:h-[var(--wave-height-md)]">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,58 C120,80 300,115 480,106 C660,97 900,5 1080,-6 C1200,-10 1350,26 1440,50 L1440,120 L0,120 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
