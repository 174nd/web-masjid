import { z } from "zod";

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  })
  .superRefine(({ oldPassword, newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Confirm password must match new password",
        path: ["confirmPassword"],
      });
    }

    if (oldPassword === newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New password must be different from old password",
        path: ["newPassword"],
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
