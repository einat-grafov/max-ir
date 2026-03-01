import { useState } from "react";

const CareersForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground font-semibold text-lg">Thank you!</p>
        <p className="text-foreground text-sm mt-2">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Full Name*"
        required
        className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="email"
          placeholder="E-Mail*"
          required
          className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Country*"
          required
          className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
        />
      </div>
      <input
        type="text"
        placeholder="Education"
        className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
      />
      <textarea
        placeholder="Tell us about yourself"
        rows={5}
        className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary resize-none"
      />
      <button
        type="submit"
        className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-8 py-3 text-sm font-semibold transition-colors rounded-lg w-full"
      >
        Send
      </button>
    </form>
  );
};

export default CareersForm;
