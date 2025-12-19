import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { mockNews } from "@/data/mock-news";
import { NewsCarouselPinned } from "@/components/news/news-carousel-pinned";
import { NewsListPaginated } from "@/components/news/news-list-paginated";

export const metadata: Metadata = {
  title: "News",
  description: "Berita dan update kegiatan Masjid Asy-Syuhada.",
};

export default function NewsPage() {
  return (
    <main id="news-page" className="scroll-mt-24">
      <section className="py-10 md:py-14">
        <Container>
          <NewsCarouselPinned items={mockNews} intervalMs={6000} />
        </Container>
      </section>

      <section className="pb-12 md:pb-16">
        <Container>
          <NewsListPaginated items={mockNews} pageSize={9} />
        </Container>
      </section>
    </main>
  );
}
