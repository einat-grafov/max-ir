import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";

const Store = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-[70px]">
        {/* Dark header with title */}
        <section className="bg-maxir-dark relative pb-0">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-24 lg:pb-32">
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-maxir-white text-center font-montserrat">
              Our Products
            </h1>
          </div>
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-[1px]">
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              className="w-full h-[60px] md:h-[90px] lg:h-[120px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,60 C300,120 600,0 900,60 C1100,100 1300,40 1440,80 L1440,120 L0,120 Z"
                fill="hsl(0 0% 100%)"
              />
            </svg>
          </div>
        </section>

        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Store;
