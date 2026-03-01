import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const tabs = ["Colors", "Typography", "Spacing", "Radius", "Components"] as const;
type Tab = (typeof tabs)[number];

const colorTokens = [
  { name: "Background", variable: "--background", tw: "bg-background" },
  { name: "Foreground", variable: "--foreground", tw: "bg-foreground" },
  { name: "Primary (Brand)", variable: "--primary", tw: "bg-primary" },
  { name: "Primary Foreground", variable: "--primary-foreground", tw: "bg-primary-foreground" },
  { name: "Secondary", variable: "--secondary", tw: "bg-secondary" },
  { name: "Secondary Foreground", variable: "--secondary-foreground", tw: "bg-secondary-foreground" },
  { name: "Muted", variable: "--muted", tw: "bg-muted" },
  { name: "Muted Foreground", variable: "--muted-foreground", tw: "bg-muted-foreground" },
  { name: "Accent", variable: "--accent", tw: "bg-accent" },
  { name: "Accent Foreground", variable: "--accent-foreground", tw: "bg-accent-foreground" },
  { name: "Card", variable: "--card", tw: "bg-card" },
  { name: "Card Foreground", variable: "--card-foreground", tw: "bg-card-foreground" },
  { name: "Border", variable: "--border", tw: "bg-border" },
  { name: "Input", variable: "--input", tw: "bg-input" },
  { name: "Ring", variable: "--ring", tw: "bg-ring" },
  { name: "Destructive", variable: "--destructive", tw: "bg-destructive" },
];

const maxirTokens = [
  { name: "Max-IR Dark", variable: "--maxir-dark", tw: "bg-maxir-dark" },
  { name: "Max-IR Dark Surface", variable: "--maxir-dark-surface", tw: "bg-maxir-dark-surface" },
  { name: "Max-IR Red", variable: "--maxir-red", tw: "bg-maxir-red" },
  { name: "Max-IR Red Hover", variable: "--maxir-red-hover", tw: "bg-maxir-red-hover" },
  { name: "Max-IR White", variable: "--maxir-white", tw: "bg-maxir-white" },
  { name: "Max-IR Gray", variable: "--maxir-gray", tw: "bg-maxir-gray" },
  { name: "Max-IR Light Gray", variable: "--maxir-light-gray", tw: "bg-maxir-light-gray" },
  { name: "Max-IR Section Dark", variable: "--maxir-section-dark", tw: "bg-maxir-section-dark" },
  { name: "Max-IR Section Darker", variable: "--maxir-section-darker", tw: "bg-maxir-section-darker" },
];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`Copied: ${text}`);
};

function ColorSwatch({ name, variable, tw }: { name: string; variable: string; tw: string }) {
  return (
    <div className="flex flex-col">
      <div
        className={`${tw} h-[160px] w-full rounded-[16px] border border-border`}
      />
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs font-mono text-muted-foreground">{variable}</p>
        </div>
        <button
          onClick={() => copyToClipboard(variable)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ColorsTab() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Core Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {colorTokens.map((c) => (
            <ColorSwatch key={c.variable} {...c} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Max-IR Brand Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {maxirTokens.map((c) => (
            <ColorSwatch key={c.variable} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TypographyTab() {
  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">Typography</h2>

      <div className="space-y-8">
        <div className="border-b border-border pb-6">
          <p className="text-xs font-mono text-muted-foreground mb-2">Font Family: Montserrat</p>
          <p className="text-base text-muted-foreground">
            The primary typeface used across the entire application for headings, body text, and UI elements.
          </p>
        </div>

        {[
          { label: "H1 — Hero Heading", size: "text-[100px]", weight: "font-semibold", sample: "MAX-IR Labs" },
          { label: "H2 — Section Heading", size: "text-[80px]", weight: "font-bold", sample: "Technology" },
          { label: "H3 — Card Heading", size: "text-2xl", weight: "font-semibold", sample: "Real-time Analysis" },
          { label: "Subtitle", size: "text-[24px]", weight: "font-medium", sample: "Next-generation infrared sensing" },
          { label: "Body", size: "text-[18px]", weight: "font-medium", sample: "MAX-IR Labs develops cutting-edge mid-infrared sensor technology for real-time molecular analysis across industries." },
          { label: "Small / Caption", size: "text-sm", weight: "font-normal", sample: "Updated 2 hours ago" },
          { label: "Overline", size: "text-xs", weight: "font-semibold tracking-widest uppercase", sample: "Award Winning" },
        ].map((t) => (
          <div key={t.label} className="border-b border-border pb-6">
            <p className="text-xs font-mono text-muted-foreground mb-2">{t.label} — {t.size} {t.weight}</p>
            <p className={`${t.size} ${t.weight} text-foreground font-montserrat leading-tight`}>{t.sample}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpacingTab() {
  const spacings = [
    { label: "4px", value: "1", class: "w-1" },
    { label: "8px", value: "2", class: "w-2" },
    { label: "12px", value: "3", class: "w-3" },
    { label: "16px", value: "4", class: "w-4" },
    { label: "24px", value: "6", class: "w-6" },
    { label: "32px", value: "8", class: "w-8" },
    { label: "48px", value: "12", class: "w-12" },
    { label: "64px", value: "16", class: "w-16" },
    { label: "96px", value: "24", class: "w-24" },
    { label: "128px", value: "32", class: "w-32" },
  ];

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">Spacing Scale</h2>
      <div className="space-y-4">
        {spacings.map((s) => (
          <div key={s.value} className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground w-16 text-right">{s.label}</span>
            <div className={`${s.class} h-6 bg-primary rounded-sm`} />
            <span className="text-xs font-mono text-muted-foreground">space-{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadiusTab() {
  const radii = [
    { label: "None", value: "0px", class: "rounded-none" },
    { label: "Small", value: "calc(var(--radius) - 4px)", class: "rounded-sm" },
    { label: "Medium", value: "calc(var(--radius) - 2px)", class: "rounded-md" },
    { label: "Large", value: "var(--radius)", class: "rounded-lg" },
    { label: "Button (10px)", value: "10px", class: "rounded-[10px]" },
    { label: "Card (16px)", value: "16px", class: "rounded-[16px]" },
    { label: "Full", value: "9999px", class: "rounded-full" },
  ];

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold text-foreground mb-6">Border Radius</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {radii.map((r) => (
          <div key={r.label} className="flex flex-col items-center gap-3">
            <div className={`w-24 h-24 bg-primary ${r.class}`} />
            <p className="text-sm font-semibold text-foreground">{r.label}</p>
            <p className="text-xs font-mono text-muted-foreground">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentsTab() {
  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Components</h2>

      {/* Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Buttons</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon"><Copy className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Badges</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Inputs</h3>
        <div className="max-w-sm space-y-3">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Cards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the card content area with some sample text.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card className="bg-foreground text-background">
            <CardHeader>
              <CardTitle className="text-background">Dark Card</CardTitle>
              <CardDescription className="text-background/60">Inverted variant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-background/60">
                A dark card using the foreground color as background.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Accent Border</CardTitle>
              <CardDescription>With primary border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Card with an accent-colored border highlight.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Colors");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-foreground font-montserrat">Design System</h1>
          <p className="text-sm font-mono text-muted-foreground">MAX-IR Labs · Internal</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "Colors" && <ColorsTab />}
        {activeTab === "Typography" && <TypographyTab />}
        {activeTab === "Spacing" && <SpacingTab />}
        {activeTab === "Radius" && <RadiusTab />}
        {activeTab === "Components" && <ComponentsTab />}
      </div>
    </div>
  );
};

export default DesignSystem;
