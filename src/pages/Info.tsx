import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TechnologySection from "@/components/TechnologySection";
import SensorSection from "@/components/SensorSection";
import ApplicationsSection from "@/components/ApplicationsSection";
import AwardsSection from "@/components/AwardsSection";
import Footer from "@/components/Footer";
import { useHomeContent } from "@/hooks/useHomeContent";

const Info = () => {
  const { getSection, isSectionVisible } = useHomeContent();

  return (
    <div className="min-h-screen">
      <Navbar />
      {isSectionVisible("hero") && <HeroSection content={getSection("hero")} />}
      {isSectionVisible("technology") && (
        <>
          <AboutSection content={getSection("technology")} />
          <TechnologySection content={getSection("technology")} />
        </>
      )}
      {isSectionVisible("sensor") && <SensorSection content={getSection("sensor")} />}
      {isSectionVisible("applications") && <ApplicationsSection content={getSection("applications")} />}
      {isSectionVisible("awards") && <AwardsSection content={getSection("awards")} />}
      <Footer />
    </div>
  );
};

export default Info;
