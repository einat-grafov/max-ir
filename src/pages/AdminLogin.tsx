import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check admin role
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin");

    if (roleError || !roles || roles.length === 0) {
      await supabase.auth.signOut();
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-maxir-dark flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M5 35L20 5L25 15L15 35H5Z" fill="hsl(348,100%,61%)" />
            <path d="M15 35L25 15L35 35H15Z" fill="hsl(348,100%,61%)" opacity="0.7" />
          </svg>
          <span className="text-maxir-white font-bold text-lg tracking-wide">
            MAX-IR <span className="font-light">LABS</span>
          </span>
        </Link>

        <div className="bg-maxir-dark-surface border border-white/10 rounded-lg p-8">
          <h1 className="text-maxir-white text-2xl font-bold mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-maxir-gray text-sm text-center mb-8">
            Sign in to access the admin dashboard
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

            <div>
              <label className="text-maxir-white/80 text-sm font-medium mb-1.5 block">
                Password
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

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-maxir-red-hover text-primary-foreground rounded-full text-sm font-semibold transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-maxir-gray text-xs text-center mt-6">
          <Link to="/" className="hover:text-maxir-white transition-colors">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
