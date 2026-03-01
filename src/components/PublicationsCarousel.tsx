import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Publication = {
  title: string;
  body: string;
  date: string;
  url: string;
};

const publications: Publication[] = [
  {
    title: "Nitrogen sensor based on quantum cascade lasers (QCLs) for wastewater treatment process control and optimization",
    body: "Katy Roodenko; D. Hinojos; K. Hodges; B.-J. Pandey; J.-F. Veyan; K. P. Clark; D. I. Robbins Presented at Photonics West 2020, published in SPIE Digital Library on February 2020 We report on the development of infrared sensor for monitoring of nitrogen as nitrate, nitrite and ammonia in municipal wastewater.\n\nEfficient nitrogen removal is one of the key objectives of any municipal wastewater treatment operation, yet today, nitrogen is monitored through grab-sampling and sending samples to laboratories for analysis. Max-IR Labs sensor will enable reliable, real-time, unsupervised sensing in harsh environment.",
    date: "March 9, 2020",
    url: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11233/112330C/Nitrogen-sensor-based-on-quantum-cascade-lasers-QCLs-for-wastewater/10.1117/12.2553691.short",
  },
  {
    title: "Thermal modeling of quantum cascade lasers with 3D anisotropic heat transfer analysis",
    body: "Farhat Abbas; Binay J. Pandey; Kevin Clark; Kevin Lascola; YamacDikmelik; Dennis Robbins; David Hinojos; Kimari L. Hodges; Katy Roodenko; QingGu\n\nPresented at Photonics West 2020, published in SPIE Digital Library on February 2020\n\nIn this work, diagnosis of failure mechanisms of mid-wave infrared(MWIR) QCLs was performed based on 3D anisotropic steady state heat transferanalysis combined with Max-IR Lab's infrared scanning near-field opticalmicroscope (IR-SNOM).",
    date: "January 31, 2020",
    url: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11288/2543594/Thermal-modeling-of-quantum-cascade-lasers-with-3D-anisotropic-heat/10.1117/12.2543594.short",
  },
  {
    title: "IR-SNOM on a fork: infrared scanning near-field optical microscopy for thermal profiling of quantum cascade lasers",
    body: "B.-J. Pandey; K. P. Clark; F. Abbas; E. Fuchs; K. Lascola; Yamac Dikmelik; D. Hinojos; K. Hodges; D. I. Robbins; M. Platkov; A. Katzir; A. Suliman; G. Spingarn; A. Niguès; J.-F. Veyan; Q. Gu; K. Roodenko. Presented at Photonics West 2020, published in SPIE Digital Library on February 2020. The paper presents Max-IR Lab's efforts to develop scanning near-field optical microscopy (SNOM) method for thermal imaging with subwavelength spatial resolution\n\nThe system implements infrared fiber-optic probes with subwavelength apertures at the apex of a tip for coupling to thermal radiation. The SNOM-on-a-fork system is developed as a capability to profile temperature in from objects that emit radiation in pulsed and continuous wave (CW) modes, targeting diagnosis of failure mechanisms in microelectronic devices.",
    date: "January 31, 2020",
    url: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11288/112881Q/IR-SNOM-on-a-fork--infrared-scanning-near-field/10.1117/12.2543849.short?SSO=1",
  },
  {
    title: "Non-dispersive infrared (NDIR) sensor for real-time nitrate monitoring in wastewater treatment",
    body: "K. Roodenko; D. Hinojos; K. Hodges; J.-F. Veyan; Y. J. Chabal; K. P. Clark; A. Katzir; D. Robbins\n\nPresented at Photonics West 2019, published in SPIE Digital Library on February 2019\n\nThe paper discusses implementation of the development of a non-dispersive infrared (NDIR) detector for the real-time monitoring of nitrate, nitrite and ammonia concentrations targeting implementation at municipal wastewater treatment plants (WWTPs) and onsite wastewater treatment systems (OWTS)",
    date: "February 27, 2019",
    url: "https://spie.org/Publications/Proceedings/Paper/10.1117/12.2506550?SSO=1",
  },
  {
    title: "Max-IR Labs awarded grant for development of nitrate detection sensor",
    body: "DALLAS, May 17, 2018 - Max-IR Labs, an optical sensor development company based in Dallas, Texas, today announced it has been awarded a Phase I Small Business Technology Transfer (STTR) grant of $225,000 from the National Science Foundation (NSF) to continue its development of a novel real-time optical sensor for nitrate detection in water and soil.",
    date: "May 17, 2018",
    url: "https://www.newswire.com/news/max-ir-labs-awarded-225k-phase-i-nsf-sttr-grant-for-real-time-20482883",
  },
];

const PublicationsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 2,
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Initialize on mount
  useState(() => {
    if (emblaApi) onInit();
  });

  // Re-init when emblaApi changes
  if (emblaApi && scrollSnaps.length === 0) {
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
  }

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  // Calculate total dot count based on pairs
  const totalDots = Math.ceil(publications.length / 2);
  const dots = Array.from({ length: totalDots });

  return (
    <div className="relative">
      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {publications.map((pub, i) => (
            <div
              key={i}
              className="flex-[0_0_calc(50%-12px)] min-w-0 max-lg:flex-[0_0_100%]"
            >
              <div className="bg-card rounded-[16px] p-8 md:p-10 flex flex-col h-full min-h-[400px] shadow-[0_10px_17px_#0000000d]">
                <h3 className="text-[22px] md:text-[26px] font-bold text-[#4FBDBA] leading-snug mb-6">
                  {pub.title}
                </h3>
                <div className="flex-1">
                  {pub.body.split("\n\n").map((p, idx) => (
                    <p key={idx} className="text-foreground text-sm leading-relaxed mb-3">
                      {p}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4">
                  <span className="text-muted-foreground text-sm">{pub.date}</span>
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-semibold flex items-center gap-2"
                  >
                    Read article
                    <img src="/images/read-arrow.svg" alt="" className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-10">
        {dots.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === selectedIndex
                ? "bg-primary"
                : "bg-primary/20"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PublicationsCarousel;
