"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { NewsItem } from "@/data/mock-news";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function SkeletonCard() {
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

export function NewsListPaginated({
  items,
  pageSize = 9,
  title = "Semua Berita",
  subtitle = "News",
}: {
  items: NewsItem[];
  pageSize?: number;
  title?: string;
  subtitle?: string;
}) {
  const listItems = React.useMemo(() => items.filter((i) => !i.pinned), [items]);

  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const totalPages = Math.max(1, Math.ceil(listItems.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = listItems.slice(start, start + pageSize);

  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, [page]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const btn =
    "inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm " +
    "transition-colors duration-200 hover:border-primary hover:bg-accent disabled:opacity-50 disabled:hover:bg-background";

  return (
    <RevealGroup>
      <RevealItem>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-primary">{subtitle}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          </div>
        </div>
      </RevealItem>

      <RevealItem>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)
            : pageItems.map((n) => (
                <article key={n.id} className="overflow-hidden rounded-2xl border bg-background transition-colors duration-200 hover:border-primary">
                  <Link href={n.href} className="block">
                    <div className="relative h-40 w-full">
                      <Image src={n.imageUrl} alt={n.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 360px" />
                      <div className="absolute inset-0 bg-linear-to-t from-background/55 via-transparent to-transparent" />
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

        {/* Pagination */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button className={btn} onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
              Prev
            </button>

            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const active = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
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

            <button className={btn} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              Next
            </button>
          </div>
        </div>
      </RevealItem>
    </RevealGroup>
  );
}
