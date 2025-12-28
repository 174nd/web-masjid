export type TransactionType = "In" | "Out";

export type FinanceListParams = {
  page: number;
  limit: number;
  q?: string;
  transactionType?: TransactionType; // In/Out
  month?: string; // "YYYY-MM" -> otomatis set filter[transactionDate.gte/lt]
};

export type FinanceItem = {
  id: number;
  transactionDate: string; // "YYYY-MM-DD" or ISO
  transactionType: TransactionType;
  ref: string;
  categoryId: number;
  description: string;
  amount: number;
  userId: number;
  createdAt: string;
  financeCategory?: {
    name: string;
    finance_category_id: number;
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type FinanceListResponse = {
  status: "success";
  data: FinanceItem[];
  message: string;
  pagination: PaginationMeta;
};

export type MonthlySummaryItem = {
  id: number;
  year: number;
  month: number;
  balance: number;
  totalIn: number;
  totalOut: number;
};

export type MonthlySummaryResponse = {
  status: "success";
  data: MonthlySummaryItem[];
  message: string;
};

export type CreateFinancePayload = {
  transactionDate: string; // ISO, contoh: "2025-12-27T00:00:00.000Z"
  transactionType: TransactionType;
  ref: string;
  categoryId: number;
  description: string;
  amount: number;
};

export type CreateFinanceResponse = {
  status: "success";
  data: FinanceItem;
  message: string;
};
export type UpdateFinancePayload = Partial<CreateFinancePayload>;

export type UpdateFinanceResponse = {
  status: "success";
  data: FinanceItem;
  message: string;
};

export type DeleteFinanceResponse = {
  status: "success";
  data: { id: number };
  message: string;
};

export type FinanceCategory = {
  id: number;
  name: string;
};

export type FinanceCategoriesResponse = {
  status: "success";
  data: FinanceCategory[];
  message: string;
};

export type FinanceTransactionType = "IN" | "OUT";

export type FinanceTransaction = {
  id: string;
  date: string;
  type: FinanceTransactionType;
  category: string;
  description: string;
  amount: number;
};

export type FinanceSummary = {
  month: string;
  totalIn: number;
  totalOut: number;
  balance: number;
};
