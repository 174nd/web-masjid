"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import type { UserItem } from "../api/users.types";
import { useDeleteUser } from "../api/users.mutations";
import { toast } from "react-toastify";

export function UserDeleteDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (v: boolean) => void; user: UserItem | null }) {
  const deleteMutation = useDeleteUser();
  const onDelete = async () => {
    await deleteMutation.mutateAsync(user?.id as number);
    toast.success("User berhasil dihapus.");
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus User</AlertDialogTitle>
          <AlertDialogDescription>
            {user ? (
              <>
                Anda yakin ingin menghapus user <b>{user.username}</b>? Aksi ini tidak bisa dibatalkan. (mock)
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
