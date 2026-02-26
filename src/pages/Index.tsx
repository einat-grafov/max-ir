import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TechnologySection from "@/components/TechnologySection";
import TechnologyDiagramSection from "@/components/TechnologyDiagramSection";
import SensorSection from "@/components/SensorSection";
import ApplicationsSection from "@/components/ApplicationsSection";
import AwardsSection from "@/components/AwardsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TechnologySection />
      <TechnologyDiagramSection />
      <SensorSection />
      <ApplicationsSection />
      <AwardsSection />
      <Footer />
    </div>
  );
};

export default Index;
