import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "./auth.api";
import { useRouter } from "next/navigation";

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: async () => {
      // 1) hapus cache user
      qc.removeQueries({ queryKey: ["auth", "me"], exact: true });

      // 2) optional: clear semua cache admin agar tidak “nempel”
      // qc.clear();

      // 3) redirect login
      router.replace("/login");
    },
  });
}
