import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeCalendarProps {
  from: Date | undefined;
  to: Date | undefined;
  onFromChange: (date: Date | undefined) => void;
  onToChange: (date: Date | undefined) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, from: Date | undefined, to: Date | undefined) {
  if (!from || !to) return false;
  const d = date.getTime();
  return d > from.getTime() && d < to.getTime();
}

function MonthGrid({
  year,
  month,
  selected,
  onSelect,
  rangeFrom,
  rangeTo,
  disabled,
}: {
  year: number;
  month: number;
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  rangeFrom: Date | undefined;
  rangeTo: Date | undefined;
  disabled?: (date: Date) => boolean;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="h-9 w-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-9 w-9" />;
          }
          const date = new Date(year, month, day);
          const isSelected = selected && isSameDay(date, selected);
          const inRange = isInRange(date, rangeFrom, rangeTo);
          const isStart = rangeFrom && isSameDay(date, rangeFrom);
          const isEnd = rangeTo && isSameDay(date, rangeTo);
          const isDisabled = disabled ? disabled(date) : false;
          const isToday = isSameDay(date, today) && !isSelected;

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className={cn(
                "h-9 w-9 flex items-center justify-center text-sm rounded-md transition-colors relative",
                isDisabled && "text-muted-foreground/40 cursor-not-allowed",
                !isDisabled && !isSelected && "hover:bg-muted cursor-pointer",
                isSelected && "bg-primary text-primary-foreground font-semibold",
                inRange && !isSelected && "bg-primary/30",
                isStart && rangeTo && "rounded-r-none",
                isEnd && rangeFrom && "rounded-l-none",
                inRange && "rounded-none",
                isToday && !inRange && "ring-1 ring-primary/50",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthYearSelector({
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}) {
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  return (
    <div className="flex items-center gap-2 mb-3">
      {/* Month selector */}
      <div className="relative flex-1">
        <button
          onClick={() => { setShowMonthDropdown((v) => !v); setShowYearDropdown(false); }}
          className="flex items-center gap-1.5 w-full border border-border rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          {MONTHS[month]}
        </button>
        {showMonthDropdown && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border rounded-md shadow-lg w-full max-h-48 overflow-y-auto">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => { onMonthChange(i); setShowMonthDropdown(false); }}
                className={cn(
                  "block w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors",
                  i === month ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Year selector */}
      <div className="relative">
        <button
          onClick={() => { setShowYearDropdown((v) => !v); setShowMonthDropdown(false); }}
          className="flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          {year}
        </button>
        {showYearDropdown && (
          <div className="absolute top-full right-0 mt-1 z-50 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[80px]">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => { onYearChange(y); setShowYearDropdown(false); }}
                className={cn(
                  "block w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors",
                  y === year ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DateRangeCalendar({ from, to, onFromChange, onToChange }: DateRangeCalendarProps) {
  const now = new Date();
  const [fromMonth, setFromMonth] = useState(from ? from.getMonth() : now.getMonth() === 0 ? 11 : now.getMonth() - 1);
  const [fromYear, setFromYear] = useState(from ? from.getFullYear() : now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [toMonth, setToMonth] = useState(to ? to.getMonth() : now.getMonth());
  const [toYear, setToYear] = useState(to ? to.getFullYear() : now.getFullYear());

  return (
    <div className="flex gap-8">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">From</p>
        <MonthYearSelector month={fromMonth} year={fromYear} onMonthChange={setFromMonth} onYearChange={setFromYear} />
        <MonthGrid
          year={fromYear}
          month={fromMonth}
          selected={from}
          onSelect={onFromChange}
          rangeFrom={from}
          rangeTo={to}
        />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">To</p>
        <MonthYearSelector month={toMonth} year={toYear} onMonthChange={setToMonth} onYearChange={setToYear} />
        <MonthGrid
          year={toYear}
          month={toMonth}
          selected={to}
          onSelect={onToChange}
          rangeFrom={from}
          rangeTo={to}
          disabled={(date) => from ? date < from : false}
        />
      </div>
    </div>
  );
}
