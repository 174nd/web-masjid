import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFinance, updateFinance, deleteFinance } from "./finance.api";
import type { CreateFinancePayload, UpdateFinancePayload } from "./finance.types";

export function useCreateFinanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFinancePayload) => createFinance(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "finance", "list"] });
      await qc.invalidateQueries({ queryKey: ["admin", "finance", "monthly-summary"] });
    },
  });
}

export function useUpdateFinanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; payload: UpdateFinancePayload }) => updateFinance(vars.id, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "finance", "list"] });
      await qc.invalidateQueries({ queryKey: ["admin", "finance", "monthly-summary"] });
    },
  });
}

export function useDeleteFinanceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFinance(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "finance", "list"] });
      await qc.invalidateQueries({ queryKey: ["admin", "finance", "monthly-summary"] });
    },
  });
}
