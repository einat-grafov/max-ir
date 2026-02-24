import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const visibleCount = typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1;

  const prev = () => setCurrentSlide((s) => (s === 0 ? awards.length - visibleCount : s - 1));
  const next = () => setCurrentSlide((s) => (s >= awards.length - visibleCount ? 0 : s + 1));

  return (
    <section id="Awards" className="section-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <div className="accent-line mb-6" />
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12">Awards and Achievements</h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / visibleCount)}%)` }}
            >
              {awards.map((award, i) => (
                <div key={i} className="flex-shrink-0 px-4" style={{ width: `${100 / visibleCount}%` }}>
                  <div className="flex flex-col items-center text-center">
                    <img src={award.logo} alt="Award logo" className="h-24 mb-6 object-contain" />
                    <h3 className="font-bold text-lg mb-3">{award.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed mb-4">{award.description}</p>
                    {award.patent && (
                      <img src="/images/patent-icon.png" alt="Patent" className="h-10 opacity-60" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:border-primary transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:border-primary transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardsSection;
