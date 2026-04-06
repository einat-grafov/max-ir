import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "done" | "already" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("done");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <img src="/images/maxir-logo-dark.svg" alt="Max-IR Labs" className="h-10 mx-auto" />

        {status === "loading" && <p className="text-muted-foreground">Loading...</p>}

        {status === "invalid" && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Invalid Link</h1>
            <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>
          </div>
        )}

        {status === "valid" && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground">
              Are you sure you want to unsubscribe from Max-IR emails?
            </p>
            <button
              onClick={handleUnsubscribe}
              className="bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Confirm Unsubscribe
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground">You've been successfully unsubscribed from our emails.</p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground">You're already unsubscribed from our emails.</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">Something Went Wrong</h1>
            <p className="text-muted-foreground">Please try again later or contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
