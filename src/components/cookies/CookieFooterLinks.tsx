import { useEffect, useState } from "react";
import {
  hasGpcSignal,
  detectRegion,
  getBannerPolicy,
  type BannerPolicy,
} from "@/lib/geo-region";
import { saveConsent, allRejectedChoices } from "@/lib/consent-storage";
import { toast } from "@/components/ui/sonner";

const DEFAULT_POLICY: BannerPolicy = {
  showBanner: true,
  defaultToOptOut: false,
  requiresOptIn: false,
  showDoNotSellLink: false,
};

export default function CookieFooterLinks() {
  const [policy, setPolicy] = useState<BannerPolicy>(DEFAULT_POLICY);

  useEffect(() => {
    const region = detectRegion();
    const gpc = hasGpcSignal();
    setPolicy(getBannerPolicy(region, gpc));
  }, []);

  const handleOpenPreferences = () => {
    try {
      window.dispatchEvent(new CustomEvent("maxir:open-cookie-preferences"));
    } catch (err) {
      console.warn("[CookieFooterLinks] Failed to dispatch open event", err);
    }
  };

  const handleDoNotSell = () => {
    const choices = allRejectedChoices();
    try {
      saveConsent(choices, "gpc_auto_opt_out");
    } catch (err) {
      console.warn("[CookieFooterLinks] Failed to save opt-out", err);
    }
    try {
      window.dispatchEvent(
        new CustomEvent("maxir:consent-changed", { detail: choices }),
      );
    } catch (err) {
      console.warn("[CookieFooterLinks] Failed to dispatch consent event", err);
    }
    try {
      toast("Your opt-out has been recorded.");
    } catch {
      if (typeof window !== "undefined") {
        window.alert("Your opt-out has been recorded.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleOpenPreferences}
        className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal text-left"
      >
        Cookie Settings
      </button>
      {policy.showDoNotSellLink && (
        <button
          type="button"
          onClick={handleDoNotSell}
          className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal text-left"
        >
          Do Not Sell or Share My Personal Information
        </button>
      )}
    </div>
  );
}
