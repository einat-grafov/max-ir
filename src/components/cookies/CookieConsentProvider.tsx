import { useEffect, useState } from "react";
import CookieBanner from "@/components/cookies/CookieBanner";
import CookiePreferencesModal from "@/components/cookies/CookiePreferencesModal";
import {
  getStoredConsent,
  saveConsent,
  allAcceptedChoices,
  allRejectedChoices,
  type ConsentChoices,
} from "@/lib/consent-storage";
import {
  detectRegion,
  hasGpcSignal,
  getBannerPolicy,
} from "@/lib/geo-region";
import { initConsentGatedScripts } from "@/lib/consent-gated-scripts";

export default function CookieConsentProvider() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChoices, setCurrentChoices] = useState<ConsentChoices | null>(null);

  // On mount: decide initial state + start script-gating subscriber
  useEffect(() => {
    initConsentGatedScripts();

    const stored = getStoredConsent();
    if (stored) {
      // User already has valid consent — don't show the banner.
      setCurrentChoices(stored.current.choices);
      setBannerVisible(false);
      return;
    }

    // No valid stored consent. Decide behavior based on region + GPC.
    const region = detectRegion();
    const gpc = hasGpcSignal();
    const policy = getBannerPolicy(region, gpc);

    if (policy.defaultToOptOut) {
      // GPC detected — silently record opt-out, do not show banner.
      const rejected = allRejectedChoices();
      saveConsent(rejected, "gpc_auto_opt_out");
      setCurrentChoices(rejected);
      setBannerVisible(false);
    } else if (policy.showBanner) {
      setBannerVisible(true);
    }
  }, []);

  // Listen for footer "Cookie Settings" button clicks
  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("maxir:open-cookie-preferences", handler);
    return () =>
      window.removeEventListener("maxir:open-cookie-preferences", handler);
  }, []);

  // Banner callbacks
  const handleBannerAcceptAll = () => {
    const choices = allAcceptedChoices();
    saveConsent(choices, "banner_accept_all");
    setCurrentChoices(choices);
    setBannerVisible(false);
  };

  const handleBannerRejectAll = () => {
    const choices = allRejectedChoices();
    saveConsent(choices, "banner_reject_all");
    setCurrentChoices(choices);
    setBannerVisible(false);
  };

  const handleBannerCustomize = () => {
    setModalOpen(true);
    // Note: we intentionally do NOT hide the banner yet. If the user closes
    // the modal without saving, they can still click Accept/Reject on the banner.
    // The banner hides only when a consent action is actually recorded.
  };

  // Modal callbacks
  const handleModalSave = (choices: ConsentChoices) => {
    saveConsent(choices, "preferences_save");
    setCurrentChoices(choices);
    setBannerVisible(false);
  };

  const handleModalAcceptAll = () => {
    const choices = allAcceptedChoices();
    saveConsent(choices, "preferences_accept_all");
    setCurrentChoices(choices);
    setBannerVisible(false);
  };

  const handleModalRejectAll = () => {
    const choices = allRejectedChoices();
    saveConsent(choices, "preferences_reject_all");
    setCurrentChoices(choices);
    setBannerVisible(false);
  };

  return (
    <>
      {bannerVisible && !modalOpen && (
        <CookieBanner
          onAcceptAll={handleBannerAcceptAll}
          onRejectAll={handleBannerRejectAll}
          onCustomize={handleBannerCustomize}
        />
      )}
      <CookiePreferencesModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialChoices={currentChoices ?? undefined}
        onSave={handleModalSave}
        onAcceptAll={handleModalAcceptAll}
        onRejectAll={handleModalRejectAll}
      />
    </>
  );
}
