import { useState, useCallback, useRef } from "react";

interface ApplicationMediaProps {
  imageSrc: string;
  imageAlt: string;
  shadowSrc?: string;
  position?: "left" | "right";
}

const ApplicationMedia = ({
  imageSrc,
  imageAlt,
  shadowSrc,
  position = "left",
}: ApplicationMediaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)"
  );
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);

  const isLeft = position === "left";

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 12;
      const rotateY = (x - 0.5) * 12;
      setTransform(
        `translate3d(0px, -4px, 0px) scale3d(1.02, 1.02, 1) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(0deg) skew(0deg, 0deg)`
      );
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsHovered(false);
    setTransform(
      "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)"
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative block w-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      {/* Shadow layer */}
      {shadowSrc && (
        <img
          src={shadowSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-auto"
          style={{
            zIndex: 0,
            transform: `translate(${isLeft ? "18px" : "-18px"}, 22px)`,
            opacity: isHovered ? 0.38 : 0.6,
            filter: isHovered ? "blur(6px)" : "blur(2px)",
            transition: "opacity 350ms cubic-bezier(0.2,0.8,0.2,1), filter 350ms cubic-bezier(0.2,0.8,0.2,1)",
          }}
        />
      )}

      {/* Image tile */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="relative z-10 w-full rounded-[30px]"
        style={{
          willChange: "transform",
          transform,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 120ms ease-out"
            : "transform 450ms cubic-bezier(0.2,0.8,0.2,1)",
        }}
      />
    </div>
  );
};

export default ApplicationMedia;
