"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Eye } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { resolveNewsCoverUrl } from "../api/news.api";
import { useNewsListQuery } from "../api/news.queries";
import type { NewsListItem } from "../api/news.types";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const PAGE_SIZE_OPTIONS = [5, 8, 10, 20] as const;

function SkeletonRow() {
  return (
    <div className="flex gap-3 rounded-md border p-3">
      <div className="h-16 w-24 animate-pulse rounded bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function NewsListCard({ onEdit, onDelete }: { onEdit?: (news: NewsListItem) => void; onDelete?: (news: NewsListItem) => void }) {
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(8);

  React.useEffect(() => setPage(1), [debouncedQ, pageSize]);

  const query = useNewsListQuery({ q: debouncedQ, page, limit: pageSize });
  const showSkeleton = query.isLoading || query.isFetching;

  const items = query.data?.data ?? [];
  const total = query.data?.pagination.totalItems ?? 0;
  const totalPages = query.data?.pagination.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);

  return (
    <Card className="p-4">
      <div className="mb-2">
        <h2 className="text-base font-semibold">Daftar Berita</h2>
        <p className="text-sm text-muted-foreground">Cari berita, lihat list, dan paging.</p>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-90">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search judul / tag..." className="pl-9" />
        </div>

        <div className="text-sm text-muted-foreground">{query.isFetching ? "Loading..." : null}</div>
      </div>

      <div className="mt-4 space-y-3">
        {showSkeleton ? (
          Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={`sk_${i}`} />)
        ) : items.length === 0 ? (
          <div className="rounded-md border p-6 text-sm text-muted-foreground">Tidak ada berita.</div>
        ) : (
          items.map((n) => {
            const coverUrl = resolveNewsCoverUrl(n.coverUrl);
            const tagNames = (n.newsTags ?? []).map((t) => t.tags?.name).filter(Boolean) as string[];
            const slug = n.newsSlug?.[0]?.slug ?? "-";
            const tagsLabel = tagNames.length > 0 ? tagNames.join(", ") : "-";

            return (
              <div key={n.id} className="flex gap-3 rounded-md border p-3">
                <div className="h-16 w-24 overflow-hidden rounded bg-muted">
                  {coverUrl ? (
                    // pakai img biasa untuk mock; kalau mau next/image nanti tinggal ganti
                    <img src={coverUrl} alt={n.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate font-medium">{n.title}</div>
                    {n.isPinned ? <Badge variant="secondary">Pinned</Badge> : null}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()} · slug: {slug} · tags: {tagsLabel}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{n.description}</div>
                </div>

                <div className="flex items-start gap-2">
                  <Button asChild variant="outline" size="icon" aria-label="Preview">
                    <Link href={`/admin/news/preview/${n.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit?.(n)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => onDelete?.(n)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination area */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {query.isFetching ? (
            "Loading..."
          ) : (
            <>
              Total: <span className="font-medium text-foreground">{total}</span> · Menampilkan{" "}
              <span className="font-medium text-foreground">
                {showingFrom}-{showingTo}
              </span>{" "}
              dari <span className="font-medium text-foreground">{total}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v) as any);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-22.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Page <span className="font-medium text-foreground">{safePage}</span> of{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={query.isLoading || safePage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={query.isLoading || safePage >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {query.isError ? (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(query.error as Error)?.message ?? "Terjadi error saat mengambil data."}
        </div>
      ) : null}
    </Card>
  );
}
