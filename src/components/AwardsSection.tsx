import { ChevronLeft, ChevronRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const awards = [
  {
    logo: "/images/award-usaf.png",
    title: "Phase-I USAF DoD STTR",
    description: "Thermal Monitoring of Quantum Cascade Lasers Using Scanning Near-Field Infrared Radiometry with Sub-Wavelength Resolution, 2017",
  },
  {
    logo: "/images/award-nsf.png",
    title: "Phase-I NSF STTR",
    description: "Development of low-cost optical sensor for nitrate detection in agricultural soils and environmental waters, 2018",
  },
  {
    logo: "/images/award-usaf.png",
    title: "Phase-II USAF DoD STTR",
    description: "Midwave Infrared (MWIR) Quantum Cascade Lasers (QCL) Thermal Monitoring, 2018-2020",
  },
  {
    logo: "/images/award-patent.png",
    title: "U.S. Patent #10,458,907",
    description: "Infrared analytical sensor for soil or water and method of operation thereof, issued May 25, 2018",
    showBanner: true,
  },
];

const AwardsSection = () => {
  return (
    <section id="Awards" className="section-white py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        <ScrollReveal>
          <div className="accent-line-center mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] leading-none font-bold mb-12 text-center">Awards and Achievements</h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15} variant="fadeIn">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <div className="relative flex items-center">
              <CarouselPrevious
                className="static translate-y-0 flex-shrink-0 w-10 h-10 border-none bg-transparent shadow-none text-foreground/30 hover:text-foreground/60 hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={32} />
              </CarouselPrevious>

              <CarouselContent className="-ml-4">
                {awards.map((award, i) => (
                  <CarouselItem
                    key={i}
                    className="pl-4 basis-full md:basis-1/3 lg:basis-1/4"
                  >
                    <div className="relative bg-white rounded-[16px] shadow-[0_8px_36px_#0000000d] p-8 flex flex-col items-center text-center h-full overflow-hidden">
                      {award.showBanner && (
                        <img
                          src="/images/patent-banner.png"
                          alt="Patent"
                          className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                        />
                      )}
                      <img src={award.logo} alt="Award logo" className="h-24 mb-6 object-contain" />
                      <h3 className="font-bold text-lg mb-3">{award.title}</h3>
                      <p className="text-foreground/60 text-sm leading-relaxed">{award.description}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselNext
                className="static translate-y-0 flex-shrink-0 w-10 h-10 border-none bg-transparent shadow-none text-foreground/30 hover:text-foreground/60 hover:bg-transparent transition-colors"
              >
                <ChevronRight size={32} />
              </CarouselNext>
            </div>
          </Carousel>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AwardsSection;
