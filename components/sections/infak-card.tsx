"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/layout/container";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";

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

const DEFAULT_DATA: InfakPoint[] = [
  { label: "Jul", income: 12500000, expense: 7200000 },
  { label: "Aug", income: 9800000, expense: 6400000 },
  { label: "Sep", income: 14200000, expense: 8100000 },
  { label: "Oct", income: 11600000, expense: 9000000 },
  { label: "Nov", income: 15100000, expense: 8700000 },
  { label: "Dec", income: 13300000, expense: 7600000 },
];

function formatIDR(n: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rp ${n.toLocaleString("id-ID")}`;
  }
}

function Chart({ data }: { data: InfakPoint[] }) {
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
    <div className="mt-6 rounded-xl border bg-background/60 p-4 backdrop-blur">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Grafik Pemasukan & Pengeluaran</p>
          <p className="text-xs text-muted-foreground">Ringkasan per bulan</p>
        </div>
      </div>

      <div className="mt-4 h-65">
        <ChartContainer config={chartConfig} className="h-full">
          <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />

            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

export function InfakCard({
  qrImageSrc = "/images/qr.jpeg",
  title = "Infak & Pengeluaran Masjid",
  subtitle = "Scan QR untuk infak, dan lihat ringkasan pemasukan/pengeluaran terbaru.",
  data = DEFAULT_DATA,
}: InfakCardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <section id="infak" aria-label="Infak" className="py-14 md:py-20">
      <Container>
        <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur md:p-10">
          <div className="grid items-start gap-10 md:grid-cols-2">
            {/* LEFT: QR + moving boxes behind */}
            <motion.div
              className="relative mx-auto w-full max-w-sm order-2 md:order-1"
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
                    opacity="0.10"
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

              {/* QR image ONLY (no text below) */}
              <div className="relative overflow-hidden rounded-2xl border bg-background">
                {/* Aspect ratio 435 / 512 */}
                <div className="relative w-full aspect-435/512">
                  <Image src={qrImageSrc} alt="QR Infak Masjid" fill className="object-contain p-6" sizes="(max-width: 768px) 85vw, 420px" />
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Title + chart */}
            <div className="md:order-2 order-1">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
              <p className="mt-3 text-muted-foreground md:text-lg">{subtitle}</p>

              <Chart data={data} />

              <div className="mt-4 text-xs text-muted-foreground">
                Catatan: Grafik bersifat ringkasan. Detail transaksi dapat ditampilkan di halaman laporan.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
