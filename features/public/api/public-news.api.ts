export type PublicNewsTag = {
  tag_id: number;
  tags?: {
    name: string;
    tag_id: number;
  };
};

export type PublicNewsSlug = {
  slug: string;
  isCurrent?: boolean;
  news_slug_id: number;
};

export type PublicNewsItem = {
  id: number;
  coverUrl: string | null;
  isPinned: boolean;
  title: string;
  description: string;
  userId: number;
  createdAt: string;
  users?: {
    name: string;
    email: string;
    user_id: number;
  };
  newsSlug?: PublicNewsSlug[];
  newsTags?: PublicNewsTag[];
};

export type PublicNewsListResponse = {
  status: "success";
  data: PublicNewsItem[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type PublicNewsSimpleTag = {
  id: number;
  name: string;
};

export type PublicNewsDetail = {
  id: number;
  coverUrl: string | null;
  isPinned: boolean;
  title: string;
  description?: string;
  content?: string;
  userId: number;
  createdAt: string;
  slug?: string;
  tags?: PublicNewsSimpleTag[];
  newsSlug?: PublicNewsSlug[];
  newsTags?: PublicNewsTag[];
};

export type PublicNewsDetailResponse = {
  status: "success";
  data: PublicNewsDetail;
  message: string;
};

export type PublicNewsCardItem = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  href: string;
  imageUrl: string | null;
  category?: string;
  isPinned?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function assertBaseUrl() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum diset.");
}

export function resolvePublicNewsCoverUrl(coverUrl: string | null) {
  if (!coverUrl) return null;
  if (/^https?:\/\//i.test(coverUrl)) return coverUrl;
  if (!API_BASE) return coverUrl;
  const clean = coverUrl.replace(/^\/+/, "");
  return `${API_BASE}/files/stream/${clean}`;
}

export function isRemotePublicUrl(value: string | null) {
  return !!value && /^https?:\/\//i.test(value);
}

export function getCurrentSlug(slugs?: PublicNewsSlug[]) {
  if (!slugs || slugs.length === 0) return null;
  return slugs.find((s) => s.isCurrent)?.slug ?? slugs[0]?.slug ?? null;
}

export function mapPublicNewsItemToCard(item: PublicNewsItem): PublicNewsCardItem {
  const slug = getCurrentSlug(item.newsSlug);
  return {
    id: item.id,
    title: item.title,
    excerpt: item.description ?? "",
    date: item.createdAt,
    href: slug ? `/news/${slug}` : "/news",
    imageUrl: resolvePublicNewsCoverUrl(item.coverUrl),
    category: item.newsTags?.[0]?.tags?.name,
    isPinned: item.isPinned,
  };
}

export async function getPublicNewsList({
  limit,
  page = 1,
  tagId,
  signal,
}: {
  limit: number;
  page?: number;
  tagId?: number;
  signal?: AbortSignal;
}): Promise<PublicNewsListResponse> {
  assertBaseUrl();

  const usp = new URLSearchParams();
  usp.set("limit", String(limit));
  usp.set("page", String(page));
  if (typeof tagId === "number") {
    usp.set("filter[newsTags.tagId.eq]", String(tagId));
  }

  const res = await fetch(`${API_BASE}/public/news?${usp.toString()}`, {
    method: "GET",
    signal,
  });

  const data = (await res.json().catch(() => null)) as PublicNewsListResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil berita.");

  return data as PublicNewsListResponse;
}

export async function getPublicPinnedNews({ signal, limit }: { signal?: AbortSignal; limit?: number } = {}) {
  assertBaseUrl();

  const usp = new URLSearchParams();
  usp.set("filter[isPinned.eq]", "true");
  if (typeof limit === "number") {
    usp.set("limit", String(limit));
  }

  const res = await fetch(`${API_BASE}/public/news?${usp.toString()}`, {
    method: "GET",
    signal,
  });

  const data = (await res.json().catch(() => null)) as PublicNewsListResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil berita pinned.");

  return data as PublicNewsListResponse;
}

export async function getPublicNewsBySlug(slug: string, init?: RequestInit) {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/public/news/slug/${encodeURIComponent(slug)}`, {
    method: "GET",
    ...init,
  });

  if (res.status === 404) {
    return null;
  }

  const data = (await res.json().catch(() => null)) as PublicNewsDetailResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil detail berita.");

  return data as PublicNewsDetailResponse;
}
