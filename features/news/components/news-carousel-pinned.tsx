"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { NewsItem } from "@/data/mock-news";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NewsCarouselPinned({ items, intervalMs = 6000 }: { items: NewsItem[]; intervalMs?: number }) {
  const pinned = React.useMemo(() => items.filter((i) => i.pinned), [items]);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (pinned.length <= 1) return;
    const id = window.setInterval(() => setActive((p) => (p + 1) % pinned.length), intervalMs);
    return () => window.clearInterval(id);
  }, [pinned.length, intervalMs]);

  const current = pinned[active];

  const navBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-sm border bg-background/70 backdrop-blur " +
    "transition-colors duration-200 hover:border-primary hover:bg-background shadow-sm " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  // Title: primary + white spread glow so it stays readable on photos
  const titleOverlayClass = "text-primary " + "[text-shadow:0_0_18px_rgba(255,255,255,0.75),0_0_6px_rgba(255,255,255,0.55),0_2px_0_rgba(0,0,0,0.25)]";

  return (
    <RevealGroup>
      <RevealItem>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-primary">Pinned</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary md:text-4xl">Berita Utama</h2>
          </div>

          <Link
            href="/#news"
            className={
              "relative pb-1 text-sm text-muted-foreground hover:text-foreground " +
              "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-primary " +
              "after:origin-right after:scale-x-0 after:transition-transform after:duration-300 " +
              "hover:after:origin-left hover:after:scale-x-100"
            }
          >
            Kembali ke Beranda
          </Link>
        </div>
      </RevealItem>

      <RevealItem>
        {/* group is on the CARD so buttons appear only when hovering the card */}
        <div className="group mt-6 overflow-hidden rounded-3xl border bg-background transition-colors duration-200 hover:border-primary">
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current?.id ?? "empty"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {current ? (
                  <Link href={current.href} className="block">
                    <div className="relative h-[320px] w-full md:h-[420px]">
                      <Image
                        src={current.imageUrl}
                        alt={current.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1024px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {current.category ? (
                          <span className="rounded-md border bg-background/60 px-2 py-0.5 backdrop-blur">{current.category}</span>
                        ) : null}
                        <span className="rounded-md border bg-background/60 px-2 py-0.5 backdrop-blur">{formatDate(current.date)}</span>
                      </div>

                      <h3 className={`mt-3 max-w-3xl text-2xl font-bold tracking-tight md:text-3xl ${titleOverlayClass}`}>{current.title}</h3>

                      <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">{current.excerpt}</p>
                    </div>
                  </Link>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {/* Controls (INSIDE card), appear ONLY on hover */}
            {pinned.length > 1 ? (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {/* <motion.button
                    type="button"
                    aria-label="Previous"
                    onClick={() => setActive((p) => (p - 1 + pinned.length) % pinned.length)}
                    className={navBtn + " pointer-events-auto opacity-0 group-hover:opacity-100"}
                    initial={{ x: -6, opacity: 0, scale: 0.98 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 34 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button> */}

                  <motion.button
                    type="button"
                    aria-label="Previous"
                    onClick={() => setActive((p) => (p - 1 + pinned.length) % pinned.length)}
                    className={navBtn + " pointer-events-auto opacity-0 group-hover:opacity-100 " + "transition-opacity duration-200"}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                </div>

                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {/* <motion.button
                    type="button"
                    aria-label="Next"
                    onClick={() => setActive((p) => (p + 1) % pinned.length)}
                    className={navBtn + " pointer-events-auto opacity-0 group-hover:opacity-100"}
                    initial={{ x: 6, opacity: 0, scale: 0.98 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 34 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button> */}

                  <motion.button
                    type="button"
                    aria-label="Next"
                    onClick={() => setActive((p) => (p + 1) % pinned.length)}
                    className={navBtn + " pointer-events-auto opacity-0 group-hover:opacity-100 " + "transition-opacity duration-200"}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            ) : null}

            {/* Dots (animated) */}
            {pinned.length > 1 ? (
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
                {pinned.map((_, i) => {
                  const isActive = i === active;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      layout
                      transition={{ type: "spring", stiffness: 520, damping: 32 }}
                      className={
                        "h-2.5 rounded-full border bg-background/60 transition-colors duration-200 " +
                        (isActive ? "border-primary bg-primary" : "border-muted-foreground/40 hover:border-primary")
                      }
                      style={{ width: isActive ? 22 : 10 }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </RevealItem>
    </RevealGroup>
  );
}
