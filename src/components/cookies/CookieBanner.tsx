import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CookieBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
}

export default function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onCustomize,
}: CookieBannerProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-heading"
      aria-describedby="cookie-banner-description"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl"
    >
      <h2
        ref={headingRef}
        id="cookie-banner-heading"
        tabIndex={-1}
        className="text-lg font-semibold text-foreground outline-none"
      >
        We value your privacy
      </h2>
      <p
        id="cookie-banner-description"
        className="mt-2 text-sm text-foreground/80"
      >
        We use strictly necessary cookies to run this site. If we add analytics or marketing cookies in the future, we'll only set them with your consent. You can change your choices at any time.
      </p>
      <p className="mt-2 text-sm">
        <Link
          to="/privacy-policy#cookies"
          className="text-primary underline hover:no-underline"
        >
          Learn more in our Cookie Notice
        </Link>
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="default"
          size="default"
          onClick={onRejectAll}
          className="w-full sm:flex-1"
        >
          Reject All
        </Button>
        <Button
          variant="default"
          size="default"
          onClick={onCustomize}
          className="w-full sm:flex-1"
        >
          Customize
        </Button>
        <Button
          variant="default"
          size="default"
          onClick={onAcceptAll}
          className="w-full sm:flex-1"
        >
          Accept All
        </Button>
      </div>
    </div>
  );
}
