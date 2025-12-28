"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MonthPicker } from "@/components/ui/month-picker";

import { TransactionFormDialog } from "./transaction-form-dialog";
import { useFinanceMonthlySummaryQuery } from "../api/finance.queries";
import { TransactionsTable } from "./transactions-table";

function yyyymmNow() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function SummarySkeleton() {
  return <div className="h-5 w-full animate-pulse rounded bg-muted" />;
}

export function FinancePage() {
  const [month, setMonth] = React.useState(yyyymmNow());
  const [openCreate, setOpenCreate] = React.useState(false);

  const summaryQuery = useFinanceMonthlySummaryQuery(month);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Keuangan</h1>
          <p className="text-sm text-muted-foreground">Catat pemasukan & pengeluaran per bulan.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bulan</span>
            <MonthPicker value={month} onChange={setMonth} />
          </div>

          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Masuk</div>
          <div className="mt-2 text-lg font-semibold">
            {summaryQuery.isLoading ? <SummarySkeleton /> : formatIDR(summaryQuery.data?.totalIn ?? 0)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Keluar</div>
          <div className="mt-2 text-lg font-semibold">
            {summaryQuery.isLoading ? <SummarySkeleton /> : formatIDR(summaryQuery.data?.totalOut ?? 0)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Sisa Uang</div>
          <div className="mt-2 text-lg font-semibold">
            {summaryQuery.isLoading ? <SummarySkeleton /> : formatIDR(summaryQuery.data?.balance ?? 0)}
          </div>
          <Separator className="my-3" />
          <div className="text-xs text-muted-foreground">Diambil dari /finances/monthly</div>
        </Card>
      </div>

      {/* Table: silakan integrasikan ke hook useFinancesQuery */}
      <TransactionsTable month={month} />

      <TransactionFormDialog mode="create" open={openCreate} onOpenChange={setOpenCreate} month={month} />
    </div>
  );
}
