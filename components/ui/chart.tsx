"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts";

type ChartConfigItem = {
  label?: string;
  color?: string;
};

export type ChartConfig = Record<string, ChartConfigItem>;

const ChartContext = React.createContext<ChartConfig | null>(null);

export function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within a ChartContainer");
  return ctx;
}

export function ChartContainer({ config, className, children }: { config: ChartConfig; className?: string; children: React.ReactNode }) {
  const styleVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [key, item] of Object.entries(config)) {
      if (item.color) vars[`--color-${key}`] = item.color;
    }
    return vars;
  }, [config]);

  return (
    <ChartContext.Provider value={config}>
      <div className={cn("w-full", className)} style={styleVars as React.CSSProperties}>
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/**
 * Type-safe forward props for Recharts Tooltip/Legend
 */
type RechartsTooltipProps = React.ComponentProps<typeof RechartsTooltip>;
type RechartsLegendProps = React.ComponentProps<typeof RechartsLegend>;

export function ChartTooltip(props: RechartsTooltipProps) {
  return <RechartsTooltip {...props} />;
}

export function ChartLegend(props: RechartsLegendProps) {
  return <RechartsLegend {...props} />;
}

/**
 * Minimal props shape for custom tooltip content (runtime fields from Recharts).
 * Ini menghindari mismatch versi typings Recharts.
 */
type ChartTooltipContentProps = {
  active?: boolean;
  label?: React.ReactNode;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    value?: number | string;
    color?: string;
  }>;
};

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  const config = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
      <div className="mb-2 font-medium">{label}</div>
      <div className="grid gap-1">
        {payload.map((p) => {
          const key = (p.dataKey ?? p.name ?? "value") as string;
          const item = config[key];
          const color = p.color || `var(--color-${key})`;

          return (
            <div key={key} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
                <span className="text-muted-foreground">{item?.label ?? key}</span>
              </div>
              <span className="font-medium tabular-nums">
                {typeof p.value === "number" ? new Intl.NumberFormat("id-ID").format(p.value) : String(p.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendContent({ payload }: { payload?: Array<{ value?: string; dataKey?: string; color?: string }> }) {
  const config = useChart();
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      {payload.map((p, idx) => {
        const key = (p.dataKey ?? p.value ?? String(idx)) as string;
        const item = config[key];
        const color = p.color || `var(--color-${key})`;

        return (
          <span key={key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
            <span>{item?.label ?? key}</span>
          </span>
        );
      })}
    </div>
  );
}
