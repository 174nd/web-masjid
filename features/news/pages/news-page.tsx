import { Container } from "@/components/layout/container";
import { mockNews } from "@/data/mock-news";
import { NewsCarouselPinned } from "@/features/news/components/news-carousel-pinned";
import { NewsListPaginated } from "@/features/news/components/news-list-paginated";

export default function NewsPageClient() {
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
