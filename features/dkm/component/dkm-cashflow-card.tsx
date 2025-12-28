"use client";

import * as React from "react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { CashflowRow } from "@/data/mock-dkm-cashflow";

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
  items: CashflowRow[];
  pageSize?: number;
  title?: string;
  subtitle?: string;
}) {
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  // simulasi loading tiap ganti page (bisa diganti API/TanStack Query)
  React.useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, [page]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const totalIn = items.reduce((acc, r) => acc + (r.in || 0), 0);
  const totalOut = items.reduce((acc, r) => acc + (r.out || 0), 0);
  const balance = totalIn - totalOut;

  const btn =
    "inline-flex h-9 items-center justify-center rounded-md border bg-background px-3 text-sm " +
    "transition-colors duration-200 hover:border-primary hover:bg-accent disabled:opacity-50 disabled:hover:bg-background";

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
                Total Masuk: <span className="font-semibold text-foreground">{formatIDR(totalIn)}</span>
              </span>
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                Total Keluar: <span className="font-semibold text-foreground">{formatIDR(totalOut)}</span>
              </span>
              <span className="rounded-md border px-2 py-1 text-muted-foreground">
                Saldo: <span className="font-semibold text-foreground">{formatIDR(balance)}</span>
              </span>
            </div>
          </div>

          {/* table */}
          <div className="mt-6 overflow-hidden rounded-xl border transition-colors duration-200 hover:border-primary">
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
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const active = p === page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={
                          "h-9 w-9 rounded-md border text-sm transition-colors duration-200 hover:border-primary hover:bg-accent " +
                          (active ? "border-primary bg-primary/10" : "bg-background")
                        }
                        aria-current={active ? "page" : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}
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
