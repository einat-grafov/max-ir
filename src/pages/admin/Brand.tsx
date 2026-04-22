import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_LIGHT = "/images/maxir-logo-light.svg";
const LOGO_DARK = "/images/maxir-logo-dark.svg";
const LOGO_DEFAULT = "/images/maxir-logo.svg";

const brandColors = [
  { name: "Brand Pink", hex: "#FF2D55", rgb: "255, 45, 85", cssVar: "--primary" },
  { name: "Brand Teal", hex: "#4FBDBA", rgb: "79, 189, 186", cssVar: "--secondary-accent" },
  { name: "Surface Dark", hex: "#121212", rgb: "18, 18, 18", cssVar: "--maxir-dark" },
  { name: "Surface Darker", hex: "#0C0F14", rgb: "12, 15, 20", cssVar: "--maxir-section-darker" },
  { name: "Foreground", hex: "#212121", rgb: "33, 33, 33", cssVar: "--foreground" },
  { name: "Background", hex: "#FFFFFF", rgb: "255, 255, 255", cssVar: "--background" },
  { name: "Muted", hex: "#F5F5F5", rgb: "245, 245, 245", cssVar: "--muted" },
  { name: "Border", hex: "#E5E5E5", rgb: "229, 229, 229", cssVar: "--border" },
];

const typeSamples = [
  {
    tag: "H1",
    text: "Making Infrared Sense",
    font: "Montserrat",
    weight: "700 (Bold)",
    className: "text-5xl md:text-6xl font-bold text-foreground",
  },
  {
    tag: "H2",
    text: "Real-time chemical analysis",
    font: "Montserrat",
    weight: "700 (Bold)",
    className: "text-3xl md:text-4xl font-bold text-foreground",
  },
  {
    tag: "H3",
    text: "Quantum Cascade Laser",
    font: "Montserrat",
    weight: "600 (SemiBold)",
    className: "text-2xl md:text-3xl font-semibold text-foreground",
  },
  {
    tag: "Body",
    text: "Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications. Founded in 2017, we develop infrared solutions for industrial process control, medical diagnostics and biochemical analysis.",
    font: "Montserrat",
    weight: "400 (Regular) — 500 (Medium)",
    className: "text-base font-normal text-foreground leading-relaxed",
  },
  {
    tag: "Caption",
    text: "Sales tax: Calculated at checkout for U.S. shipping addresses.",
    font: "Montserrat",
    weight: "400 (Regular)",
    className: "text-sm font-normal text-muted-foreground",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DownloadLogoButton({ src, label, name }: { src: string; label: string; name: string }) {
  const handleDownload = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="w-3.5 h-3.5 mr-1.5" />
      {label}
    </Button>
  );
}

const Brand = () => {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Brand</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Logos, color palette, and typography. Use these assets to keep the Max-IR brand consistent across all
          materials.
        </p>
      </div>

      {/* ─── Logo & Usage ─── */}
      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Logo &amp; Usage</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Use the primary logo whenever possible. Light/dark variants are provided for contrast on different
            backgrounds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Primary */}
          <div className="rounded-xl border bg-background p-6 flex flex-col items-center gap-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary</span>
            <div className="h-16 flex items-center justify-center">
              <img src={LOGO_DEFAULT} alt="Max-IR primary logo" className="h-9" />
            </div>
            <DownloadLogoButton src={LOGO_DEFAULT} label="Download SVG" name="maxir-logo" />
          </div>

          {/* Dark (for light backgrounds) */}
          <div className="rounded-xl border bg-background p-6 flex flex-col items-center gap-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dark variant
            </span>
            <div className="h-16 flex items-center justify-center">
              <img src={LOGO_DARK} alt="Max-IR dark logo" className="h-9" />
            </div>
            <DownloadLogoButton src={LOGO_DARK} label="Download SVG" name="maxir-logo-dark" />
          </div>

          {/* Light (for dark backgrounds) */}
          <div className="rounded-xl border p-6 flex flex-col items-center gap-5" style={{ backgroundColor: "#121212" }}>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Light variant</span>
            <div className="h-16 flex items-center justify-center">
              <img src={LOGO_LIGHT} alt="Max-IR light logo" className="h-9" />
            </div>
            <DownloadLogoButton src={LOGO_LIGHT} label="Download SVG" name="maxir-logo-light" />
          </div>
        </div>

        {/* Clear space */}
        <div className="mt-6 rounded-xl border border-dashed p-6 md:p-10 text-center bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Clear space</p>
          <div className="inline-block border-2 border-dashed border-primary/30 p-8 md:p-12 rounded-xl bg-background">
            <img src={LOGO_DEFAULT} alt="Clear space example" className="h-7 md:h-8" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            Always maintain clear space around the logo equal to the height of the brand mark on all sides.
          </p>
        </div>
      </section>

      {/* ─── Color Palette ─── */}
      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Color Palette</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The core palette used across the website, marketing, and product surfaces. Click any value to copy.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brandColors.map((c) => (
            <div key={c.name} className="rounded-xl border overflow-hidden bg-background">
              <div className="h-20" style={{ backgroundColor: c.hex }} />
              <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold text-foreground">{c.name}</p>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-muted-foreground font-mono">{c.hex}</span>
                  <CopyButton text={c.hex} />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-muted-foreground font-mono truncate">rgb({c.rgb})</span>
                  <CopyButton text={`rgb(${c.rgb})`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Typography ─── */}
      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Typography</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Max-IR uses <span className="font-semibold text-foreground">Montserrat</span> across all surfaces — clear,
            modern, and engineered for readability.
          </p>
        </div>

        <div className="space-y-4">
          {typeSamples.map((s) => (
            <div key={s.tag} className="rounded-xl border bg-background p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-8 rounded-md bg-primary/10 text-primary text-xs font-bold">
                  {s.tag}
                </span>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{s.font}</span> · {s.weight}
                </div>
              </div>
              <p className={s.className}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Brand;
