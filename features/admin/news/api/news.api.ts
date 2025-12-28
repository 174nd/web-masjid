import type {
  CreateNewsPayload,
  CreateNewsResponse,
  DeleteNewsResponse,
  NewsDetailResponse,
  NewsListParams,
  NewsListResponse,
  NewsTagsResponse,
  UpdateNewsPayload,
  UpdateNewsResponse,
} from "./news.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function assertBaseUrl() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum diset.");
}

export function resolveNewsCoverUrl(coverUrl: string | null) {
  if (!coverUrl) return null;
  if (/^https?:\/\//i.test(coverUrl)) return coverUrl;
  if (!API_BASE) return coverUrl;
  const clean = coverUrl.replace(/^\/+/, "");
  return `${API_BASE}/files/stream/${clean}`;
}

export async function getNewsList(params: NewsListParams): Promise<NewsListResponse> {
  assertBaseUrl();

  const usp = new URLSearchParams();
  usp.set("page", String(params.page));
  usp.set("limit", String(params.limit));
  if (params.q?.trim()) usp.set("q", params.q.trim());

  const res = await fetch(`${API_BASE}/news?${usp.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as NewsListResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil berita.");

  return data as NewsListResponse;
}

export async function getNewsDetail(newsId: number): Promise<NewsDetailResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/news/${newsId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as NewsDetailResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil detail berita.");

  return data as NewsDetailResponse;
}

export async function getNewsTags(): Promise<NewsTagsResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/news/tags`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as NewsTagsResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil tags.");

  return data as NewsTagsResponse;
}

export async function createNews(payload: CreateNewsPayload): Promise<CreateNewsResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/news`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as CreateNewsResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal menambah berita.");

  return data as CreateNewsResponse;
}

export async function updateNews(newsId: number, payload: UpdateNewsPayload): Promise<UpdateNewsResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/news/${newsId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as UpdateNewsResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal memperbarui berita.");

  return data as UpdateNewsResponse;
}

export async function deleteNews(newsId: number): Promise<DeleteNewsResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/news/${newsId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as DeleteNewsResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal menghapus berita.");

  return data as DeleteNewsResponse;
}
