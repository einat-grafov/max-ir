import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Accessibility, X, ZoomIn, ZoomOut, Contrast, Link2,
  MousePointer2, RotateCcw, Type, Keyboard, EyeOff,
  SunMoon, Palette, Heading, Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface A11yState {
  fontSize: number;
  highContrast: boolean;
  highlightLinks: boolean;
  highlightTitles: boolean;
  bigCursor: boolean;
  blackCursor: boolean;
  readableFont: boolean;
  monochrome: boolean;
  sepia: boolean;
  blackYellow: boolean;
  invert: boolean;
  stopBlinks: boolean;
  keyboardNav: boolean;
  tooltipVisible: boolean;
}

const DEFAULT_STATE: A11yState = {
  fontSize: 0,
  highContrast: false,
  highlightLinks: false,
  highlightTitles: false,
  bigCursor: false,
  blackCursor: false,
  readableFont: false,
  monochrome: false,
  sepia: false,
  blackYellow: false,
  invert: false,
  stopBlinks: false,
  keyboardNav: false,
  tooltipVisible: false,
};

const STORAGE_KEY = "a11y_settings";

function loadState(): A11yState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

const POSITION_CLASSES: Record<string, { trigger: string; panel: string }> = {
  "bottom-left": { trigger: "bottom-6 left-6", panel: "bottom-24 left-6" },
  "bottom-right": { trigger: "bottom-6 right-6", panel: "bottom-24 right-6" },
  "top-left": { trigger: "top-6 left-6", panel: "top-24 left-6" },
  "top-right": { trigger: "top-6 right-6", panel: "top-24 right-6" },
};

export default function AccessibilityWidget() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const { data: settings } = useQuery({
    queryKey: ["accessibility-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accessibility_settings")
        .select("enabled, button_color, position")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(loadState);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const applyState = useCallback((s: A11yState) => {
    const root = document.documentElement;
    const sizes = ["100%", "115%", "130%"];
    root.style.fontSize = sizes[s.fontSize] || "100%";
    root.classList.toggle("a11y-high-contrast", s.highContrast);
    root.classList.toggle("a11y-highlight-links", s.highlightLinks);
    root.classList.toggle("a11y-highlight-titles", s.highlightTitles);
    root.classList.toggle("a11y-big-cursor", s.bigCursor);
    root.classList.toggle("a11y-black-cursor", s.blackCursor);
    root.classList.toggle("a11y-readable-font", s.readableFont);
    root.classList.toggle("a11y-monochrome", s.monochrome);
    root.classList.toggle("a11y-sepia", s.sepia);
    root.classList.toggle("a11y-black-yellow", s.blackYellow);
    root.classList.toggle("a11y-invert", s.invert);
    root.classList.toggle("a11y-stop-blinks", s.stopBlinks);
    root.classList.toggle("a11y-keyboard-nav", s.keyboardNav);
    root.classList.toggle("a11y-tooltip-visible", s.tooltipVisible);
  }, []);

  useEffect(() => {
    applyState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, applyState]);

  useEffect(() => {
    if (open && panelRef.current) {
      const firstFocusable = panelRef.current.querySelector<HTMLElement>("button, [tabindex]");
      firstFocusable?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (isAdmin) return null;
  if (!settings || !settings.enabled) return null;

  const update = (patch: Partial<A11yState>) =>
    setState((prev) => ({ ...prev, ...patch }));
  const reset = () => setState(DEFAULT_STATE);
  const hasChanges = JSON.stringify(state) !== JSON.stringify(DEFAULT_STATE);

  const pos = POSITION_CLASSES[settings.position] || POSITION_CLASSES["bottom-left"];
  const buttonColor = settings.button_color || "#FF2D55";

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open accessibility menu"
        aria-expanded={open}
        title="Accessibility"
        style={{ backgroundColor: buttonColor }}
        className={`fixed ${pos.trigger} z-[9999] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        {open ? <X className="h-6 w-6" /> : <Accessibility className="h-6 w-6" />}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility settings"
          aria-modal="true"
          className={`fixed ${pos.panel} z-[9999] w-[340px] max-h-[70vh] rounded-2xl border border-border bg-background shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 flex flex-col`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
            <h2 className="text-base font-bold text-foreground">Accessibility</h2>
            {hasChanges && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Reset accessibility settings"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            <SectionLabel>Font Size</SectionLabel>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <OptionButton
                icon={<ZoomIn className="h-5 w-5" />}
                label="Increase Font"
                active={state.fontSize > 0}
                onClick={() => update({ fontSize: Math.min(state.fontSize + 1, 2) })}
              />
              <OptionButton
                icon={<ZoomOut className="h-5 w-5" />}
                label="Decrease Font"
                active={false}
                onClick={() => update({ fontSize: Math.max(state.fontSize - 1, 0) })}
                disabled={state.fontSize === 0}
              />
            </div>

            <SectionLabel>Color & Display</SectionLabel>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <OptionButton icon={<Contrast className="h-5 w-5" />} label="High Contrast" active={state.highContrast} onClick={() => update({ highContrast: !state.highContrast })} />
              <OptionButton icon={<SunMoon className="h-5 w-5" />} label="Monochrome" active={state.monochrome} onClick={() => update({ monochrome: !state.monochrome })} />
              <OptionButton icon={<Palette className="h-5 w-5" />} label="Sepia" active={state.sepia} onClick={() => update({ sepia: !state.sepia })} />
              <OptionButton icon={<span className="text-xs font-bold">B&Y</span>} label="Black & Yellow" active={state.blackYellow} onClick={() => update({ blackYellow: !state.blackYellow })} />
              <OptionButton icon={<EyeOff className="h-5 w-5" />} label="Invert" active={state.invert} onClick={() => update({ invert: !state.invert })} />
              <OptionButton icon={<Eye className="h-5 w-5" />} label="Stop Blinks" active={state.stopBlinks} onClick={() => update({ stopBlinks: !state.stopBlinks })} />
            </div>

            <SectionLabel>Navigation & Reading</SectionLabel>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <OptionButton icon={<Link2 className="h-5 w-5" />} label="Highlight Links" active={state.highlightLinks} onClick={() => update({ highlightLinks: !state.highlightLinks })} />
              <OptionButton icon={<Heading className="h-5 w-5" />} label="Highlight Titles" active={state.highlightTitles} onClick={() => update({ highlightTitles: !state.highlightTitles })} />
              <OptionButton icon={<Type className="h-5 w-5" />} label="Readable Font" active={state.readableFont} onClick={() => update({ readableFont: !state.readableFont })} />
              <OptionButton icon={<Keyboard className="h-5 w-5" />} label="Keyboard Nav" active={state.keyboardNav} onClick={() => update({ keyboardNav: !state.keyboardNav })} />
              <OptionButton icon={<MousePointer2 className="h-5 w-5" />} label="Large Cursor" active={state.bigCursor} onClick={() => update({ bigCursor: !state.bigCursor })} />
              <OptionButton icon={<MousePointer2 className="h-5 w-5 rotate-180" />} label="Black Cursor" active={state.blackCursor} onClick={() => update({ blackCursor: !state.blackCursor })} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </p>
  );
}

function OptionButton({
  icon, label, active, onClick, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[0.625rem] font-medium transition-colors
        ${active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:bg-muted"
        }
        disabled:opacity-40 disabled:cursor-not-allowed`}
      aria-pressed={active}
      aria-label={label}
    >
      {icon}
      {label}
    </button>
  );
}
