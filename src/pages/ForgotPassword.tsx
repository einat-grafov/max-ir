import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-maxir-dark flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="flex justify-center mb-10">
          <img src="/images/maxir-logo-light.svg" alt="Max-IR Labs" className="h-10" />
        </Link>

        <div className="bg-maxir-dark-surface border border-white/10 rounded-lg p-8">
          {sent ? (
            <div className="text-center">
              <h1 className="text-maxir-white text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-maxir-gray text-sm mb-6">
                We've sent a password reset link to <strong className="text-maxir-white">{email}</strong>
              </p>
              <Link
                to="/admin/login"
                className="text-primary hover:text-primary/80 text-sm transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-maxir-white text-2xl font-bold mb-2 text-center">
                Reset Password
              </h1>
              <p className="text-maxir-gray text-sm text-center mb-8">
                Enter your email and we'll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-maxir-white/80 text-sm font-medium mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@max-ir.com"
                    className="w-full h-11 bg-maxir-dark border border-white/10 rounded px-4 text-maxir-white text-sm placeholder:text-maxir-gray/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary hover:bg-maxir-red-hover text-primary-foreground rounded-full text-sm font-semibold transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <p className="text-maxir-gray text-xs text-center mt-6">
            <Link to="/admin/login" className="hover:text-maxir-white transition-colors">
              ← Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
