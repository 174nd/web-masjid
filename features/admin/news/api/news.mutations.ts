import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNews, deleteNews, updateNews } from "./news.api";
import type { CreateNewsPayload, UpdateNewsPayload } from "./news.types";

export function useCreateNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNewsPayload) => createNews(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "news", "list"] });
    },
  });
}

export function useUpdateNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { newsId: number; payload: UpdateNewsPayload }) => updateNews(vars.newsId, vars.payload),
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ["admin", "news", "list"] });
      await qc.invalidateQueries({ queryKey: ["admin", "news", "detail", vars.newsId] });
    },
  });
}

export function useDeleteNewsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newsId: number) => deleteNews(newsId),
    onSuccess: async (_data, newsId) => {
      await qc.invalidateQueries({ queryKey: ["admin", "news", "list"] });
      await qc.removeQueries({ queryKey: ["admin", "news", "detail", newsId] });
    },
  });
}
