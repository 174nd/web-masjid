"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { NewsListItem } from "../api/news.types";
import { useDeleteNewsMutation } from "../api/news.mutations";
import { toast } from "react-toastify";

export function NewsDeleteDialog({
  open,
  onOpenChange,
  news,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  news: NewsListItem | null;
}) {
  const deleteMutation = useDeleteNewsMutation();

  const onDelete = async () => {
    if (!news) return;
    await deleteMutation.mutateAsync(news.id);
    toast.success("Berita berhasil dihapus.");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Berita</AlertDialogTitle>
          <AlertDialogDescription>
            {news ? (
              <>
                Anda yakin ingin menghapus berita <b>{news.title}</b>? Aksi ini tidak bisa dibatalkan.
              </>
            ) : (
              "Anda yakin?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={deleteMutation.isPending}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
