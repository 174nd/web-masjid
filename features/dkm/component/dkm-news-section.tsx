"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
  getPublicNewsList,
  isRemotePublicUrl,
  mapPublicNewsItemToCard,
  type PublicNewsCardItem,
} from "@/features/public/api/public-news.api";

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

  const pages: Array<number | "ellipsis"> = React.useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages];
    }

    if (page >= totalPages - 2) {
      return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
  }, [page, totalPages]);

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
          {pages.map((p, idx) =>
            p === "ellipsis" ? (
              <span key={`el_${idx}`} className="px-2 text-xs text-muted-foreground">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                className={
                  "h-9 w-9 rounded-md border text-sm transition-colors duration-200 hover:border-primary hover:bg-accent " +
                  (p === page ? "border-primary bg-primary/10" : "bg-background")
                }
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
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
  items?: PublicNewsCardItem[];
  pageSize?: number;
  title?: string;
  subtitle?: string;
}) {
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(items === undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [newsItems, setNewsItems] = React.useState<PublicNewsCardItem[]>(() => items ?? []);
  const [remoteTotalPages, setRemoteTotalPages] = React.useState(1);

  React.useEffect(() => {
    if (items !== undefined) {
      setNewsItems(items);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getPublicNewsList({ limit: pageSize, page, tagId: 2, signal: controller.signal });
        if (!active) return;
        const mapped = resp.data.map(mapPublicNewsItemToCard);
        setNewsItems(mapped);
        setRemoteTotalPages(resp.pagination?.totalPages ?? 1);
      } catch (err) {
        if (!active) return;
        setError((err as Error)?.message ?? "Gagal memuat berita.");
        setNewsItems([]);
        setRemoteTotalPages(1);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [items, pageSize, page]);

  const totalPages = items === undefined ? Math.max(1, remoteTotalPages) : Math.max(1, Math.ceil(newsItems.length / pageSize));

  React.useEffect(() => {
    // clamp jika items berubah
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = items === undefined ? newsItems : newsItems.slice((page - 1) * pageSize, page * pageSize);

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
              {error ? <div className="sm:col-span-2 lg:col-span-3 text-xs text-destructive">{error}</div> : null}
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
                            <Image
                              src={n.imageUrl}
                              alt={n.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 360px"
                              unoptimized={isRemotePublicUrl(n.imageUrl ?? null)}
                            />
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
