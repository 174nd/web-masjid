"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { YouTubeLiveStreamEmbed } from "@/components/media/youtube-livestream-embed";
import { Badge } from "../../../components/ui/badge";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

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

type Row = {
  key: keyof Timings;
  label: string;
  time: string;
  at: number;
};

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

function buildRows(t: Timings): Row[] {
  const rows: Array<Omit<Row, "at">> = [
    { key: "Fajr", label: "Subuh", time: t.Fajr },
    { key: "Dhuhr", label: "Dzuhur", time: t.Dhuhr },
    { key: "Asr", label: "Ashar", time: t.Asr },
    { key: "Maghrib", label: "Maghrib", time: t.Maghrib },
    { key: "Isha", label: "Isya", time: t.Isha },
  ];

  return rows.map((r) => ({ ...r, at: parseHHMMToSeconds(r.time) })).sort((a, b) => a.at - b.at);
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function getCurrentIndex(schedule: Row[], nowSeconds: number) {
  let idx = -1;
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i].at <= nowSeconds) idx = i;
  }
  return idx === -1 ? schedule.length - 1 : idx;
}

type PrayerTimesBatamProps = {
  liveVideoId?: string;
  liveChannelId?: string;
};

export function PrayerTimesBatam({ liveVideoId, liveChannelId }: PrayerTimesBatamProps) {
  const [data, setData] = React.useState<ApiResponse | null>(null);

  // anti hydration mismatch
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

  const schedule = React.useMemo(() => {
    if (!data) return [];
    return buildRows(data.timings);
  }, [data]);

  const nowSeconds = mounted && now ? now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() : 0;

  const currentIndex = schedule.length && mounted && now ? getCurrentIndex(schedule, nowSeconds) : 0;
  const nextIndex = schedule.length ? mod(currentIndex + 1, schedule.length) : 0;

  const current = schedule[currentIndex];
  const next = schedule[nextIndex];

  const countdown = schedule.length && mounted && now ? (nowSeconds < next.at ? next.at - nowSeconds : 24 * 3600 - nowSeconds + next.at) : 0;

  const windowRows = schedule.length > 0 ? [-2, -1, 0, 1, 2].map((d) => schedule[mod(currentIndex + d, schedule.length)]) : [];

  return (
    <section id="prayer-times" aria-label="Jadwal sholat Batam" className="py-14 md:py-10 scroll-mt-24">
      <Container>
        <RevealGroup>
          {/* Header reveal */}
          <RevealItem>
            <div className="flex items-center justify-between gap-6">
              <div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="text-primary">Jadwal Sholat </span>
                  Wilayah Batam
                </h2>
              </div>

              <div className="hidden text-right text-xs text-muted-foreground md:inline">
                <div>{data?.date ? `Tanggal: ${data.date}` : "Memuat tanggal..."}</div>
                <div suppressHydrationWarning>Waktu lokal: {mounted && now ? now.toLocaleTimeString("id-ID") : "--:--:--"}</div>
              </div>
            </div>
          </RevealItem>

          {/* Cards reveal */}
          <RevealItem>
            <div className="mt-8 grid items-stretch gap-6 md:grid-cols-12">
              {/* LEFT: list */}
              <div className="order-2 md:order-1 md:col-span-5">
                <div className="flex h-full flex-col">
                  <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur transition-colors duration-200 hover:border-primary md:p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Jadwal (Sekitar Sekarang)</p>
                      <p className="text-xs text-muted-foreground">{data?.timezone ?? "Asia/Jakarta"}</p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {windowRows.length === 0 ? (
                        <div className="py-6 text-sm text-muted-foreground">Memuat jadwal...</div>
                      ) : (
                        windowRows.map((r, idx) => {
                          const isCurrent = current && r.key === current.key;

                          return (
                            <div
                              key={`${r.key}-${idx}`}
                              className={[
                                "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors duration-200",
                                "hover:border-primary",
                                isCurrent ? "bg-primary/10 border-primary/30" : "bg-background hover:bg-accent/40",
                              ].join(" ")}
                            >
                              <div className="flex items-center gap-3">
                                <span className={isCurrent ? "text-sm font-semibold" : "text-sm"}>{r.label}</span>
                                {isCurrent ? <Badge variant="default">Sekarang</Badge> : null}
                              </div>

                              <span
                                className={["text-sm font-semibold tabular-nums", isCurrent ? "text-foreground" : "text-muted-foreground"].join(" ")}
                              >
                                {r.time}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: current + next + countdown (mobile first) */}
              <div className="order-1 md:order-2 md:col-span-7">
                <div className="h-full rounded-2xl border bg-background/60 p-6 backdrop-blur transition-colors duration-200 hover:border-primary">
                  <p className="text-xs text-muted-foreground">Sedang berlangsung</p>

                  <div className="mt-2">
                    <p className="text-2xl font-bold tracking-tight">{current ? current.label : "Memuat..."}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Jam: <span className="font-medium tabular-nums">{current?.time ?? "-"}</span>
                    </p>
                  </div>

                  <div className="mt-6 rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary">
                    <p className="text-xs text-muted-foreground">Berikutnya</p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{next ? next.label : "-"}</p>
                        <p className="text-sm text-muted-foreground">
                          Jam: <span className="font-medium tabular-nums">{next?.time ?? "-"}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Countdown</p>
                        <p className="mt-1 text-2xl font-bold tabular-nums" suppressHydrationWarning>
                          {mounted && now && schedule.length ? formatDuration(countdown) : "--:--:--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">Countdown dihitung hingga waktu sholat berikutnya.</p>
                </div>
              </div>
            </div>
          </RevealItem>

          {/* Video reveal */}
          <RevealItem>
            <YouTubeLiveStreamEmbed className="mt-6 w-full" videoId={liveVideoId} channelId={liveChannelId} />
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
