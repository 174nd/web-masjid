"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputCurrencyProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "inputMode"> & {
  /**
   * value can be a number or formatted string, contoh: 1000000 / "1,000,000"
   */
  value: string | number;

  /**
   * Callback perubahan:
   * - formatted: "1,000,000"
   * - numeric: 1000000 atau null jika kosong
   */
  onValueChange: (next: { formatted: string; numeric: number | null }) => void;

  /**
   * label currency, default "Rp"
   */
  currencyLabel?: string;

  /**
   * separator ribuan, default ","
   */
  thousandSeparator?: string;

  /**
   * allow negative numbers, default false
   */
  allowNegative?: boolean;
};

function formatThousands(digits: string, sep: string) {
  if (!digits) return "";
  const s = digits.replace(/^0+(?=\d)/, ""); // trim leading zeros
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function formatDisplayValue(value: string | number, sep: string, allowNegative: boolean) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    const sign = value < 0 ? "-" : "";
    const digits = Math.abs(value).toString();
    return sign + formatThousands(digits, sep);
  }

  if (!value) return "";
  const { sign, digits } = sanitize(value, allowNegative);
  if (!digits) return sign < 0 ? "-" : "";
  const formatted = formatThousands(digits, sep);
  return sign < 0 ? `-${formatted}` : formatted;
}

function sanitize(input: string, allowNegative: boolean) {
  const hasMinus = allowNegative && input.trim().startsWith("-");
  const digits = input.replace(/[^\d]/g, "");
  return { sign: hasMinus ? -1 : 1, digits };
}

function toNumeric(digits: string, sign: number) {
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n)) return null;
  return n * sign;
}

export const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ value, onValueChange, className, currencyLabel = "Rp", thousandSeparator = ",", allowNegative = false, disabled, ...props }, ref) => {
    const displayValue = formatDisplayValue(value, thousandSeparator, allowNegative);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextRaw = e.target.value ?? "";
      const { sign, digits } = sanitize(nextRaw, allowNegative);

      const formattedDigits = formatThousands(digits, thousandSeparator);
      const formatted = sign < 0 ? `-${formattedDigits}` : formattedDigits;
      const numeric = toNumeric(digits, sign);

      onValueChange({ formatted, numeric });
    };

    return (
      <div className={cn("relative", className)}>
        {/* Rp di kiri */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencyLabel}</span>

        <Input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          inputMode="numeric"
          disabled={disabled}
          // padding kiri supaya tidak nabrak "Rp", angka rata kanan
          className={cn("pl-10 text-right", className)}
          {...props}
        />
      </div>
    );
  }
);

InputCurrency.displayName = "InputCurrency";
