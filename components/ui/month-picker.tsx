"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function toMonthKey(year: number, monthIndex0: number) {
  const mm = String(monthIndex0 + 1).padStart(2, "0");
  return `${year}-${mm}`; // YYYY-MM
}

function parseMonthKey(value: string) {
  // value: YYYY-MM
  const [y, m] = value.split("-").map((x) => Number(x));
  if (!y || !m) return { year: new Date().getFullYear(), monthIndex0: new Date().getMonth() };
  return { year: y, monthIndex0: m - 1 };
}

function formatMonthLabel(value: string) {
  const { year, monthIndex0 } = parseMonthKey(value);
  const d = new Date(year, monthIndex0, 1);
  return d.toLocaleString("id-ID", { month: "long", year: "numeric" }); // contoh: "Desember 2025"
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function MonthPicker({
  value, // YYYY-MM
  onChange,
  placeholder = "Pilih bulan",
  disabled,
  className,
  minYear = 2020,
  maxYear = new Date().getFullYear() + 2,
}: {
  value: string;
  onChange: (month: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
}) {
  const current = React.useMemo(() => (value ? parseMonthKey(value) : null), [value]);

  const [open, setOpen] = React.useState(false);

  const [viewYear, setViewYear] = React.useState(() => {
    return current?.year ?? new Date().getFullYear();
  });

  React.useEffect(() => {
    if (!open) return;
    // ketika dibuka, sync ke year dari value sekarang
    if (current?.year) setViewYear(current.year);
  }, [open, current?.year]);

  const canPrev = viewYear > minYear;
  const canNext = viewYear < maxYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className={cn("w-47.5 justify-start text-left font-normal", className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatMonthLabel(value) : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-70 p-3" align="start">
        {/* Header year */}
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setViewYear((y) => Math.max(minYear, y - 1))}
            disabled={!canPrev}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium">{viewYear}</div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setViewYear((y) => Math.min(maxYear, y + 1))}
            disabled={!canNext}
            aria-label="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Months grid */}
        <div className="grid grid-cols-3 gap-2">
          {MONTHS_ID.map((mLabel, idx) => {
            const monthKey = toMonthKey(viewYear, idx);
            const isSelected = value === monthKey;

            return (
              <Button
                key={monthKey}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={cn("h-9")}
                onClick={() => {
                  onChange(monthKey);
                  setOpen(false);
                }}
              >
                {mLabel}
              </Button>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">Pilih bulan untuk menampilkan ringkasan & transaksi pada bulan tersebut.</div>
      </PopoverContent>
    </Popover>
  );
}
