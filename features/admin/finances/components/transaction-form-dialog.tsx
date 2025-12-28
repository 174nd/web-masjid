"use client";

import * as React from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useFinanceCategoriesQuery } from "../api/finance.queries";
import { useCreateFinanceMutation, useUpdateFinanceMutation } from "../api/finance.mutations";
import type { FinanceItem, TransactionType } from "../api/finance.types";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financeFormSchema } from "../schema/finance.schema";
import { InputCurrency } from "@/components/ui/input-currency";
import { toast } from "react-toastify";

function parseTransactionDate(input: string) {
  const dateOnly = input.split("T")[0];
  const [y, m, d] = dateOnly.split("-").map((part) => Number(part));
  if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
    return new Date(y, m - 1, d);
  }

  const fallback = new Date(input);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function TransactionFormDialog({
  mode,
  transaction,
  open,
  onOpenChange,
  month,
}: {
  mode: "create" | "edit";
  transaction?: FinanceItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  month: string; // "YYYY-MM"
}) {
  const categoryId = transaction?.categoryId ?? transaction?.financeCategory?.finance_category_id ?? 0;
  const defaultValues = {
    transactionDate:
      mode === "edit" && transaction ? parseTransactionDate(transaction.transactionDate) : new Date(`${month}-01T00:00:00.000Z`),
    transactionType: mode === "edit" && transaction ? transaction.transactionType : "In",
    ref: mode === "edit" && transaction ? transaction.ref ?? "" : "",
    categoryId: mode === "edit" && transaction ? categoryId : 0,
    description: mode === "edit" && transaction ? transaction.description ?? "" : "",
    amount: mode === "edit" && transaction ? transaction.amount ?? 0 : 0,
  };

  const categoriesQuery = useFinanceCategoriesQuery(open);
  const createMutation = useCreateFinanceMutation();
  const updateMutation = useUpdateFinanceMutation();

  const categories = categoriesQuery.data ?? [];

  const form = useForm({
    validationLogic: revalidateLogic(),
    defaultValues,
    validators: {
      onSubmit: financeFormSchema,
    },
    onSubmit: async ({ value }) => {
      // convert ke payload backend
      const payload = {
        transactionDate: value.transactionDate.toISOString(),
        transactionType: value.transactionType as TransactionType,
        ref: value.ref,
        categoryId: value.categoryId,
        description: value.description,
        amount: value.amount,
      };

      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success("Transaksi berhasil disimpan.");
      } else if (mode === "edit" && transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, payload });
        toast.success("Transaksi berhasil diperbarui.");
      }

      onOpenChange(false);
      form.reset();
    },
  });

  React.useLayoutEffect(() => {
    if (!open) return;
    createMutation.reset();
    updateMutation.reset();

    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, month, mode, transaction]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const errorMessage = ((createMutation.error ?? updateMutation.error) as Error | undefined)?.message ?? "Error";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Transaksi" : "Edit Transaksi"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Catat pemasukan atau pengeluaran." : "Perbarui data transaksi."}</DialogDescription>
        </DialogHeader>

        {categoriesQuery.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(categoriesQuery.error as Error)?.message ?? "Error mengambil kategori"}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          {/* Tanggal */}
          <form.Field name="transactionDate" validators={{ onChange: ({ value }) => (!value ? "Tanggal wajib diisi." : undefined) }}>
            {(field) => (
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <DatePicker value={field.state.value} onChange={(d) => field.handleChange(d as Date)} disabled={isSubmitting} />
                {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
              </div>
            )}
          </form.Field>

          {/* Ref */}
          <form.Field name="ref" validators={{ onChange: ({ value }) => (!value?.trim() ? "Ref wajib diisi." : undefined) }}>
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Ref</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="mis. AN#0001"
                  disabled={isSubmitting}
                />
                {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
              </div>
            )}
          </form.Field>

          {/* Kategori */}
          <form.Field name="categoryId">
            {(field) => (
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={field.state.value ? String(field.state.value) : ""}
                  onValueChange={(v) => field.handleChange(Number(v))}
                  disabled={isSubmitting || categoriesQuery.isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={categoriesQuery.isLoading ? "Loading..." : "Pilih kategori"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
              </div>
            )}
          </form.Field>

          {/* Deskripsi */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Deskripsi</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="mis. Bayar listrik / Infak Jumat"
                  disabled={isSubmitting}
                />
                {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{field.state.meta.errors[0].message}</p> : null}
              </div>
            )}
          </form.Field>

          {/* Nominal + Type */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <form.Field
              name="amount"
              validators={{
                onChange: ({ value }) => {
                  const n = Number(value);
                  if (!value) return "Nominal wajib diisi.";
                  if (!Number.isFinite(n) || n <= 0) return "Nominal harus angka > 0.";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>Nominal (Rp)</Label>
                  <InputCurrency
                    id={field.name}
                    value={field.state.value}
                    onValueChange={({ numeric }) => field.handleChange(numeric ?? 0)}
                    placeholder="mis. 150000"
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors?.[0] ? <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p> : null}
                </div>
              )}
            </form.Field>

            <form.Field name="transactionType">
              {(field) => (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as TransactionType)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In">Masuk</SelectItem>
                      <SelectItem value="Out">Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || categoriesQuery.isLoading}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
