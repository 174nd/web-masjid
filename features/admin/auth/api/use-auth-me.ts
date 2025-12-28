import { useQuery } from "@tanstack/react-query";
import { fetchAuthMe } from "./auth.api";

export function useAuthMeQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
    retry: false,
  });
}
