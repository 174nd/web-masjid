"use client";

import * as React from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { EyeOff, Eye } from "lucide-react";

import { CreateUserValues, USER_ROLES, UpdateUserValues, createUserSchema, updateUserSchema } from "../schema/user.schema";
import { useCreateUser, useUpdateUser } from "../api/users.mutations";
import type { UserItem } from "../api/users.types";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export function UserFormDialog({
  mode,
  user,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  user?: UserItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const defaultValues = {
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "Admin",
    password: "",
    confirmPassword: "",
    isActive: user?.isActive ?? true,
  };

  const form = useForm({
    validationLogic: revalidateLogic(),
    defaultValues: mode === "create" ? (defaultValues as CreateUserValues) : (defaultValues as UpdateUserValues),
    validators: { onSubmit: mode === "create" ? createUserSchema : updateUserSchema },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        // CREATE: password wajib, kirim semua
        await createMutation.mutateAsync(value as CreateUserValues);
        toast.success("User berhasil dibuat.");
      } else if (mode === "edit" && user) {
        // EDIT: password OPTIONAL
        const payload: Partial<UpdateUserValues> = {
          name: value.name,
          username: value.username,
          email: value.email,
          role: value.role,
          isActive: value.isActive,
        };

        const password = value.password?.trim();
        const confirmPassword = value.confirmPassword?.trim();

        // hanya kirim password jika user memang mengisi
        if (password || confirmPassword) {
          payload.password = password;
          payload.confirmPassword = confirmPassword;
        }

        await updateMutation.mutateAsync({
          userId: user.id,
          payload,
        });

        toast.success("User berhasil diperbarui.");
      }

      onOpenChange(false);
      form.reset();
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah User" : "Edit User"}</DialogTitle>
          <DialogDescription>{mode === "create" ? "Isi data untuk membuat user baru." : "Perbarui data user."}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="flex gap-4 w-full md:flex-row flex-col">
            {/* Name */}
            <form.Field name="name">
              {(field) => (
                <div className="space-y-1 w-full">
                  <Label>Nama</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={"text"}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={(field.state.value ?? "") as string}
                    placeholder={"Nama"}
                  />
                  {field.state.meta.errors?.[0] && <p className="text-xs text-destructive">{field.state.meta.errors[0].message}</p>}
                </div>
              )}
            </form.Field>

            {/* Username */}
            <form.Field name="username">
              {(field) => (
                <div className="space-y-1 w-full">
                  <Label>Username</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={"text"}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={(field.state.value ?? "") as string}
                    placeholder={"Username"}
                  />
                  {field.state.meta.errors?.[0] && <p className="text-xs text-destructive">{field.state.meta.errors[0].message}</p>}
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex gap-4 w-full md:flex-row flex-col">
            {/* Email */}
            <form.Field name="email">
              {(field) => (
                <div className="space-y-1 w-full">
                  <Label>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={"email"}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    value={(field.state.value ?? "") as string}
                    placeholder={"Email"}
                  />
                  {field.state.meta.errors?.[0] && <p className="text-xs text-destructive">{field.state.meta.errors[0].message}</p>}
                </div>
              )}
            </form.Field>

            {/* Role */}
            <form.Field name="role">
              {(field) => {
                const err = field.state.meta.errors?.[0];
                return (
                  <div className="space-y-1 w-full">
                    <Label>Role</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as any)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {err ? <p className="text-xs text-destructive">{err.message}</p> : null}
                  </div>
                );
              }}
            </form.Field>
          </div>

          <div className="flex gap-4 w-full md:flex-row flex-col">
            <form.Field name="password">
              {(field) => {
                const err = field.state.meta.errors?.[0];
                return (
                  <div className="space-y-1 w-full">
                    <Label htmlFor={field.name}>
                      Password {mode === "edit" && <span className="text-xs text-muted-foreground">(optional)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        value={(field.state.value ?? "") as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                        autoComplete="password"
                        placeholder={showPassword ? "Password" : "••••••••"}
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
                    {err ? <p className="text-xs text-destructive">{err.message}</p> : null}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => {
                const err = field.state.meta.errors?.[0];
                return (
                  <div className="space-y-1 w-full">
                    <Label htmlFor={field.name}>
                      Confirm Password {mode === "edit" && <span className="text-xs text-muted-foreground">(optional)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showConfirmPassword ? "text" : "password"}
                        value={(field.state.value ?? "") as string}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                        autoComplete="new-password"
                        placeholder={showPassword ? "Confirm Password" : "••••••••"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {err ? <p className="text-xs text-destructive">{err?.message}</p> : null}
                  </div>
                );
              }}
            </form.Field>
          </div>

          {/* Active checkbox (card style) */}
          <form.Field name="isActive">
            {(field) => (
              <Label
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50",
                  "has-aria-checked:border-primary has-aria-checked:bg-primary/10"
                )}
              >
                <Checkbox
                  checked={field.state.value}
                  onCheckedChange={(v) => field.handleChange(Boolean(v))}
                  className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                />
                <div className="grid gap-1.5">
                  <p className="text-sm font-medium">User Aktif</p>
                  <p className="text-xs text-muted-foreground">User aktif dapat login ke sistem.</p>
                </div>
              </Label>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
