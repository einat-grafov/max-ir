import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CATEGORY_LABELS,
  COOKIE_INVENTORY,
} from "@/lib/cookie-inventory";

type Choices = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
};

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialChoices?: Choices;
  onSave: (choices: Choices) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

const DEFAULT_CHOICES: Choices = {
  necessary: true,
  functional: false,
  analytics: false,
  advertising: false,
};

const CATEGORY_ORDER: Array<keyof typeof CATEGORY_LABELS> = [
  "necessary",
  "functional",
  "analytics",
  "advertising",
];

export default function CookiePreferencesModal({
  open,
  onOpenChange,
  initialChoices,
  onSave,
  onAcceptAll,
  onRejectAll,
}: CookiePreferencesModalProps) {
  const [choices, setChoices] = useState<Choices>(
    initialChoices ?? DEFAULT_CHOICES,
  );

  useEffect(() => {
    if (open) {
      setChoices(initialChoices ?? DEFAULT_CHOICES);
    }
  }, [open, initialChoices]);

  const handleToggle = (
    category: "functional" | "analytics" | "advertising",
    value: boolean,
  ) => {
    setChoices((prev) => ({ ...prev, [category]: value }));
  };

  const handleSave = () => {
    onSave(choices);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    onAcceptAll();
    onOpenChange(false);
  };

  const handleRejectAll = () => {
    onRejectAll();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which categories of cookies you allow. Strictly Necessary
            cookies cannot be disabled because they are required for the site
            to function.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const meta = CATEGORY_LABELS[category];
            const cookies = COOKIE_INVENTORY.filter(
              (c) => c.category === category,
            );
            const switchId = `cookie-switch-${category}`;
            const isNecessary = category === "necessary";
            const checked = isNecessary ? true : choices[category];

            return (
              <div
                key={category}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor={switchId}
                      id={`${switchId}-label`}
                      className="block font-semibold text-foreground"
                    >
                      {meta.label}
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meta.description}
                    </p>
                  </div>
                  <Switch
                    id={switchId}
                    aria-labelledby={`${switchId}-label`}
                    checked={checked}
                    disabled={isNecessary}
                    onCheckedChange={
                      isNecessary
                        ? undefined
                        : (val) =>
                            handleToggle(
                              category as
                                | "functional"
                                | "analytics"
                                | "advertising",
                              val,
                            )
                    }
                  />
                </div>

                <div className="mt-3">
                  {cookies.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No cookies in this category are currently in use.
                    </p>
                  ) : (
                    <Accordion type="single" collapsible>
                      <AccordionItem
                        value={category}
                        className="border-b-0"
                      >
                        <AccordionTrigger className="py-2 text-sm">
                          Show cookies ({cookies.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-3">
                            {cookies.map((cookie) => (
                              <li
                                key={`${cookie.provider}-${cookie.name}`}
                                className="text-sm"
                              >
                                <div className="font-medium text-foreground">
                                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                    {cookie.name}
                                  </code>{" "}
                                  <span className="text-muted-foreground">
                                    · {cookie.provider}
                                  </span>
                                </div>
                                <div className="mt-1 text-muted-foreground">
                                  {cookie.purpose}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Duration: {cookie.duration} ·{" "}
                                  {cookie.domain}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="default"
            size="default"
            onClick={handleRejectAll}
            className="w-full sm:flex-1"
          >
            Reject All
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={handleSave}
            className="w-full sm:flex-1"
          >
            Save Preferences
          </Button>
          <Button
            variant="default"
            size="default"
            onClick={handleAcceptAll}
            className="w-full sm:flex-1"
          >
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
