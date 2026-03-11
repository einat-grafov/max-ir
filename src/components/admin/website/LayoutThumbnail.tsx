const LayoutThumbnail = ({ id }: { id: string }) => {
  const base = "w-full h-full";
  switch (id) {
    case "hero_center":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="80" y="20" width="120" height="10" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          <rect x="20" y="55" width="120" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="65" width="110" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="75" width="100" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="95" width="60" height="16" rx="2" fill="hsl(var(--foreground))" />
          <rect x="160" y="45" width="100" height="75" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    case "hero_left":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="20" y="30" width="100" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          <rect x="20" y="55" width="120" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="65" width="110" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="20" y="85" width="55" height="16" rx="2" fill="hsl(var(--foreground))" />
          <rect x="160" y="25" width="100" height="85" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    case "hero_right":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="20" y="25" width="100" height="85" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="140" y="30" width="110" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          <rect x="140" y="55" width="120" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="140" y="65" width="110" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="140" y="85" width="55" height="16" rx="2" fill="hsl(var(--foreground))" />
        </svg>
      );
    case "hero_stack":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="80" y="15" width="120" height="10" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          <rect x="60" y="32" width="160" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="75" y="40" width="130" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="110" y="52" width="60" height="14" rx="2" fill="hsl(var(--foreground))" />
          <rect x="50" y="75" width="180" height="70" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    case "hero_no_image":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="70" y="40" width="140" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          <rect x="50" y="62" width="180" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="65" y="72" width="150" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
          <rect x="110" y="92" width="60" height="16" rx="2" fill="hsl(var(--foreground))" />
        </svg>
      );
    case "testimonial_slider":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="20" y="15" width="240" height="110" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          <text x="35" y="48" fontSize="28" fill="hsl(var(--muted-foreground) / 0.3)" fontFamily="serif">"</text>
          <rect x="35" y="55" width="100" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
          <rect x="35" y="65" width="90" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
          <circle cx="45" cy="100" r="10" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="60" y="95" width="50" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
          <rect x="60" y="103" width="35" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="160" y="25" width="90" height="90" rx="4" fill="hsl(var(--muted-foreground) / 0.15)" />
          <circle cx="125" cy="140" r="3" fill="hsl(var(--foreground))" />
          <circle cx="135" cy="140" r="3" fill="hsl(var(--muted-foreground) / 0.3)" />
          <circle cx="145" cy="140" r="3" fill="hsl(var(--muted-foreground) / 0.3)" />
          <circle cx="155" cy="140" r="3" fill="hsl(var(--muted-foreground) / 0.3)" />
        </svg>
      );
    case "metrics":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={20 + i * 65} y="50" width="50" height="14" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
              <rect x={22 + i * 65} y="72" width="46" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
            </g>
          ))}
        </svg>
      );
    case "logos":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={18 + i * 42} y="65" width="32" height="12" rx="2" fill="hsl(var(--muted-foreground) / 0.25)" />
          ))}
        </svg>
      );
    case "card_grid":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="90" y="10" width="100" height="8" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={20 + i * 85} y="30" width="75" height="50" rx="4" fill="hsl(var(--muted-foreground) / 0.15)" />
              <rect x={25 + i * 85} y="85" width="50" height="6" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
              <rect x={25 + i * 85} y="95" width="65" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
              <rect x={25 + i * 85} y="103" width="60" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.15)" />
            </g>
          ))}
        </svg>
      );
    case "card_carousel":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="80" y="10" width="120" height="8" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} opacity={i === 0 || i === 3 ? 0.4 : 1}>
              <rect x={-15 + i * 80} y="30" width="70" height="95" rx="4" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
              <rect x={-10 + i * 80} y="35" width="60" height="35" rx="2" fill="hsl(var(--muted-foreground) / 0.15)" />
              <rect x={-10 + i * 80} y="76" width="40" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
              <rect x={-10 + i * 80} y="85" width="55" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.15)" />
            </g>
          ))}
          <polygon points="8,78 16,72 16,84" fill="hsl(var(--muted-foreground) / 0.4)" />
          <polygon points="272,78 264,72 264,84" fill="hsl(var(--muted-foreground) / 0.4)" />
        </svg>
      );
    case "image_text_list":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="80" y="10" width="120" height="8" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x="20" y={30 + i * 60} width="55" height="50" rx="4" fill="hsl(var(--muted-foreground) / 0.2)" />
              <rect x="85" y={35 + i * 60} width="80" height="7" rx="1" fill="hsl(var(--muted-foreground) / 0.35)" />
              <rect x="85" y={46 + i * 60} width="50" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
              <rect x="85" y={56 + i * 60} width="170" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.15)" />
              <rect x="85" y={63 + i * 60} width="150" height="4" rx="1" fill="hsl(var(--muted-foreground) / 0.15)" />
            </g>
          ))}
        </svg>
      );
    case "cta_banner":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--foreground))" rx="4" />
          <rect x="70" y="35" width="140" height="12" rx="2" fill="hsl(var(--background) / 0.9)" />
          <rect x="50" y="58" width="180" height="5" rx="1" fill="hsl(var(--background) / 0.4)" />
          <rect x="65" y="67" width="150" height="5" rx="1" fill="hsl(var(--background) / 0.4)" />
          <rect x="100" y="90" width="80" height="20" rx="4" fill="hsl(var(--primary))" />
          <rect x="120" y="96" width="40" height="8" rx="1" fill="hsl(var(--primary-foreground) / 0.8)" />
        </svg>
      );
    case "full_width_image":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="10" y="10" width="260" height="120" rx="6" fill="hsl(var(--muted-foreground) / 0.2)" />
          <polygon points="60,90 110,50 160,80 200,55 250,90" fill="hsl(var(--muted-foreground) / 0.15)" />
          <circle cx="70" cy="45" r="12" fill="hsl(var(--muted-foreground) / 0.15)" />
          <rect x="90" y="138" width="100" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.25)" />
        </svg>
      );
    case "faq_accordion":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="80" y="10" width="120" height="8" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="30" y={30 + i * 30} width="220" height="22" rx="3" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
              <rect x="40" y={37 + i * 30} width={80 + i * 10} height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.3)" />
              <text x="238" y={45 + i * 30} fontSize="10" fill="hsl(var(--muted-foreground) / 0.3)" textAnchor="middle">+</text>
            </g>
          ))}
        </svg>
      );
    case "text_block":
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
          <rect x="60" y="30" width="160" height="10" rx="2" fill="hsl(var(--muted-foreground) / 0.4)" />
          <rect x="30" y="55" width="220" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="30" y="65" width="210" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="30" y="75" width="200" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="30" y="85" width="215" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="30" y="95" width="180" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
          <rect x="30" y="105" width="190" height="5" rx="1" fill="hsl(var(--muted-foreground) / 0.2)" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 280 160" className={base}>
          <rect width="280" height="160" fill="hsl(var(--muted))" rx="4" />
        </svg>
      );
  }
};

export default LayoutThumbnail;
