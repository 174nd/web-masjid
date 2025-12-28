"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import "@/components/textEditor.css";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { resolveNewsCoverUrl } from "../api/news.api";
import { useNewsDetailQuery } from "../api/news.queries";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function resolveId(value: string | string[] | undefined) {
  if (Array.isArray(value)) return resolveId(value[0]);
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function NewsPreviewPage({ newsId }: { newsId?: number | null }) {
  const params = useParams<{ id?: string }>();
  const resolvedId = resolveId(params?.id) ?? newsId ?? null;

  const detailQuery = useNewsDetailQuery(resolvedId);
  const news = detailQuery.data?.data ?? null;
  const coverUrl = resolveNewsCoverUrl(news?.coverUrl ?? null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Preview Berita</h1>
          <p className="text-sm text-muted-foreground">Tampilan berita secara keseluruhan sebelum publish.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/news">Kembali</Link>
        </Button>
      </div>

      <Card className="p-4">
        <Separator className="mb-4" />

        {resolvedId === null ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            ID berita tidak valid.
          </div>
        ) : detailQuery.isLoading ? (
          <div className="space-y-4">
            <SkeletonBlock className="h-56 w-full" />
            <SkeletonBlock className="h-6 w-2/3" />
            <SkeletonBlock className="h-4 w-1/2" />
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-5/6" />
            </div>
          </div>
        ) : detailQuery.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(detailQuery.error as Error)?.message ?? "Gagal memuat berita."}
          </div>
        ) : !news ? (
          <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">Data berita tidak ditemukan.</div>
        ) : (
          <div className="space-y-4">
            {coverUrl ? (
              <div className="overflow-hidden rounded-md border">
                <img src={coverUrl} alt={news.title} className="h-72 w-full object-cover" />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{news.title}</h2>
                {news.isPinned ? <Badge variant="secondary">Pinned</Badge> : null}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(news.createdAt).toLocaleDateString()} · slug: {news.slug}
              </div>
              {news.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Tidak ada tag.</div>
              )}
            </div>

            <div className="rounded-md border bg-card p-4">
              <div
                className="text-editor__content tiptap preview text-base md:text-sm leading-5"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
