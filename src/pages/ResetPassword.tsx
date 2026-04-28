import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detect invite flow either from query (?invite=1) or hash (#type=invite)
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const isInvite =
    searchParams.get("invite") === "1" ||
    hash.includes("type=invite") ||
    hash.includes("type=signup");

  useEffect(() => {
    // Listen for auth events (invite signs user in via SIGNED_IN; reset uses PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Sign out so the user lands on a clean login screen and signs in fresh
      await supabase.auth.signOut();
      setTimeout(() => navigate("/admin/login"), 2000);
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
          {success ? (
            <div className="text-center">
              <h1 className="text-maxir-white text-2xl font-bold mb-2">
                {isInvite ? "Password Set" : "Password Updated"}
              </h1>
              <p className="text-maxir-gray text-sm">
                Redirecting to login...
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center">
              <h1 className="text-maxir-white text-2xl font-bold mb-2">Verifying...</h1>
              <p className="text-maxir-gray text-sm">
                Please wait while we verify your link.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-maxir-white text-2xl font-bold mb-2 text-center">
                {isInvite ? "Welcome — Set Your Password" : "Set New Password"}
              </h1>
              <p className="text-maxir-gray text-sm text-center mb-8">
                {isInvite
                  ? "Choose a password to activate your account."
                  : "Enter your new password below"}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-maxir-white/80 text-sm font-medium mb-1.5 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-11 bg-maxir-dark border border-white/10 rounded px-4 text-maxir-white text-sm placeholder:text-maxir-gray/50 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-maxir-white/80 text-sm font-medium mb-1.5 block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
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
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
