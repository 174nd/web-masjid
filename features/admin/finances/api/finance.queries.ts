import { useQuery } from "@tanstack/react-query";
import { getFinanceCategories, getFinanceMonthlySummary, getFinances } from "./finance.api";
import type { FinanceListParams } from "./finance.types";

export function useFinanceMonthlySummaryQuery(month: string) {
  return useQuery({
    queryKey: ["admin", "finance", "monthly-summary", month],
    queryFn: () => getFinanceMonthlySummary(month),
    retry: false,
    staleTime: 30_000,
  });
}

export function useFinanceCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "finance", "categories"],
    queryFn: getFinanceCategories,
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useFinancesQuery(params: FinanceListParams) {
  return useQuery({
    queryKey: ["admin", "finance", "list", params],
    queryFn: () => getFinances(params),
    retry: false,
    staleTime: 10_000,
  });
}
