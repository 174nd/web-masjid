"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUiPreloader } from "@/stores/ui-preloader";

export default function PublicPreloader() {
  const [visible, setVisible] = React.useState(true);
  const setPreloaderDone = useUiPreloader((s) => s.setPreloaderDone);

  React.useEffect(() => {
    const onLoad = () => {
      // beri sedikit jeda jika kamu butuh (optional)
      setTimeout(() => setVisible(false), 250);
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        // gate dibuka setelah preloader benar-benar hilang
        setPreloaderDone(true);
      }}
    >
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
