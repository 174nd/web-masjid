"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/layout/container";

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string; // ISO string
  href: string;
  imageUrl: string;
  category?: string;
};

const MOCK_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Launching v1.0: Faster UI, Cleaner Architecture",
    excerpt: "Rilis pertama dengan fokus pada performa, SEO, dan sistem komponen yang konsisten.",
    date: "2025-12-01",
    href: "/news/launching-v1",
    imageUrl: "/news/news-1.jpg",
    category: "Release",
  },
  {
    id: "n2",
    title: "How We Structure Next.js App Router for Scale",
    excerpt: "Pola folder, boundary, dan konvensi yang memudahkan tim berkembang tanpa refactor besar.",
    date: "2025-11-20",
    href: "/news/nextjs-structure",
    imageUrl: "/news/news-2.jpg",
    category: "Engineering",
  },
  {
    id: "n3",
    title: "Design System with Tailwind v4 + shadcn/ui",
    excerpt: "Menggabungkan token CSS-first Tailwind v4 dengan komponen shadcn agar konsisten dan cepat.",
    date: "2025-11-08",
    href: "/news/design-system",
    imageUrl: "/news/news-3.jpg",
    category: "Design",
  },
  {
    id: "n4",
    title: "TanStack Query Patterns for Landing Pages",
    excerpt: "Cache strategy, prefetch, dan cara menghindari waterfall untuk pengalaman cepat.",
    date: "2025-10-29",
    href: "/news/tanstack-query-patterns",
    imageUrl: "/news/news-4.jpg",
    category: "Data",
  },
  {
    id: "n5",
    title: "Form UX: TanStack Form + Validation Strategy",
    excerpt: "Validasi yang tidak mengganggu user, tapi tetap ketat untuk data integrity.",
    date: "2025-10-12",
    href: "/news/tanstack-form-ux",
    imageUrl: "/news/news-5.jpg",
    category: "Product",
  },
];

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

/**
 * Lock tinggi container ke nilai maksimum yang pernah terukur,
 * supaya section setelahnya tidak terdorong saat rotasi.
 */
function useMaxLockedHeight(deps: React.DependencyList) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [locked, setLocked] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = el.getBoundingClientRect().height;
        setLocked((prev) => (prev == null ? h : Math.max(prev, h)));
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const onResize = () => {
      setLocked(null);
      measure();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, deps);

  return { ref, locked };
}

export type NewsRotatingProps = {
  items?: NewsItem[];
  intervalMs?: number;
  maxList?: number;
  title?: string;
  subtitle?: string;
};

export function NewsRotating({
  items = MOCK_NEWS,
  intervalMs = 6000,
  maxList = 4,
  title = "Updates & Articles",
  subtitle = "News",
}: NewsRotatingProps) {
  /**
   * order[0] = featured kiri
   * order[1..] = pool list kanan
   */
  const [order, setOrder] = React.useState<NewsItem[]>(() => items);

  // lock tinggi area news supaya tidak menggeser section setelahnya
  const { ref: lockRef, locked } = useMaxLockedHeight([order.length]);

  React.useEffect(() => {
    if (order.length < 2) return;

    const id = window.setInterval(() => {
      setOrder((prev) => {
        if (prev.length < 2) return prev;
        // promote list-top (prev[1]) -> featured, featured lama -> paling bawah
        return [prev[1], ...prev.slice(2), prev[0]];
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, order.length]);

  const featured = order[0];
  const list = order.slice(1, 1 + maxList);

  // Spring untuk reorder list kanan
  const spring = { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.9 };

  return (
    <section id="news" aria-label="News" className="py-14 md:py-10">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-primary">Berita</span> & Artikel
            </h2>
          </div>

          <Link href="/news" className="text-sm text-muted-foreground hover:text-foreground">
            Lihat Semua
          </Link>
        </div>

        {/* LOCK tinggi agar section bawah tidak bergerak */}
        <div ref={lockRef} className="mt-8" style={locked ? { height: locked, overflow: "hidden" } : { minHeight: 520 }}>
          <div className="grid gap-6 md:grid-cols-12">
            {/* LEFT: Featured (fade-only) */}
            <div className="md:col-span-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.article
                  key={featured.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative overflow-hidden rounded-2xl border bg-background"
                >
                  <Link href={featured.href} className="block">
                    <div className="relative aspect-16/10 w-full">
                      <Image
                        src={featured.imageUrl}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 640px"
                        priority
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/10 to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {featured.category ? <span className="rounded-md border px-2 py-0.5">{featured.category}</span> : null}
                        <span>{formatDate(featured.date)}</span>
                      </div>

                      {/* Jika kamu tidak punya line-clamp, ganti dengan max-h + overflow-hidden */}
                      <h3 className="mt-3 line-clamp-2 text-xl font-semibold tracking-tight md:text-2xl">{featured.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground md:text-base">{featured.excerpt}</p>
                    </div>
                  </Link>
                </motion.article>
              </AnimatePresence>
            </div>

            {/* RIGHT: List (reorder smooth) */}
            <div className="md:col-span-5">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {list.map((item) => (
                    <motion.article
                      key={item.id}
                      layout
                      transition={spring}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="overflow-hidden rounded-xl border bg-background"
                    >
                      <Link href={item.href} className="flex gap-3 p-3">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="80px" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {item.category ? <span>{item.category}</span> : null}
                            <span className="opacity-70">•</span>
                            <span>{formatDate(item.date)}</span>
                          </div>

                          <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h4>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.excerpt}</p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              {/* <p className="mt-4 text-xs text-muted-foreground">Auto-rotates every {Math.round(intervalMs / 1000)}s.</p> */}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
