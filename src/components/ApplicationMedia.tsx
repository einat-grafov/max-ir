import { useState, useCallback } from "react";

interface ApplicationMediaProps {
  imageSrc: string;
  imageAlt: string;
  shadowSrc?: string;
  /** Which side the image sits on — controls lift & shadow direction */
  position?: "left" | "right";
}

const ApplicationMedia = ({
  imageSrc,
  imageAlt,
  shadowSrc,
  position = "left",
}: ApplicationMediaProps) => {
  const [tapped, setTapped] = useState(false);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setTapped((prev) => !prev);
  }, []);

  const handleBlur = useCallback(() => setTapped(false), []);

  // Image lifts away from center; shadow shifts opposite
  const isLeft = position === "left";

  const vars = {
    // Shadow: offset away from image, shifts further on hover
    "--shadow-x": isLeft ? "18px" : "-18px",
    "--shadow-y": "22px",
    "--shadow-hover-x": isLeft ? "28px" : "-28px",
    "--shadow-hover-y": "34px",
    // Image: lifts toward its own side (away from center)
    "--img-hover-x": isLeft ? "-10px" : "10px",
    "--img-hover-y": "-12px",
    "--img-hover-rotate": isLeft ? "-1deg" : "1deg",
  } as React.CSSProperties;

  return (
    <button
      type="button"
      className={`application-media group relative block w-full cursor-default outline-none ${tapped ? "is-active" : ""}`}
      onTouchEnd={handleTouchEnd}
      onBlur={handleBlur}
      aria-label={imageAlt}
      style={vars}
    >
      {/* Shadow layer */}
      {shadowSrc && (
        <img
          src={shadowSrc}
          alt=""
          aria-hidden="true"
          className="application-media__shadow absolute inset-0 w-full h-auto will-change-transform"
          style={{ zIndex: 0 }}
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
