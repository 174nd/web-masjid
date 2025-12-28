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

import type { FinanceItem } from "../api/finance.types";
import { useDeleteFinanceMutation } from "../api/finance.mutations";
import { toast } from "react-toastify";

export function TransactionDeleteDialog({
  open,
  onOpenChange,
  transaction,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  transaction: FinanceItem | null;
}) {
  const deleteMutation = useDeleteFinanceMutation();

  const onDelete = async () => {
    if (!transaction) return;
    await deleteMutation.mutateAsync(transaction.id);
    toast.success("Transaksi berhasil dihapus.");
    onOpenChange(false);
  };

  const dateLabel = transaction?.transactionDate ? new Date(transaction.transactionDate).toLocaleDateString("id-ID") : "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
          <AlertDialogDescription>
            {transaction ? (
              <>
                Anda yakin ingin menghapus transaksi <b>{transaction.ref}</b> pada <b>{dateLabel}</b>? Aksi ini tidak bisa dibatalkan.
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
