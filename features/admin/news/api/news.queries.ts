import { useQuery } from "@tanstack/react-query";
import { getNewsDetail, getNewsList, getNewsTags } from "./news.api";
import type { NewsListParams } from "./news.types";

export function useNewsListQuery(params: NewsListParams) {
  return useQuery({
    queryKey: ["admin", "news", "list", params],
    queryFn: () => getNewsList(params),
    retry: false,
    staleTime: 30_000,
  });
}

export function useNewsTagsQuery() {
  return useQuery({
    queryKey: ["admin", "news", "tags"],
    queryFn: getNewsTags,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useNewsDetailQuery(newsId: number | null) {
  return useQuery({
    queryKey: ["admin", "news", "detail", newsId],
    queryFn: () => getNewsDetail(newsId as number),
    enabled: newsId !== null,
    retry: false,
    staleTime: 30_000,
  });
}
