"use client";

import * as React from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { useFinancesQuery } from "../api/finance.queries";
import type { FinanceItem, FinanceListParams, TransactionType } from "../api/finance.types";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { TransactionDeleteDialog } from "./transaction-delete-dialog";

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

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const PAGE_SIZE_OPTIONS = [5, 8, 10, 20, 30] as const;

type UiType = "ALL" | "IN" | "OUT";

function mapUiTypeToApi(type: UiType): TransactionType | undefined {
  if (type === "IN") return "In";
  if (type === "OUT") return "Out";
  return undefined; // ALL
}

export function TransactionsTable({ month }: { month: string }) {
  const [q, setQ] = React.useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const [type, setType] = React.useState<UiType>("ALL");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(8);
  const [editTransaction, setEditTransaction] = React.useState<FinanceItem | null>(null);
  const [deleteTransaction, setDeleteTransaction] = React.useState<FinanceItem | null>(null);

  // reset page kalau filter berubah
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, type, month, pageSize]);

  const params: FinanceListParams = React.useMemo(
    () => ({
      page,
      limit: pageSize,
      q: debouncedQ,
      transactionType: mapUiTypeToApi(type),
      month, // akan dibuat filter[transactionDate.gte/lt] di finance.api.ts
    }),
    [page, pageSize, debouncedQ, type, month]
  );

  const query = useFinancesQuery(params);

  const rows: FinanceItem[] = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  const total = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const safePage = Math.min(page, totalPages);

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);

  return (
    <>
      <Card className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-90">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search kategori / deskripsi..." className="pl-9" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <Select value={type} onValueChange={(v) => setType(v as UiType)}>
            <SelectTrigger className="h-9 w-30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="IN">Masuk</SelectItem>
              <SelectItem value="OUT">Keluar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="py-2 pr-3">Tanggal</th>
              <th className="py-2 pr-3">Kategori</th>
              <th className="py-2 pr-3">Deskripsi</th>
              <th className="py-2 pr-3 text-right">Nominal</th>
              <th className="py-2 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {query.isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`sk_${i}`} className="border-b last:border-b-0">
                  <td className="w-35 py-3 pr-3">
                    <SkeletonCell />
                  </td>
                  <td className="w-40 py-3 pr-3">
                    <SkeletonCell />
                  </td>
                  <td className="py-3 pr-3">
                    <SkeletonCell />
                  </td>
                  <td className="w-50 py-3 pr-3 text-right">
                    <SkeletonCell />
                  </td>
                  <td className="w-28 py-3 text-right">
                    <div className="ml-auto flex justify-end gap-2">
                      <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                      <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                    </div>
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={5}>
                  Tidak ada transaksi.
                </td>
              </tr>
            ) : (
              rows.map((t) => {
                const isIn = t.transactionType === "In";

                // contoh backend: "2025-12-27"
                const dt = new Date(t.transactionDate);

                return (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="py-3 pr-3">{dt.toLocaleDateString("id-ID")}</td>
                    <td className="py-3 pr-3">{t.financeCategory?.name}</td>
                    <td className="py-3 pr-3">{t.description}</td>
                    <td className="py-3 pr-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <Badge variant={isIn ? "default" : "destructive"}>{isIn ? "Masuk" : "Keluar"}</Badge>
                        <span className={isIn ? "font-semibold text-emerald-600" : "font-semibold text-rose-600"}>{formatIDR(t.amount)}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setEditTransaction(t)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setDeleteTransaction(t)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          {query.isLoading ? (
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

      <TransactionFormDialog
        mode="edit"
        transaction={editTransaction ?? undefined}
        open={!!editTransaction}
        onOpenChange={(v) => (!v ? setEditTransaction(null) : null)}
        month={month}
      />
      <TransactionDeleteDialog open={!!deleteTransaction} onOpenChange={(v) => (!v ? setDeleteTransaction(null) : null)} transaction={deleteTransaction} />
    </>
  );
}
