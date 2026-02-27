import { useState, useCallback } from "react";

interface ApplicationMediaProps {
  imageSrc: string;
  imageAlt: string;
  shadowSrc?: string;
  /** Mirror the shadow offset to the left instead of right */
  shadowLeft?: boolean;
}

const ApplicationMedia = ({
  imageSrc,
  imageAlt,
  shadowSrc,
  shadowLeft = false,
}: ApplicationMediaProps) => {
  const [tapped, setTapped] = useState(false);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTapped((prev) => !prev);
  }, []);

  const handleBlur = useCallback(() => setTapped(false), []);

  const shadowOffset = shadowLeft
    ? { default: "-18px, 22px", hover: "-28px, 34px" }
    : { default: "18px, 22px", hover: "28px, 34px" };

  return (
    <button
      type="button"
      className={`application-media group relative block w-full cursor-default outline-none ${tapped ? "is-active" : ""}`}
      onTouchEnd={handleTouchEnd}
      onBlur={handleBlur}
      aria-label={imageAlt}
    >
      {/* Shadow layer */}
      {shadowSrc && (
        <img
          src={shadowSrc}
          alt=""
          aria-hidden="true"
          className="application-media__shadow absolute inset-0 w-full h-auto opacity-60 will-change-transform"
          style={
            {
              "--shadow-default": `translate(${shadowOffset.default})`,
              "--shadow-hover": `translate(${shadowOffset.hover}) scale(0.98)`,
              zIndex: 0,
              transform: `translate(${shadowOffset.default})`,
            } as React.CSSProperties
          }
        />
      )}

      {/* Image tile */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="application-media__image relative z-10 w-full rounded-[30px] will-change-transform"
      />
    </button>
  );
};

export default ApplicationMedia;
