import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getCurrentSlug,
  getPublicNewsBySlug,
  isRemotePublicUrl,
  resolvePublicNewsCoverUrl,
  type PublicNewsDetail,
} from "@/features/public/api/public-news.api";

function getTagNames(detail: PublicNewsDetail) {
  if (detail.tags && detail.tags.length > 0) {
    return detail.tags.map((tag) => tag.name);
  }
  if (detail.newsTags && detail.newsTags.length > 0) {
    return detail.newsTags.map((tag) => tag.tags?.name).filter(Boolean) as string[];
  }
  return [];
}

async function fetchNewsDetail(slug: string) {
  return getPublicNewsBySlug(slug, { cache: "no-store" });
}

export async function NewsDetailPage({ slug }: { slug: string }) {
  const resp = await fetchNewsDetail(slug);
  if (!resp?.data) {
    notFound();
  }

  const detail = resp.data;
  const coverUrl = resolvePublicNewsCoverUrl(detail.coverUrl);
  const tags = getTagNames(detail);
  const slugLabel = detail.slug ?? getCurrentSlug(detail.newsSlug);

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary">News</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{detail.title}</h1>
          </div>
          <Link
            href="/news"
            className={
              "relative pb-1 text-sm text-muted-foreground hover:text-foreground " +
              "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-primary " +
              "after:origin-right after:scale-x-0 after:transition-transform after:duration-300 " +
              "hover:after:origin-left hover:after:scale-x-100"
            }
          >
            Kembali ke News
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-background">
          {coverUrl ? (
            <div className="relative h-64 w-full md:h-96">
              <Image
                src={coverUrl}
                alt={detail.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
                unoptimized={isRemotePublicUrl(coverUrl)}
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/70 via-transparent to-transparent" />
            </div>
          ) : null}

          <div className="space-y-4 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(detail.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {slugLabel ? (
                <>
                  <span className="opacity-70">•</span>
                  <span>slug: {slugLabel}</span>
                </>
              ) : null}
              {detail.isPinned ? (
                <>
                  <span className="opacity-70">•</span>
                  <Badge variant="secondary">Pinned</Badge>
                </>
              ) : null}
            </div>

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {detail.description ? <p className="text-base text-muted-foreground">{detail.description}</p> : null}

            <Separator />

            {detail.content ? (
              <div className="text-editor__content tiptap preview text-base md:text-sm leading-5" dangerouslySetInnerHTML={{ __html: detail.content }} />
            ) : (
              <div className="text-sm text-muted-foreground">Konten berita belum tersedia.</div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
