import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const awards = [
  {
    logo: "/images/award-usaf.png",
    title: "Phase-I USAF DoD STTR",
    description: "Thermal Monitoring of Quantum Cascade Lasers Using Scanning Near-Field Infrared Radiometry with Sub-Wavelength Resolution, 2017",
    patent: true,
  },
  {
    logo: "/images/award-nsf.png",
    title: "Phase-I NSF STTR",
    description: "Development of low-cost optical sensor for nitrate detection in agricultural soils and environmental waters, 2018",
    patent: true,
  },
  {
    logo: "/images/award-usaf.png",
    title: "Phase-II USAF DoD STTR",
    description: "Midwave Infrared (MWIR) Quantum Cascade Lasers (QCL) Thermal Monitoring, 2018-2020",
    patent: true,
  },
  {
    logo: "/images/award-patent.png",
    title: "U.S. Patent #10,458,907",
    description: "Infrared analytical sensor for soil or water and method of operation thereof, issued May 25, 2018",
    patent: true,
  },
];

const AwardsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const visibleCount = typeof window !== "undefined" && window.innerWidth >= 1024 ? 4 : typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1;

  const prev = () => setCurrentSlide((s) => (s === 0 ? awards.length - visibleCount : s - 1));
  const next = () => setCurrentSlide((s) => (s >= awards.length - visibleCount ? 0 : s + 1));

  return (
    <section id="Awards" className="section-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <ScrollReveal>
          <div className="accent-line-center mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] leading-none font-bold mb-12 text-center">Awards and Achievements</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15} variant="fadeIn">
          <div className="relative flex items-center">
            {/* Left arrow */}
            <button onClick={prev} className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
              <ChevronLeft size={32} />
            </button>

            <div className="overflow-hidden flex-1">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * (100 / visibleCount)}%)` }}
              >
                {awards.map((award, i) => (
                  <div key={i} className="flex-shrink-0 px-4" style={{ width: `${100 / visibleCount}%` }}>
                    <div className="bg-white rounded-[16px] shadow-[0_8px_36px_#0000000d] p-8 flex flex-col items-center text-center h-[340px] overflow-hidden">
                      <img src={award.logo} alt="Award logo" className="h-24 mb-6 object-contain" />
                      <h3 className="font-bold text-lg mb-3">{award.title}</h3>
                      <p className="text-foreground/60 text-sm leading-relaxed">{award.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right arrow */}
            <button onClick={next} className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
              <ChevronRight size={32} />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AwardsSection;
