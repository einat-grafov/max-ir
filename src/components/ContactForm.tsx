import { useState } from "react";

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <img src="/images/read-arrow.svg" alt="Checkmark" className="w-12 h-12 mx-auto mb-4 invert" />
        <p className="text-maxir-white font-semibold text-lg">Thank you!</p>
        <p className="text-maxir-white text-sm mt-2">Your message has been received!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <select className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white/80 px-4 py-3 text-sm focus:outline-none focus:border-primary">
        <option>Please select a subject</option>
        <option>Product Purchase</option>
        <option>Technology Information</option>
        <option>Partnering</option>
        <option>Investment Options</option>
        <option>Other/General Inquiry</option>
      </select>
      <input type="text" placeholder="Name" className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary" />
      <input type="email" placeholder="Email Address" className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary" />
      <textarea placeholder="Message" rows={4} className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary resize-none" />
      <button type="submit" className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-8 py-3 text-sm font-semibold transition-colors w-fit">
        Submit
      </button>
    </form>
  );
};

export default ContactForm;
