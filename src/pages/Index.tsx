import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { useHomeContent } from "@/hooks/useHomeContent";

const Index = () => {
  const { getSection, isSectionVisible } = useHomeContent();

  return (
    <div className="min-h-screen">
      <Navbar />
      {isSectionVisible("hero") && <HeroSection content={getSection("hero")} />}
      <ProductGrid subtitle={getSection("hero")?.subtitle || "Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications."} />
      <Footer />
    </div>
  );
};

export default Index;
