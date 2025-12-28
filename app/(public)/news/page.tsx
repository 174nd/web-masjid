import type { Metadata } from "next";
import NewsPageClient from "@/features/news/pages/news-page";

export const metadata: Metadata = {
  title: "News",
  description: "Berita dan update kegiatan Masjid Asy-Syuhada.",
};

export default function NewsPage() {
  return <NewsPageClient />;
}
