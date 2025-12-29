export type MonthlyFinanceItem = {
  id: number;
  year: number;
  month: number;
  balance: number;
  totalIn: number;
  totalOut: number;
};

export type MonthlyFinanceResponse = {
  status: "success";
  data: MonthlyFinanceItem[];
  message: string;
};

export type PublicFinanceCategory = {
  name: string;
  finance_category_id: number;
};

export type PublicFinanceItem = {
  id: number;
  transactionDate: string;
  transactionType: string;
  ref?: string;
  description: string;
  amount: number;
  createdAt: string;
  financeCategory?: PublicFinanceCategory;
};

export type PublicFinanceListResponse = {
  status: "success";
  data: PublicFinanceItem[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function assertBaseUrl() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum diset.");
}

export async function getPublicMonthlyFinanceLast6(signal?: AbortSignal) {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/public/finance/monthly/last-6`, {
    method: "GET",
    signal,
  });

  const data = (await res.json().catch(() => null)) as MonthlyFinanceResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil data infak.");

  return data as MonthlyFinanceResponse;
}

export async function getPublicFinanceList({
  page = 1,
  limit = 6,
  signal,
}: {
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}): Promise<PublicFinanceListResponse> {
  assertBaseUrl();

  const usp = new URLSearchParams();
  usp.set("page", String(page));
  usp.set("limit", String(limit));

  const res = await fetch(`${API_BASE}/public/finance?${usp.toString()}`, {
    method: "GET",
    signal,
  });

  const data = (await res.json().catch(() => null)) as PublicFinanceListResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil data cashflow.");

  return data as PublicFinanceListResponse;
}

export async function getPublicFinanceMonthlyCurrent(signal?: AbortSignal) {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/public/finance/monthly/current`, {
    method: "GET",
    signal,
  });

  const data = (await res.json().catch(() => null)) as MonthlyFinanceResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil ringkasan cashflow.");

  return data as MonthlyFinanceResponse;
}
