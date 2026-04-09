import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";
import { useShippingRates, type ShippingRate } from "@/hooks/useShippingRates";
import { Loader2, Truck } from "lucide-react";

interface ShippingRateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (rate: ShippingRate) => void;
  defaultCountry?: string;
  defaultPostalCode?: string;
  defaultCity?: string;
  defaultState?: string;
}

const ShippingRateModal = ({
  open,
  onOpenChange,
  onSelect,
  defaultCountry,
  defaultPostalCode,
  defaultCity,
  defaultState,
}: ShippingRateModalProps) => {
  const [country, setCountry] = useState(defaultCountry || "US");
  const [postalCode, setPostalCode] = useState(defaultPostalCode || "");
  const [city, setCity] = useState(defaultCity || "");
  const [state, setState] = useState(defaultState || "");
  const [weight, setWeight] = useState("1");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const { rates, loading, error, fetchRates, reset } = useShippingRates();

  useEffect(() => {
    if (open) {
      setCountry(defaultCountry || "US");
      setPostalCode(defaultPostalCode || "");
      setCity(defaultCity || "");
      setState(defaultState || "");
      setWeight("1");
      setSelectedIdx(null);
      reset();
    }
  }, [open, defaultCountry, defaultPostalCode, defaultCity, defaultState, reset]);

  const handleFetch = () => {
    if (!postalCode || !country) return;
    setSelectedIdx(null);
    fetchRates(
      { postalCode, country, city: city || undefined, state: state || undefined },
      [{ weight: parseFloat(weight) || 1 }]
    );
  };

  const handleApply = () => {
    if (selectedIdx !== null && rates[selectedIdx]) {
      onSelect(rates[selectedIdx]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-border pb-4">
          <DialogTitle>Calculate shipping</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Country
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Postal code
              </label>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 10001"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                City
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                State
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Weight (kg)
              </label>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleFetch}
            disabled={loading || !postalCode}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching rates…
              </>
            ) : (
              "Fetch rates"
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {rates.length > 0 && (
            <div className="border border-border rounded-lg divide-y divide-border max-h-[200px] overflow-y-auto">
              {rates.map((rate, i) => (
                <label
                  key={`${rate.carrier}-${rate.service}-${i}`}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedIdx === i ? "bg-muted" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping-rate"
                    checked={selectedIdx === i}
                    onChange={() => setSelectedIdx(i)}
                    className="accent-primary"
                  />
                  <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {rate.carrier} — {rate.service}
                    </p>
                    {rate.transitDays != null && (
                      <p className="text-xs text-muted-foreground">
                        {rate.transitDays} business day{rate.transitDays !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground shrink-0">
                    ${rate.price.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-border pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={selectedIdx === null}
            onClick={handleApply}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingRateModal;
