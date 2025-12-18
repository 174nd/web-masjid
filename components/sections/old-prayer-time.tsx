"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";

type Timings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type ApiResponse = {
  city: string;
  country: string;
  date: string | null;
  timezone: string;
  timings: Timings;
};

type Row = { key: keyof Timings; label: string; time: string };

function parseHHMMToSeconds(hhmm: string) {
  const m = hhmm.match(/(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  return h * 3600 + mm * 60;
}

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function getTodayRows(t: Timings): Row[] {
  return [
    { key: "Fajr", label: "Subuh", time: t.Fajr },
    { key: "Dhuhr", label: "Dzuhur", time: t.Dhuhr },
    { key: "Asr", label: "Ashar", time: t.Asr },
    { key: "Maghrib", label: "Maghrib", time: t.Maghrib },
    { key: "Isha", label: "Isya", time: t.Isha },
  ];
}

function getStatus(rows: Row[], nowSeconds: number) {
  const schedule = rows.map((r) => ({ ...r, at: parseHHMMToSeconds(r.time) })).sort((a, b) => a.at - b.at);

  const next = schedule.find((s) => nowSeconds < s.at) ?? schedule[0];
  const nextIndex = schedule.findIndex((s) => s.key === next.key);

  const prevIndex = nextIndex - 1;
  const current = prevIndex >= 0 ? schedule[prevIndex] : null;

  const countdown = nowSeconds < next.at ? next.at - nowSeconds : 24 * 3600 - nowSeconds + next.at;

  return { next, current, countdown };
}

export function OldPrayerTimesBatam() {
  const [data, setData] = React.useState<ApiResponse | null>(null);

  // penting: jangan render jam/countdown saat SSR
  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setNow(new Date());
  }, []);

  React.useEffect(() => {
    fetch("/api/prayer-times?city=Batam&country=Indonesia")
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch(() => setData(null));
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [mounted]);

  const rows = data ? getTodayRows(data.timings) : [];
  const nowSeconds = mounted && now ? now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() : 0;

  const status = data && mounted && now ? getStatus(rows, nowSeconds) : null;
  const nextKey = status?.next.key;
  const currentKey = status?.current?.key ?? null;

  return (
    <section id="prayer-times" aria-label="Jadwal sholat Batam" className="py-14 md:py-20">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-primary">Jadwal Sholat</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Wilayah Batam</h2>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <div>{data?.date ? `Tanggal: ${data.date}` : "Memuat tanggal..."}</div>

            {/* Render jam hanya setelah mount untuk menghindari hydration mismatch */}
            <div suppressHydrationWarning>Waktu lokal: {mounted && now ? now.toLocaleTimeString("id-ID") : "--:--:--"}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-12">
          {/* LEFT: jadwal hari ini */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur md:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Jadwal Hari Ini</p>
                <p className="text-xs text-muted-foreground">{data?.timezone ?? "Asia/Jakarta"}</p>
              </div>

              <div className="mt-4 divide-y">
                {rows.length === 0 ? (
                  <div className="py-6 text-sm text-muted-foreground">Memuat jadwal...</div>
                ) : (
                  rows.map((r) => {
                    const isNext = r.key === nextKey;
                    const isCurrent = r.key === currentKey;
                    return (
                      <div
                        key={r.key}
                        className={["flex items-center justify-between py-3", isNext ? "bg-primary/10 px-3 rounded-md" : ""].join(" ")}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{r.label}</span>

                          {isCurrent ? <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">sedang berlangsung</span> : null}

                          {isNext ? <span className="rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">berikutnya</span> : null}
                        </div>

                        <span className="text-sm font-semibold tabular-nums">{r.time}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: card besar status sekarang */}
          <div className="md:col-span-5">
            <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur">
              <p className="text-xs text-muted-foreground">Status</p>

              <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight">
                  {status?.next ? `Menuju ${rows.find((r) => r.key === status.next.key)?.label ?? status.next.key}` : "Memuat..."}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Waktu: <span className="font-medium">{status?.next?.time ?? "-"}</span>
                </p>
              </div>

              <div className="mt-6 rounded-xl border bg-background p-4">
                <p className="text-xs text-muted-foreground">Countdown</p>

                {/* countdown juga jangan render real sebelum mount */}
                <p className="mt-1 text-3xl font-bold tabular-nums" suppressHydrationWarning>
                  {status ? formatDuration(status.countdown) : "--:--:--"}
                </p>
              </div>

              <div className="mt-6 text-xs text-muted-foreground">
                {status?.current ? (
                  <>
                    Periode saat ini: <span className="font-medium">{rows.find((r) => r.key === status.current!.key)?.label}</span>
                  </>
                ) : (
                  <>
                    Periode saat ini: <span className="font-medium">Menjelang Subuh</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
