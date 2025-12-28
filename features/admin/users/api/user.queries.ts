import { useQuery } from "@tanstack/react-query";
import { getUsers } from "./users.api";

export function useUsersQuery(params: { page: number; limit: number; q: string }) {
  return useQuery({
    queryKey: ["users", params.page, params.limit, params.q],
    queryFn: () => getUsers(params),
    staleTime: 30_000,
    retry: false,
  });
}
