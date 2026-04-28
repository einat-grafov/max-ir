import ContactForm from "@/components/ContactForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageSeo from "@/hooks/usePageSeo";

const CustomerService = () => {
  usePageSeo({
    title: "Customer Service — MAX-IR",
    description: "Contact MAX-IR customer service. Fill out the form and we'll get back to you promptly.",
  });

  return (
    <div className="min-h-screen flex flex-col bg-maxir-dark">
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-[800px] mx-auto px-6">
          <h1 className="text-maxir-white text-3xl md:text-4xl font-bold mb-4">
            Customer Service
          </h1>
          <p className="text-maxir-white/80 text-base mb-8">
            How can we help? Please fill out the form below and a member of our team will get back to you promptly.
          </p>
          <div className="bg-maxir-dark-surface/40 p-6 md:p-8 rounded-[16px] border border-maxir-white/10">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerService;
