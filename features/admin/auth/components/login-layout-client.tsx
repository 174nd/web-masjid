"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthMeQuery } from "@/features/admin/auth/api/use-auth-me";
import { AdminPreloader } from "@/components/preloader/admin-preloader";

export function LoginLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const meQuery = useAuthMeQuery();

  React.useEffect(() => {
    if (meQuery.data?.data) {
      router.replace(next);
    }
  }, [meQuery.data, router, next]);

  const showLoader = meQuery.isLoading;

  return (
    <>
      <AdminPreloader show={showLoader} />

      {/* Saat loading, konten bisa tetap kosong agar tidak “kedip” */}
      {!meQuery.isLoading && children}
    </>
  );
}
