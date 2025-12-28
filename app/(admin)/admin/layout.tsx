"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMeQuery } from "@/features/admin/auth/api/use-auth-me";
import { AdminPreloader } from "@/components/preloader/admin-preloader";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const meQuery = useAuthMeQuery();

  // Redirect kalau tidak login
  React.useEffect(() => {
    if (meQuery.isError) {
      const next = encodeURIComponent(pathname || "/admin");
      router.replace(`/login?next=${next}`);
    }
  }, [meQuery.isError, router, pathname]);

  // Loader tampil saat initial checking
  const showLoader = meQuery.isLoading;

  return (
    <>
      <AdminPreloader show={showLoader} />

      {/* Saat loading, konten bisa tetap kosong agar tidak “kedip” */}
      {!meQuery.isLoading && meQuery.data?.data ? <AdminShell>{children}</AdminShell> : null}
    </>
  );
}
