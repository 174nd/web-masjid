import { z } from "zod";

export const USER_ROLES = ["SuperAdmin", "Admin"] as const;

const baseUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Email must be valid" }),
  role: z.enum(USER_ROLES, { message: "Role tidak valid" }),
  isActive: z.boolean(),
});

// ✅ CREATE: password wajib
export const createUserSchema = baseUserSchema
  .extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Confirm password must match new password",
        path: ["confirmPassword"],
      });
    }
  });

// ✅ UPDATE: password optional (kalau diisi harus lengkap & match)
export const updateUserSchema = baseUserSchema
  .extend({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    const p = (password ?? "").trim();
    const c = (confirmPassword ?? "").trim();

    if (!p && !c) return;

    if (!p) {
      ctx.addIssue({ code: "custom", message: "Password is required", path: ["password"] });
      return;
    }
    if (!c) {
      ctx.addIssue({ code: "custom", message: "Confirm password is required", path: ["confirmPassword"] });
      return;
    }
    if (p.length < 6) {
      ctx.addIssue({ code: "custom", message: "Password must be at least 6 characters", path: ["password"] });
    }
    if (c.length < 6) {
      ctx.addIssue({ code: "custom", message: "Password must be at least 6 characters", path: ["confirmPassword"] });
    }
    if (p !== c) {
      ctx.addIssue({
        code: "custom",
        message: "Confirm password must match new password",
        path: ["confirmPassword"],
      });
    }
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
