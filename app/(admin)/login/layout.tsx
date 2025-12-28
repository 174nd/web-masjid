import { Suspense } from "react";
import { LoginLayoutClient } from "@/features/admin/auth/components/login-layout-client";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LoginLayoutClient>{children}</LoginLayoutClient>
    </Suspense>
  );
}
