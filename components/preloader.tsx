"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

type PreloaderProps = {
  /**
   * Durasi minimum preloader tampil (ms), supaya tidak "kedip" di koneksi cepat.
   */
  minimumMs?: number;
};

export default function Preloader({ minimumMs = 600 }: PreloaderProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const finish = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minimumMs - elapsed);

      window.setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, remaining);
    };

    // Jika document sudah complete saat hydration, langsung “finish”
    if (document.readyState === "complete") {
      finish();
      return () => {
        cancelled = true;
      };
    }

    // Jika belum, tunggu event window load
    window.addEventListener("load", finish, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", finish);
    };
  }, [minimumMs]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          {/* Konten loading sederhana */}
          <div className="flex flex-col items-center gap-3">
            {/* Lingkaran animasi */}
            <div className="flex items-center gap-2">
              <motion.span
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-primary/80"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  ease: "easeInOut",
                  delay: 0.15,
                }}
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-primary/60"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            </div>

            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Loading...</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
