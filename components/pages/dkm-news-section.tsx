"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { YayasanNews } from "@/data/mock-yayasan-news";

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

function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
      <div className="mt-4 h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-muted" />
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  const btn =
    "inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm " +
    "transition-colors duration-200 hover:border-primary hover:bg-accent disabled:opacity-50 disabled:hover:bg-background";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button className={btn} onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}>
          Prev
        </button>

        {/* simple number buttons */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            const active = p === page;
            return (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={
                  "h-9 w-9 rounded-md border text-sm transition-colors duration-200 hover:border-primary hover:bg-accent " +
                  (active ? "border-primary bg-primary/10" : "bg-background")
                }
                aria-current={active ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button className={btn} onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export function DkmNewsSection({
  items,
  pageSize = 6,
  title = "Berita Dkm",
  subtitle = "Update",
}: {
  items: YayasanNews[];
  pageSize?: number;
  title?: string;
  subtitle?: string;
}) {
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Simulasi loading agar skeleton terlihat (gantikan dengan fetch API nanti)
  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, [page]);

  React.useEffect(() => {
    // clamp jika items berubah
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return (
    <section aria-label="Berita yayasan" className="py-10 md:py-14">
      <Container>
        <RevealGroup>
          <RevealItem>
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="text-primary">Berita</span> DKM
                </h2>
              </div>

              <Link
                href="/news"
                className={
                  "relative pb-1 text-sm text-muted-foreground hover:text-foreground " +
                  "after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-primary " +
                  "after:origin-right after:scale-x-0 after:transition-transform after:duration-300 " +
                  "hover:after:origin-left hover:after:scale-x-100"
                }
              >
                Lihat Semua
              </Link>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: pageSize }).map((_, i) => <NewsCardSkeleton key={i} />)
                : pageItems.map((n) => (
                    <article
                      key={n.id}
                      className="overflow-hidden rounded-2xl border bg-background transition-colors duration-200 hover:border-primary group"
                    >
                      <Link href={n.href} className="block">
                        <div className="relative h-40 w-full">
                          {n.imageUrl ? (
                            <Image src={n.imageUrl} alt={n.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 360px" />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                          <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {n.category ? <span className="rounded-md border px-2 py-0.5">{n.category}</span> : null}
                            <span>{formatDate(n.date)}</span>
                          </div>

                          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">{n.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>
                        </div>
                      </Link>
                    </article>
                  ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
