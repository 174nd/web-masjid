"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/layout/container";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { getPublicMonthlyFinanceLast6 } from "@/features/public/api/public-finance.api";

type InfakPoint = {
  label: string;
  income: number;
  expense: number;
};

type InfakCardProps = {
  qrImageSrc?: string;
  title?: string;
  subtitle?: string;
  data?: InfakPoint[];
};

function formatMonthLabel(year: number, month: number) {
  try {
    const date = new Date(year, Math.max(0, month - 1), 1);
    return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date);
  } catch {
    return `M${month}`;
  }
}

function Chart({ data, isLoading, error }: { data: InfakPoint[]; isLoading: boolean; error: string | null }) {
  const chartData = data.map((d) => ({
    month: d.label,
    income: d.income,
    expense: d.expense,
  }));

  const chartConfig: ChartConfig = {
    income: { label: "Pemasukan", color: "hsl(217 91% 60%)" }, // blue
    expense: { label: "Pengeluaran", color: "hsl(0 84% 60%)" }, // red
  };

  return (
    <div className="mt-6 rounded-xl border bg-background/60 p-4 backdrop-blur transition-colors duration-200 hover:border-primary">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Grafik Pemasukan & Pengeluaran</p>
          <p className="text-xs text-muted-foreground">Ringkasan per bulan</p>
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      {/* IMPORTANT: height must be explicit, or ResponsiveContainer gets -1 */}
      <div className="mt-4 h-[260px] w-full min-w-0">
        {isLoading ? (
          <div className="flex h-full items-end gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`sk_${i}`} className="h-full w-full max-w-[48px] rounded-md bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Belum ada data.</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

              <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}

export function InfakCard({
  qrImageSrc = "/images/qr.jpeg",
  title = "Infak & Pengeluaran Masjid",
  subtitle = "Scan QR untuk infak, dan lihat ringkasan pemasukan/pengeluaran terbaru.",
  data,
}: InfakCardProps) {
  const [hovered, setHovered] = React.useState(false);
  const [chartData, setChartData] = React.useState<InfakPoint[]>(() => data ?? []);
  const [isLoading, setIsLoading] = React.useState(data === undefined);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (data !== undefined) {
      setChartData(data);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await getPublicMonthlyFinanceLast6(controller.signal);
        if (!active) return;
        const mapped = resp.data
          .slice()
          .sort((a, b) => (a.year - b.year) || (a.month - b.month))
          .map((item) => ({
            label: formatMonthLabel(item.year, item.month),
            income: item.totalIn,
            expense: item.totalOut,
          }));
        setChartData(mapped);
      } catch (err) {
        if (!active) return;
        setError((err as Error)?.message ?? "Gagal memuat data infak.");
        setChartData([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [data]);

  return (
    <section id="infak" aria-label="Infak" className="py-14 md:py-10 scroll-mt-24">
      <Container>
        {/* Reveal wrapper for the whole section */}
        <RevealGroup>
          <RevealItem>
            <div className="rounded-2xl border bg-primary/60 p-6 backdrop-blur transition-colors duration-200 hover:border-primary md:p-10">
              <div className="grid items-start gap-10 md:grid-cols-2">
                {/* LEFT: QR + moving boxes behind */}
                <RevealItem className="order-2 md:order-1">
                  <motion.div
                    className="relative  mx-auto w-full max-w-sm"
                    onHoverStart={() => setHovered(true)}
                    onHoverEnd={() => setHovered(false)}
                  >
                    {/* Boxes behind (only these move on hover) */}
                    <motion.div
                      className="absolute -inset-6 -z-10"
                      aria-hidden="true"
                      animate={hovered ? { x: 6, y: -4, rotate: 2, scale: 1.02 } : { x: 0, y: 0, rotate: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <svg viewBox="0 0 520 520" className="h-full w-full">
                        <motion.rect
                          x="56"
                          y="92"
                          width="210"
                          height="210"
                          rx="18"
                          fill="hsl(var(--primary))"
                          opacity="0.16"
                          animate={hovered ? { x: 64, y: 86 } : { x: 56, y: 92 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                        <motion.rect
                          x="220"
                          y="170"
                          width="220"
                          height="220"
                          rx="18"
                          fill="hsl(var(--primary))"
                          opacity="0.1"
                          animate={hovered ? { x: 210, y: 182 } : { x: 220, y: 170 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                        <motion.rect
                          x="90"
                          y="260"
                          width="260"
                          height="160"
                          rx="18"
                          fill="transparent"
                          stroke="hsl(var(--primary))"
                          strokeOpacity="0.28"
                          strokeWidth="6"
                          animate={hovered ? { x: 98, y: 252 } : { x: 90, y: 260 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        />
                      </svg>
                    </motion.div>

                    {/* QR image ONLY */}
                    <div className="relative overflow-hidden rounded-2xl border bg-background transition-colors duration-200 hover:border-primary">
                      {/* Aspect ratio 435 / 512 */}
                      <div className="relative w-full aspect-435/512">
                        <Image src={qrImageSrc} alt="QR Infak Masjid" fill className="object-contain p-6" sizes="(max-width: 768px) 85vw, 420px" />
                      </div>
                    </div>
                  </motion.div>
                </RevealItem>

                {/* RIGHT: Title + chart */}
                <RevealItem className="order-1 md:order-2">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
                    <p className="mt-3 text-white/80 md:text-lg">{subtitle}</p>

                    <Chart data={chartData} isLoading={isLoading} error={error} />
                  </div>
                </RevealItem>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
