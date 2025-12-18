"use client";

import * as React from "react";

type YouTubeLiveStreamEmbedProps = {
  videoId?: string;
  channelId?: string;
  className?: string;
  title?: string;
};

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function YouTubeLiveStreamEmbed({ videoId, channelId, className, title = "Live Streaming YouTube" }: YouTubeLiveStreamEmbedProps) {
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

      await new Promise<void>((resolve) => {
        if (window.YT?.Player) return resolve();
        window.onYouTubeIframeAPIReady = () => resolve();
      });

      try {
        playerRef.current?.destroy?.();
      } catch {}

      const playerVars: Record<string, any> = {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        mute: 1, // start muted for reliable autoplay
      };

      playerRef.current = new window.YT.Player(playerElId, {
        width: "100%",
        height: "100%",
        ...(source.kind === "video" ? { videoId: source.value } : {}),
        playerVars:
          source.kind === "video"
            ? playerVars
            : {
                ...playerVars,
                channel: source.value,
              },
        events: {
          onReady: () => {
            setReady(true);
            try {
              playerRef.current.playVideo();
              playerRef.current.mute();
              setMuted(true);
            } catch {}
          },
        },
      });
    };

    void init();

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {}
    };
  }, [playerElId, source]);

  const enableSound = () => {
    try {
      playerRef.current?.unMute?.();
      playerRef.current?.setVolume?.(100);
      playerRef.current?.playVideo?.();
      setMuted(false);
    } catch {}
  };

  if (!source) return null;
  return (
    <div className={className}>
      <div data-yt-root className="yt-embed relative w-full overflow-hidden rounded-2xl bg-black aspect-video">
        <button
          type="button"
          onClick={enableSound}
          className={[
            "absolute right-3 top-3 z-10 rounded-md bg-background/80 px-3 py-2 text-xs font-medium backdrop-blur border hover:bg-background transition-opacity",
            ready && muted ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          aria-hidden={!(ready && muted)}
          tabIndex={ready && muted ? 0 : -1}
        >
          Aktifkan suara
        </button>

        {/* target untuk YouTube Player */}
        <div id={playerElId} className="absolute inset-0" aria-label={title} />
      </div>
    </div>
  );
}
