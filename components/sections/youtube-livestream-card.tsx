"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";

type YouTubeLiveStreamCardProps = {
  /**
   * Pilih salah satu:
   * - videoId: jika kamu punya ID live stream spesifik
   * - channelId: jika mau selalu ambil live stream aktif dari channel (lebih umum)
   */
  videoId?: string;
  channelId?: string;

  title?: string;
};

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function YouTubeLiveStreamCard({ videoId, channelId, title = "Live Streaming YouTube" }: YouTubeLiveStreamCardProps) {
  const playerElId = React.useId().replace(/:/g, "_");
  const playerRef = React.useRef<any>(null);

  const [ready, setReady] = React.useState(false);
  const [muted, setMuted] = React.useState(true);

  const source = React.useMemo(() => {
    if (videoId) return { kind: "video" as const, value: videoId };
    if (channelId) return { kind: "channel" as const, value: channelId };
    return null;
  }, [videoId, channelId]);

  React.useEffect(() => {
    if (!source) return;

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        // script sudah ada
        const existing = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (existing) return resolve();

        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        s.async = true;
        document.body.appendChild(s);
        resolve();
      });

    const init = async () => {
      await ensureScript();

      // tunggu YT ready
      await new Promise<void>((resolve) => {
        if (window.YT?.Player) return resolve();
        window.onYouTubeIframeAPIReady = () => resolve();
      });

      // destroy jika ada
      if (playerRef.current?.destroy) playerRef.current.destroy();

      const playerVars: Record<string, any> = {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        // Autoplay yang paling aman: mulai dalam keadaan muted
        mute: 1,
      };

      const videoOrChannel =
        source.kind === "video" ? { videoId: source.value } : { videoId: undefined, playerVars: { ...playerVars, channel: source.value, live: 1 } };

      playerRef.current = new window.YT.Player(playerElId, {
        width: "100%",
        height: "100%",
        ...(source.kind === "video" ? { videoId: source.value } : {}),
        playerVars:
          source.kind === "video"
            ? playerVars
            : {
                ...playerVars,
                // mode live stream by channel
                // YT API akan resolve live stream aktif pada channel tsb
                // (YouTube sendiri yang menentukan)
                // Catatan: kalau channel sedang tidak live, biasanya tampil “offline”
                // dan tetap valid.
                // @ts-ignore
                channel: source.value,
              },
        events: {
          onReady: () => {
            setReady(true);
            try {
              playerRef.current.playVideo();
              playerRef.current.mute();
              setMuted(true);
            } catch {
              // ignore
            }
          },
        },
      });
    };

    void init();

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {
        // ignore
      }
    };
  }, [playerElId, source]);

  const enableSound = () => {
    try {
      playerRef.current?.unMute?.();
      playerRef.current?.setVolume?.(100);
      playerRef.current?.playVideo?.();
      setMuted(false);
    } catch {
      // ignore
    }
  };

  if (!source) {
    return (
      <section className="py-14 md:py-20">
        <Container>
          <div className="rounded-2xl border p-6">
            <p className="text-sm text-muted-foreground">
              Isi <code>videoId</code> atau <code>channelId</code> terlebih dahulu.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="livestream" aria-label="Live streaming" className="py-14 md:py-20">
      <Container>
        <div className="rounded-2xl border bg-background/60 p-6 backdrop-blur md:p-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-primary">Live</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Video otomatis diputar. Untuk suara, browser biasanya membutuhkan interaksi (klik).
              </p>
            </div>
          </div>

          <div className="mt-6">
            {/* Card video */}
            <div className="relative overflow-hidden rounded-2xl border bg-black">
              {/* 16:9 responsive */}
              <div className="relative w-full aspect-video">
                <div id={playerElId} className="absolute inset-0" />
              </div>

              {/* Overlay tombol unmute (muncul bila muted) */}
              {ready && muted ? (
                <button
                  type="button"
                  onClick={enableSound}
                  className="absolute bottom-4 left-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Aktifkan suara
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
