import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, updateUser } from "./users.api";
import type { CreateUserPayload, UpdateUserPayload } from "./users.types";

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: number; payload: UpdateUserPayload }) => updateUser(vars.userId, vars.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
