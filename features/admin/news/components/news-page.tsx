"use client";

import * as React from "react";

import { NewsCreateCard } from "./news-create-card";
import { NewsListCard } from "./news-list-card";
import { NewsDeleteDialog } from "./news-delete-dialog";
import { useNewsDetailQuery } from "../api/news.queries";
import type { NewsListItem } from "../api/news.types";

export function NewsPage() {
  const [editNewsId, setEditNewsId] = React.useState<number | null>(null);
  const [deleteNews, setDeleteNews] = React.useState<NewsListItem | null>(null);

  const detailQuery = useNewsDetailQuery(editNewsId);
  const editNews = detailQuery.data?.data ?? null;
  const editLoading = editNewsId !== null && detailQuery.isLoading;
  const editLoadError = detailQuery.isError ? (detailQuery.error as Error)?.message ?? "Gagal memuat berita." : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Berita</h1>
        <p className="text-sm text-muted-foreground">Tambah dan kelola berita.</p>
      </div>

      <NewsCreateCard
        mode={editNewsId ? "edit" : "create"}
        news={editNews}
        isLoading={editLoading}
        loadError={editLoadError}
        onCancelEdit={() => setEditNewsId(null)}
      />
      <NewsListCard onEdit={(news) => setEditNewsId(news.id)} onDelete={(news) => setDeleteNews(news)} />
      <NewsDeleteDialog open={!!deleteNews} onOpenChange={(v) => (!v ? setDeleteNews(null) : null)} news={deleteNews} />
    </div>
  );
}
