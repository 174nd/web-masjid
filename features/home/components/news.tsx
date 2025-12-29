"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
  getPublicNewsList,
  getPublicPinnedNews,
  isRemotePublicUrl,
  mapPublicNewsItemToCard,
  type PublicNewsCardItem,
} from "@/features/public/api/public-news.api";

export type NewsItem = PublicNewsCardItem;

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

export function NewsRotating({ items, intervalMs = 6000, maxList = 4, title = "Updates & Articles", subtitle = "News" }: NewsRotatingProps) {
  const [newsItems, setNewsItems] = React.useState<NewsItem[]>(() => items ?? []);
  const [isLoading, setIsLoading] = React.useState(items === undefined);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (items !== undefined) {
      setNewsItems(items);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [pinnedResult, listResult] = await Promise.allSettled([
          getPublicPinnedNews({ signal: controller.signal }),
          getPublicNewsList({ limit: 6, page: 1, signal: controller.signal }),
        ]);
        if (!active) return;
        const pinnedItems =
          pinnedResult.status === "fulfilled"
            ? pinnedResult.value.data.map(mapPublicNewsItemToCard)
            : [];
        const listItems =
          listResult.status === "fulfilled"
            ? listResult.value.data.map(mapPublicNewsItemToCard)
            : [];

        const pinnedIds = new Set(pinnedItems.map((item) => item.id));
        const merged = [...pinnedItems, ...listItems.filter((item) => !pinnedIds.has(item.id))];

        const pinnedErr = pinnedResult.status === "rejected" ? (pinnedResult.reason as Error)?.message : null;
        const listErr = listResult.status === "rejected" ? (listResult.reason as Error)?.message : null;
        if (pinnedErr || listErr) {
          setError(pinnedErr || listErr || "Gagal memuat berita.");
        }

        setNewsItems(merged);
      } catch (err) {
        if (!active) return;
        setError((err as Error)?.message ?? "Gagal memuat berita.");
        setNewsItems([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [items]);
  /**
   * order[0] = featured kiri
   * order[1..] = pool list kanan
   */
  const [order, setOrder] = React.useState<NewsItem[]>(() => newsItems);
  React.useEffect(() => {
    setOrder(newsItems);
  }, [newsItems]);

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

  const hasItems = order.length > 0;
  const featured = order[0];
  const list = order.slice(1, 1 + maxList);

  // Spring untuk reorder list kanan
  const spring = { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.9 };

  // underline anim like navbar (right -> left)
  const seeAllClass =
    "relative pb-1 text-sm text-muted-foreground hover:text-foreground " +
    "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary " +
    "after:origin-right after:scale-x-0 after:transition-transform after:duration-300 " +
    "hover:after:origin-left hover:after:scale-x-100";

  return (
    <section id="news" aria-label="News" className="py-14 md:py-10 scroll-mt-24">
      <Container>
        <RevealGroup>
          {/* Header row reveal */}
          <RevealItem>
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="text-primary">Berita</span> & Artikel
                </h2>
              </div>

              <Link href="/news" className={seeAllClass}>
                Lihat Semua
              </Link>
            </div>
          </RevealItem>

          {/* LOCK tinggi agar section bawah tidak bergerak */}
          <RevealItem>
            <div ref={lockRef} className="mt-8" style={locked ? { height: locked, overflow: "hidden" } : { minHeight: 520 }}>
              {error ? <div className="mb-4 text-xs text-destructive">{error}</div> : null}

              {isLoading && !hasItems ? (
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="md:col-span-7">
                    <div className="h-90 rounded-2xl border bg-muted/50 animate-pulse" />
                  </div>
                  <div className="md:col-span-5 space-y-3">
                    {Array.from({ length: Math.max(3, maxList) }).map((_, i) => (
                      <div key={`sk_${i}`} className="h-20 rounded-xl border bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : !hasItems ? (
                <div className="rounded-xl border bg-background p-6 text-sm text-muted-foreground">Belum ada berita untuk ditampilkan.</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-12">
                  {/* LEFT: Featured (fade-only) */}
                  <div className="md:col-span-7">
                    {featured ? (
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.article
                          key={featured.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="relative overflow-hidden rounded-2xl border bg-background transition-colors duration-200 hover:border-primary"
                        >
                          <Link href={featured.href} className="block">
                            <div className="relative aspect-16/10 w-full">
                              {featured.imageUrl ? (
                                <Image
                                  src={featured.imageUrl}
                                  alt={featured.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 640px"
                                  priority
                                  unoptimized={isRemotePublicUrl(featured.imageUrl)}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                                  Tanpa gambar
                                </div>
                              )}
                              <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/10 to-transparent" />
                            </div>

                            <div className="p-6">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {featured.category ? <span className="rounded-md border px-2 py-0.5">{featured.category}</span> : null}
                                <span>{formatDate(featured.date)}</span>
                              </div>

                              <h3 className="mt-3 line-clamp-2 text-xl font-semibold tracking-tight md:text-2xl">{featured.title}</h3>
                              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground md:text-base">{featured.excerpt}</p>
                            </div>
                          </Link>
                        </motion.article>
                      </AnimatePresence>
                    ) : null}
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
                            className="overflow-hidden rounded-xl border bg-background transition-colors duration-200 hover:border-primary"
                          >
                            <Link href={item.href} className="flex gap-3 p-3">
                              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                    unoptimized={isRemotePublicUrl(item.imageUrl)}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">Tanpa gambar</div>
                                )}
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
                  </div>
                </div>
              )}
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
