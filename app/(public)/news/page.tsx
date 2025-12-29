import type { Metadata } from "next";
import NewsPageClient from "@/features/news/pages/news-page";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const title = "News";
const description = "Berita dan update kegiatan Masjid Asy-Syuhada.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/news",
  },
  openGraph: {
    type: "website",
    url: "/news",
    title,
    description,
    images: [{ url: DEFAULT_OG_IMAGE, alt: "Masjid Asy-Syuhada" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function NewsPage() {
  return <NewsPageClient />;
}
