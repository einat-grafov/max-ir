import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    setLoading(true);
    try {
      const id = crypto.randomUUID();
      const subjectForDb = formData.subject || "General Inquiry";
      await supabase.from("inquiries").insert({
        id,
        product_name: subjectForDb,
        name: formData.name,
        email: formData.email,
        message: formData.message,
        first_name: formData.name.split(" ")[0],
        last_name: formData.name.split(" ").slice(1).join(" ") || null,
        source: "support",
      } as any);

      // Confirmation to the visitor
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-confirmation",
          recipientEmail: formData.email,
          idempotencyKey: `contact-confirm-${id}`,
          templateData: {
            name: formData.name,
            subject: formData.subject || undefined,
          },
        },
      });

      // Notify admin (if a notification email is configured)
      const { data: settings } = await supabase
        .from("notification_settings")
        .select("inquiries_notification_email")
        .eq("singleton", true)
        .maybeSingle();
      const notifyEmail = settings?.inquiries_notification_email?.trim();
      if (notifyEmail) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "inquiry-admin-notification",
            recipientEmail: notifyEmail,
            idempotencyKey: `inquiry-admin-${id}`,
            templateData: {
              inquirerName: formData.name,
              inquirerEmail: formData.email,
              product: subjectForDb,
              message: formData.message,
            },
          },
        });
      }

      setSubmitted(true);
    } catch {
      // Still show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
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
      <select
        value={formData.subject}
        onChange={(e) => handleChange("subject", e.target.value)}
        className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white/80 px-4 py-3 text-sm focus:outline-none focus:border-primary"
      >
        <option value="">Please select a subject</option>
        <option>Product Purchase</option>
        <option>Technology Information</option>
        <option>Partnering</option>
        <option>Investment Options</option>
        <option>Other/General Inquiry</option>
      </select>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        required
        className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary"
      />
      <input
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        required
        className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary"
      />
      <textarea
        placeholder="Message"
        rows={4}
        value={formData.message}
        onChange={(e) => handleChange("message", e.target.value)}
        required
        className="bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-8 py-3 text-sm font-semibold transition-colors w-fit disabled:opacity-50"
      >
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
};

export default ContactForm;
