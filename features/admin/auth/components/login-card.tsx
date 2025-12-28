"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { loginRequest, LoginResponse } from "../api/auth.api";

export function AdminLoginCard() {
  const qc = useQueryClient();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async (_resp: LoginResponse) => {
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Berhasil masuk!");
      router.push("/admin");
    },
  });

  const form = useForm({
    validationLogic: revalidateLogic(),
    defaultValues: {} as LoginFormValues,
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => loginMutation.mutate(value),
  });

  return (
    <div className="relative min-h-100svh w-full overflow-hidden">
      {/* background full page */}
      <div className="absolute inset-0">
        <Image src="/images/admin-bg.jpg" alt="Background" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* center content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-4xl overflow-hidden py-0">
          <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-130">
            <div className="relative order-1 h-40 md:order-2 md:h-auto">
              <Image src="/images/masjid-login.jpg" alt="Masjid" fill priority className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
              <div className="absolute inset-0 bg-linear-to-tr from-black/35 via-transparent to-black/10" />

              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center p-4 text-center",
                  "md:inset-auto md:bottom-0 md:left-0 md:right-0 md:items-end md:justify-start md:p-6 md:text-left"
                )}
              >
                <div className="w-fit rounded-lg bg-black/35 px-4 py-3 text-white backdrop-blur md:w-full">
                  <div className="text-sm font-semibold">Panel Admin</div>
                  <div className="text-xs opacity-90">Kelola berita, cashflow, jadwal, dan informasi publik.</div>
                </div>
              </div>
            </div>

            {/* FORM PANEL */}
            <div className="order-2 flex flex-col justify-center p-6 md:order-1 md:p-10">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-xl">Admin Login</CardTitle>
                <CardDescription>Masuk untuk mengelola konten masjid.</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {loginMutation.isError ? (
                  <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {(loginMutation.error as Error)?.message ?? "Login gagal"}
                  </div>
                ) : null}

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  {/* username */}
                  <form.Field name="username">
                    {(field) => {
                      const errorMessage = field.state.meta.errors?.[0];
                      return (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Username</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="text"
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            value={(field.state.value ?? "") as string}
                            placeholder="username"
                            autoComplete="username"
                          />
                          {errorMessage ? <p className="text-xs text-destructive">{errorMessage.message}</p> : null}
                        </div>
                      );
                    }}
                  </form.Field>

                  {/* password + toggle eye */}
                  <form.Field name="password">
                    {(field) => {
                      const errorMessage = field.state.meta.errors?.[0];
                      const inputId = field.name;

                      return (
                        <div className="space-y-2">
                          <Label htmlFor={inputId}>Password</Label>

                          <div className="relative">
                            <Input
                              id={inputId}
                              name={inputId}
                              type={showPassword ? "text" : "password"}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              value={(field.state.value ?? "") as string}
                              placeholder={showPassword ? "Password" : "••••••••"}
                              autoComplete="current-password"
                              // space untuk tombol mata
                              className="pr-10"
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>

                          {errorMessage ? <p className="text-xs text-destructive">{errorMessage.message}</p> : null}
                        </div>
                      );
                    }}
                  </form.Field>

                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
