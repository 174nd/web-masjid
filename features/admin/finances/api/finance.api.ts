import type {
  CreateFinancePayload,
  CreateFinanceResponse,
  DeleteFinanceResponse,
  FinanceListResponse,
  FinanceListParams,
  MonthlySummaryResponse,
  UpdateFinancePayload,
  UpdateFinanceResponse,
  FinanceCategory,
} from "./finance.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function assertBaseUrl() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum diset (.env.local).");
}

export function getMonthRange(month: string) {
  // month: "YYYY-MM"
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr); // 1..12

  // gunakan UTC agar stabil
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));

  return {
    year: y,
    month: m,
    gte: start.toISOString().slice(0, 10), // YYYY-MM-01
    lt: end.toISOString().slice(0, 10), // YYYY-(MM+1)-01
  };
}

export function buildFinanceListQuery(params: FinanceListParams) {
  const usp = new URLSearchParams();
  usp.set("page", String(params.page));
  usp.set("limit", String(params.limit));

  if (params.q?.trim()) usp.set("q", params.q.trim());

  if (params.transactionType) {
    usp.set("filter[transactionType.eq]", params.transactionType);
  }

  if (params.month) {
    const { gte, lt } = getMonthRange(params.month);
    usp.set("filter[transactionDate.gte]", gte);
    usp.set("filter[transactionDate.lt]", lt);
  }

  return usp.toString();
}

export async function getFinances(params: FinanceListParams): Promise<FinanceListResponse> {
  assertBaseUrl();

  const qs = buildFinanceListQuery(params);

  const res = await fetch(`${API_BASE}/finances?${qs}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal mengambil data finances.");
  }

  return json as FinanceListResponse;
}

export async function getFinanceCategories(): Promise<FinanceCategory[]> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/finances/categories`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal mengambil kategori finance.");
  }

  return json.data as FinanceCategory[];
}

export async function getFinanceMonthlySummary(month: string) {
  assertBaseUrl();

  const { year, month: m } = getMonthRange(month);

  const res = await fetch(`${API_BASE}/finances/monthly?year=${year}&month=${m}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal mengambil finance monthly summary.");
  }

  const data = json as MonthlySummaryResponse;
  const first = data.data?.[0];

  return {
    totalIn: first?.totalIn ?? 0,
    totalOut: first?.totalOut ?? 0,
    balance: first?.balance ?? 0,
  };
}

export async function createFinance(payload: CreateFinancePayload): Promise<CreateFinanceResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/finances`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal menambahkan transaksi.");
  }

  return json as CreateFinanceResponse;
}

export async function updateFinance(financeId: number, payload: UpdateFinancePayload): Promise<UpdateFinanceResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/finances/${financeId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal update transaksi.");
  }

  return json as UpdateFinanceResponse;
}

export async function deleteFinance(financeId: number): Promise<DeleteFinanceResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/finances/${financeId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message ?? "Gagal hapus transaksi.");
  }

  return json as DeleteFinanceResponse;
}
