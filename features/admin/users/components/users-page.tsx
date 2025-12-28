"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { UserFormDialog } from "./user-form-dialog";
import { UserDeleteDialog } from "./user-delete-dialog";
import { useUsersQuery } from "../api/user.queries";
import type { UserItem } from "../api/users.types";

function SkeletonCell() {
  return <div className="h-4 w-full animate-pulse rounded bg-muted" />;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

const PAGE_SIZE_OPTIONS = [5, 8, 10, 20, 30] as const;

export function UsersPage() {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(8);

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserItem | null>(null);
  const [deleteUser, setDeleteUser] = React.useState<UserItem | null>(null);

  // reset ke page 1 saat keyword berubah
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const usersQuery = useUsersQuery({ page, limit: pageSize, q: debouncedSearch });
  const rows = usersQuery.data?.data ?? [];
  const total = usersQuery.data?.pagination.totalItems ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  // range info
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Search & pagination via API (server-side) dengan delay untuk loading effect.</p>
        </div>

        <Button onClick={() => setOpenCreate(true)} className="md:self-end">
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-90">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username / nama / role..." className="pl-9" />
          </div>

          <div className="text-sm text-muted-foreground">{usersQuery.isLoading ? "Loading..." : null}</div>
        </div>

        <Separator className="my-4" />

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Created</th>
                <th className="py-2 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {usersQuery.isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`sk_${i}`} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 w-40">
                      <SkeletonCell />
                    </td>
                    <td className="py-3 pr-3">
                      <SkeletonCell />
                    </td>
                    <td className="py-3 pr-3 w-27.5">
                      <SkeletonCell />
                    </td>
                    <td className="py-3 pr-3 w-27.5">
                      <SkeletonCell />
                    </td>
                    <td className="py-3 pr-3 w-35">
                      <SkeletonCell />
                    </td>
                    <td className="py-3 text-right w-30">
                      <div className="ml-auto flex justify-end gap-2">
                        <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                        <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td className="py-6 text-muted-foreground" colSpan={6}>
                    Tidak ada user.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3 font-medium">{u.username}</td>
                    <td className="py-3 pr-3">{u.name}</td>
                    <td className="py-3 pr-3">{u.role}</td>
                    <td className="py-3 pr-3">
                      <span className={u.isActive ? "text-emerald-600" : "text-muted-foreground"}>{u.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="py-3 pr-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setEditUser(u)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setDeleteUser(u)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination + page size selector + info total */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Info total + range (kiri) */}
          <div className="text-sm text-muted-foreground">
            {usersQuery.isLoading ? (
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

          {/* Controls (kanan) */}
          <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  const next = Number(v) as (typeof PAGE_SIZE_OPTIONS)[number];
                  setPageSize(next);
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

            {/* Page indicator + prev/next */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Page <span className="font-medium text-foreground">{safePage}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={usersQuery.isLoading || safePage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={usersQuery.isLoading || safePage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Create dialog */}
      <UserFormDialog mode="create" open={openCreate} onOpenChange={setOpenCreate} />

      {/* Edit dialog */}
      <UserFormDialog mode="edit" user={editUser ?? undefined} open={!!editUser} onOpenChange={(v) => (!v ? setEditUser(null) : null)} />

      {/* Delete confirm */}
      <UserDeleteDialog open={!!deleteUser} onOpenChange={(v) => (!v ? setDeleteUser(null) : null)} user={deleteUser} />
    </div>
  );
}
