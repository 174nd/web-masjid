"use client";

import * as React from "react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { CashflowRow } from "@/data/mock-dkm-cashflow";
import {
  getPublicFinanceList,
  getPublicFinanceMonthlyCurrent,
  type MonthlyFinanceItem,
  type PublicFinanceItem,
} from "@/features/public/api/public-finance.api";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function mapFinanceToRow(item: PublicFinanceItem): CashflowRow {
  const type = item.transactionType?.toLowerCase();
  return {
    id: String(item.id),
    date: item.transactionDate,
    ref: item.ref,
    description: item.description,
    in: type === "in" ? item.amount : 0,
    out: type === "out" ? item.amount : 0,
    category: item.financeCategory?.name,
  };
}

function formatSummaryValue(value: number | null, isLoading: boolean) {
  if (isLoading) {
    return <span className="inline-block h-4 w-20 animate-pulse rounded bg-muted align-middle" aria-hidden="true" />;
  }
  if (value == null) {
    return <span className="font-semibold text-foreground">-</span>;
  }
  return <span className="font-semibold text-foreground">{formatIDR(value)}</span>;
}

function SkeletonRow() {
  return (
    <tr className="border-b">
      <td className="p-3">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </td>
      <td className="p-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </td>
      <td className="p-3">
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </td>
      <td className="p-3 text-right">
        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
      </td>
      <td className="p-3 text-right">
        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
      </td>
    </tr>
  );
}

export function DkmCashflowCard({
  items,
  pageSize = 6,
  title = "Cashflow DKM",
  subtitle = "Rekap uang masuk & keluar",
}: {
  items?: CashflowRow[];
  pageSize?: number;
  title?: string;
  subtitle?: string;
}) {
  const useExternalItems = items !== undefined;
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState<CashflowRow[]>(() => items ?? []);
  const [totalPages, setTotalPages] = React.useState(() =>
    useExternalItems ? Math.max(1, Math.ceil((items ?? []).length / pageSize)) : 1,
  );
  const [loading, setLoading] = React.useState(!useExternalItems);
  const [summary, setSummary] = React.useState<MonthlyFinanceItem | null>(
    useExternalItems ? { id: 0, year: 0, month: 0, balance: 0, totalIn: 0, totalOut: 0 } : null,
  );
  const [summaryLoading, setSummaryLoading] = React.useState(!useExternalItems);
  const [error, setError] = React.useState<string | null>(null);

  const start = (page - 1) * pageSize;
  const pageItems = useExternalItems ? rows.slice(start, start + pageSize) : rows;

  React.useEffect(() => {
    if (!useExternalItems) return;
    setRows(items ?? []);
    setTotalPages(Math.max(1, Math.ceil((items ?? []).length / pageSize)));
    setSummary({
      id: 0,
      year: 0,
      month: 0,
      balance: (items ?? []).reduce((acc, r) => acc + (r.in || 0) - (r.out || 0), 0),
      totalIn: (items ?? []).reduce((acc, r) => acc + (r.in || 0), 0),
      totalOut: (items ?? []).reduce((acc, r) => acc + (r.out || 0), 0),
    });
    setLoading(false);
    setSummaryLoading(false);
    setError(null);
  }, [items, pageSize, useExternalItems]);

  React.useEffect(() => {
    if (useExternalItems) return;
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getPublicFinanceList({
          page,
          limit: pageSize,
          signal: controller.signal,
        });
        if (!active) return;
        setRows(resp.data.map(mapFinanceToRow));
        setTotalPages(resp.pagination?.totalPages ?? 1);
      } catch (err) {
        if (!active) return;
        setError((err as Error)?.message ?? "Gagal memuat cashflow.");
        setRows([]);
        setTotalPages(1);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, pageSize, useExternalItems]);

  React.useEffect(() => {
    if (useExternalItems) return;
    let active = true;
    const controller = new AbortController();

    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const resp = await getPublicFinanceMonthlyCurrent(controller.signal);
        if (!active) return;
        setSummary(resp.data?.[0] ?? null);
      } catch (err) {
        if (!active) return;
        setSummary(null);
        setError((err as Error)?.message ?? "Gagal memuat ringkasan cashflow.");
      } finally {
        if (active) setSummaryLoading(false);
      }
    };

    void loadSummary();

    return () => {
      active = false;
      controller.abort();
    };
  }, [useExternalItems]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const totalIn = summary?.totalIn ?? null;
  const totalOut = summary?.totalOut ?? null;
  const balance = summary?.balance ?? null;

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
    <section aria-label="Cashflow DKM" className="pt-10 md:pt-10">
      <RevealGroup>
        <RevealItem>
          {/* <div className="rounded-2xl border bg-background/95 p-6 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary md:p-8"> */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary">{subtitle}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
            </div>

            {/* ringkasan */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                Total Masuk: {formatSummaryValue(totalIn, summaryLoading)}
              </span>
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                Total Keluar: {formatSummaryValue(totalOut, summaryLoading)}
              </span>
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                Saldo: {formatSummaryValue(balance, summaryLoading)}
              </span>
            </div>
          </div>

          {/* table */}
          <div className="mt-6 overflow-hidden rounded-xl border transition-colors duration-200 hover:border-primary">
            {error ? <div className="border-b px-4 py-3 text-xs text-destructive">{error}</div> : null}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b">
                    <th className="p-3 text-left font-semibold">Tanggal</th>
                    <th className="p-3 text-left font-semibold">Ref</th>
                    <th className="p-3 text-left font-semibold">Keterangan</th>
                    <th className="p-3 text-right font-semibold">Masuk</th>
                    <th className="p-3 text-right font-semibold">Keluar</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)
                  ) : pageItems.length ? (
                    pageItems.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-accent/40">
                        <td className="p-3 text-muted-foreground">{formatDate(r.date)}</td>
                        <td className="p-3 text-muted-foreground">{r.ref ?? "-"}</td>
                        <td className="p-3">
                          <div className="font-medium">{r.description}</div>
                          {r.category ? <div className="text-xs text-muted-foreground">{r.category}</div> : null}
                        </td>
                        <td className="p-3 text-right tabular-nums text-blue-600">{r.in ? formatIDR(r.in) : "-"}</td>
                        <td className="p-3 text-right tabular-nums text-red-600">{r.out ? formatIDR(r.out) : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-6 text-muted-foreground" colSpan={5}>
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* pagination INSIDE card */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-background p-4">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button className={btn} onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
                  Prev
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                  {pages.map((p, idx) =>
                    p === "ellipsis" ? (
                      <span key={`el_${idx}`} className="px-2 text-xs text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
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

                <button className={btn} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                  Next
                </button>
              </div>
            </div>
          </div>
          {/* </div> */}
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
