import "@/components/textEditor.css";

import type { Metadata } from "next";

import { NewsDetailPage } from "@/features/news/pages/news-detail-page";
import {
  getPublicNewsBySlug,
  resolvePublicNewsCoverUrl,
  type PublicNewsDetail,
} from "@/features/public/api/public-news.api";
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from "@/lib/seo";

const fallbackTitle = "Detail Berita";
const fallbackDescription = "Berita dan update kegiatan Masjid Asy-Syuhada.";

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function ensureAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return toAbsoluteUrl(path);
}

function getTagNames(detail: PublicNewsDetail) {
  if (detail.tags && detail.tags.length > 0) {
    return detail.tags.map((tag) => tag.name);
  }
  if (detail.newsTags && detail.newsTags.length > 0) {
    return detail.newsTags.map((tag) => tag.tags?.name).filter(Boolean) as string[];
  }
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/news/${slug}`;

  try {
    const resp = await getPublicNewsBySlug(slug, { cache: "no-store" });
    const detail = resp?.data;
    if (!detail) {
      return {
        title: fallbackTitle,
        description: fallbackDescription,
        alternates: { canonical },
      };
    }

    const title = detail.title || fallbackTitle;
    const description =
      detail.description ||
      (detail.content ? stripHtml(detail.content).slice(0, 160) : "") ||
      fallbackDescription;
    const coverUrl = resolvePublicNewsCoverUrl(detail.coverUrl);
    const ogImage = coverUrl ? ensureAbsoluteUrl(coverUrl) : ensureAbsoluteUrl(DEFAULT_OG_IMAGE);
    const tags = getTagNames(detail);

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "article",
        url: toAbsoluteUrl(canonical),
        title,
        description,
        images: [{ url: ogImage, alt: title }],
        publishedTime: detail.createdAt,
        tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: { canonical },
      openGraph: {
        type: "article",
        url: toAbsoluteUrl(canonical),
        title: fallbackTitle,
        description: fallbackDescription,
        images: [{ url: ensureAbsoluteUrl(DEFAULT_OG_IMAGE), alt: fallbackTitle }],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
        images: [ensureAbsoluteUrl(DEFAULT_OG_IMAGE)],
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <NewsDetailPage slug={slug} />;
}
