import { z } from "zod";

export const TRANSACTION_TYPES = ["In", "Out"] as const;

export const financeFormSchema = z.object({
  transactionDate: z.date({ message: "Tanggal transaksi wajib diisi." }).refine((d) => !Number.isNaN(d.getTime()), "Tanggal tidak valid."),
  transactionType: z.enum(TRANSACTION_TYPES, { message: "Transaction type tidak valid." }),
  ref: z.string().trim().min(1, { message: "Ref wajib diisi." }),
  categoryId: z.number().int().positive({ message: "Kategori wajib dipilih." }),
  description: z.string().trim().min(1, { message: "Deskripsi wajib diisi." }),
  // amount input biasanya string, tapi untuk schema kita pakai number agar clean
  amount: z.number().positive({ message: "Nominal harus > 0." }),
});

export type FinanceFormValues = z.infer<typeof financeFormSchema>;

/**
 * Helper kalau Anda input amount masih string di form:
 * Konversi sebelum validate.
 */
export function parseAmount(input: unknown): number {
  // menerima "1.000.000" atau "1000000" -> 1000000
  const s = String(input ?? "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .trim();

  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
