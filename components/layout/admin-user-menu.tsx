"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { ChevronUp, KeyRound, LogOut, User, Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { useAuthMeQuery } from "@/features/admin/auth/api/use-auth-me";
import { useLogout } from "@/features/admin/auth/api/use-logout";
import { ChangePasswordFormValues, changePasswordSchema } from "@/features/admin/auth/schemas/changePassword.schema";
import { changePasswordRequest } from "@/features/admin/auth/api/auth.api";
import { toast } from "react-toastify";

export function AdminUserMenu({ collapsed }: { collapsed: boolean }) {
  const { data } = useAuthMeQuery();
  const user = data?.data;

  const [openMenu, setOpenMenu] = React.useState(false);
  const [openChangePassword, setOpenChangePassword] = React.useState(false);

  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    setOpenMenu(false);
  }, [collapsed]);

  // close dropdown panel on outside click
  React.useEffect(() => {
    if (!openMenu) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-admin-user-menu-root]")) setOpenMenu(false);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openMenu]);

  const initials = (user?.name || "A")
    .split(" ")
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");

  const logout = useLogout();
  const onLogout = () => logout.mutate();

  // TanStack Query mutation (mock)
  const changePasswordMutation = useMutation({
    mutationFn: changePasswordRequest,
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal mengubah password."),
    onSuccess: () => {
      toast.success("Password berhasil diubah.");
      setOpenChangePassword(false);
    },
  });

  // TanStack Form
  const changePasswordForm = useForm({
    validationLogic: revalidateLogic(),
    defaultValues: {} as ChangePasswordFormValues,
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => await changePasswordMutation.mutateAsync(value),
  });

  const openChangePasswordDialog = () => {
    setOpenMenu(false);

    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);

    changePasswordForm.reset();
    changePasswordMutation.reset();

    setOpenChangePassword(true);
  };

  return (
    <div className="relative" data-admin-user-menu-root>
      {/* Panel detail user (smooth) */}
      <AnimatePresence initial={false}>
        {openMenu ? (
          <motion.div
            key="user-panel"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="absolute bottom-14 left-0 z-20 w-65"
          >
            <Card className="p-3 shadow-md gap-0">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-semibold">{initials}</div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">{user?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.username ?? "-"}</div>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <Button type="button" variant="outline" className="w-full justify-start gap-2" onClick={openChangePasswordDialog}>
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Button>

                <Button type="button" variant="destructive" className="w-full justify-start gap-2" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Compact user card */}
      <button
        type="button"
        onClick={() => setOpenMenu((v) => !v)}
        className={cn(
          "w-full rounded-md border bg-background hover:bg-muted transition-colors",
          "flex items-center gap-3 px-3 py-2 text-left",
          collapsed && "justify-center px-2"
        )}
        aria-label="User menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted font-semibold">
          {collapsed ? <User className="h-4 w-4" /> : initials}
        </div>

        {!collapsed ? (
          <>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium leading-tight truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.username ?? "-"}</div>
            </div>

            <ChevronUp className={cn("h-4 w-4 text-muted-foreground transition-transform", openMenu && "rotate-180")} />
          </>
        ) : null}
      </button>

      {/* Change Password Dialog */}
      <Dialog open={openChangePassword} onOpenChange={setOpenChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Ubah password untuk akun admin Anda. Ini contoh mock menggunakan TanStack Form + TanStack Query.</DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              changePasswordForm.handleSubmit();
            }}
          >
            <changePasswordForm.Field name="oldPassword">
              {(field) => {
                const err = field.state.meta.errors?.[0];
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Current Password</Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showCurrent ? "text" : "password"}
                        value={(field.state.value ?? "") as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        onClick={() => setShowCurrent((v) => !v)}
                        aria-label={showCurrent ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {err ? <p className="text-xs text-destructive">{err.message}</p> : null}
                  </div>
                );
              }}
            </changePasswordForm.Field>

            <changePasswordForm.Field name="newPassword">
              {(field) => {
                const err = field.state.meta.errors?.[0];
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>New Password</Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showNew ? "text" : "password"}
                        value={(field.state.value ?? "") as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                        autoComplete="new-password"
                        placeholder={showNew ? "New Password" : "••••••••"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        onClick={() => setShowNew((v) => !v)}
                        aria-label={showNew ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {err ? <p className="text-xs text-destructive">{err.message}</p> : null}
                  </div>
                );
              }}
            </changePasswordForm.Field>

            <changePasswordForm.Field name="confirmPassword">
              {(field) => {
                const err = field.state.meta.errors?.[0];
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showConfirm ? "text" : "password"}
                        value={(field.state.value ?? "") as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                        autoComplete="new-password"
                        placeholder={showConfirm ? "Confirm New Password" : "••••••••"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {err ? <p className="text-xs text-destructive">{err.message}</p> : null}
                  </div>
                );
              }}
            </changePasswordForm.Field>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenChangePassword(false)} disabled={changePasswordMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
