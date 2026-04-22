import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CareersForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    education: "",
    about: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.country.trim()) return;
    setLoading(true);
    try {
      const id = crypto.randomUUID();
      await supabase.from("career_applications" as any).insert({
        id,
        full_name: formData.fullName,
        email: formData.email,
        country: formData.country || null,
        education: formData.education || null,
        about: formData.about || null,
      } as any);

      // Confirmation to the applicant
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "careers-confirmation",
          recipientEmail: formData.email,
          idempotencyKey: `careers-confirm-${id}`,
          templateData: { name: formData.fullName },
        },
      });

      // Notify admin (if a notification email is configured)
      const { data: settings } = await supabase
        .from("notification_settings")
        .select("careers_notification_email")
        .eq("singleton", true)
        .maybeSingle();
      const notifyEmail = settings?.careers_notification_email?.trim();
      if (notifyEmail) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "careers-admin-notification",
            recipientEmail: notifyEmail,
            idempotencyKey: `careers-admin-${id}`,
            templateData: {
              applicantName: formData.fullName,
              applicantEmail: formData.email,
              country: formData.country || undefined,
              education: formData.education || undefined,
              about: formData.about || undefined,
            },
          },
        });
      }

      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
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
        value={formData.fullName}
        onChange={(e) => handleChange("fullName", e.target.value)}
        className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="email"
          placeholder="E-Mail*"
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
        />
        <input
          type="text"
          placeholder="Country*"
          required
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
        />
      </div>
      <input
        type="text"
        placeholder="Education"
        value={formData.education}
        onChange={(e) => handleChange("education", e.target.value)}
        className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary"
      />
      <textarea
        placeholder="Tell us about yourself"
        rows={5}
        value={formData.about}
        onChange={(e) => handleChange("about", e.target.value)}
        className="border border-foreground/20 bg-background text-foreground px-4 py-3 text-sm rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-primary resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-8 py-3 text-sm font-semibold transition-colors rounded-lg w-full disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default CareersForm;
