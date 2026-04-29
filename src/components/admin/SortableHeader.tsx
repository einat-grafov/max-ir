import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";
export type SortState<K extends string> = { key: K; dir: SortDir };

interface Props<K extends string> {
  label: string;
  sortKey: K;
  state: SortState<K>;
  onChange: (next: SortState<K>) => void;
  className?: string;
}

export function SortableHeader<K extends string>({ label, sortKey, state, onChange, className }: Props<K>) {
  const active = state.key === sortKey;
  const Icon = !active ? ArrowUpDown : state.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onChange({ key: sortKey, dir: active && state.dir === "asc" ? "desc" : "asc" })}
      className={cn(
        "inline-flex items-center gap-1 hover:text-foreground transition-colors",
        active ? "text-foreground" : "text-muted-foreground",
        className
      )}
    >
      {label}
      <Icon className={cn("h-3.5 w-3.5", active ? "opacity-100" : "opacity-50")} />
    </button>
  );
}
