import { NewsPreviewPage } from "@/features/admin/news/components/news-preview-page";

export default function Page({ params }: { params: { id: string } }) {
  const parsedId = Number(params.id);
  const newsId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;

  return <NewsPreviewPage newsId={newsId} />;
}
