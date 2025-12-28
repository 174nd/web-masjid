"use client";

import { AnimatePresence, motion } from "motion/react";
import { Card } from "@/components/ui/card";

export function AdminPreloader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="auth-loader"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="w-[320px] p-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Checking session</div>
                <div className="text-xs text-muted-foreground">Memverifikasi sesi Anda...</div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded bg-muted">
                  <motion.div
                    className="h-2 w-1/3 rounded bg-foreground/60"
                    initial={{ x: "-120%" }}
                    animate={{ x: "320%" }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ) : // <motion.div
      //   key="preloader-overlay"
      //   initial={{ opacity: 1 }}
      //   animate={{ opacity: 1 }}
      //   exit={{ opacity: 0 }}
      //   transition={{ duration: 0.4, ease: "easeOut" }}
      //   className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      // >
      //   {/* Konten loading sederhana */}
      //   <div className="flex flex-col items-center gap-3">
      //     {/* Lingkaran animasi */}
      //     <div className="flex items-center gap-2">
      //       <motion.span
      //         className="h-2 w-2 rounded-full bg-primary"
      //         animate={{ y: [0, -6, 0] }}
      //         transition={{
      //           repeat: Infinity,
      //           duration: 0.6,
      //           ease: "easeInOut",
      //         }}
      //       />
      //       <motion.span
      //         className="h-2 w-2 rounded-full bg-primary/80"
      //         animate={{ y: [0, -6, 0] }}
      //         transition={{
      //           repeat: Infinity,
      //           duration: 0.6,
      //           ease: "easeInOut",
      //           delay: 0.15,
      //         }}
      //       />
      //       <motion.span
      //         className="h-2 w-2 rounded-full bg-primary/60"
      //         animate={{ y: [0, -6, 0] }}
      //         transition={{
      //           repeat: Infinity,
      //           duration: 0.6,
      //           ease: "easeInOut",
      //           delay: 0.3,
      //         }}
      //       />
      //     </div>

      //     <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">Loading...</p>
      //   </div>
      // </motion.div>
      null}
    </AnimatePresence>
  );
}
