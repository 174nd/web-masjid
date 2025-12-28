import type { CreateUserPayload, UpdateUserPayload, UserItem, UsersResponse } from "./users.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function assertBaseUrl() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum diset.");
}

export async function getUsers(params: { page: number; limit: number; q?: string }) {
  assertBaseUrl();

  const usp = new URLSearchParams();
  usp.set("page", String(params.page));
  usp.set("limit", String(params.limit));
  if (params.q?.trim()) usp.set("q", params.q.trim());

  const res = await fetch(`${API_BASE}/users?${usp.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as UsersResponse | null;
  if (!res.ok) throw new Error((data as any)?.message ?? "Gagal mengambil users.");

  return data as UsersResponse;
}

export async function createUser(payload: CreateUserPayload) {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Gagal membuat user.");

  return data as { status: "success"; data: UserItem; message: string };
}

export async function updateUser(userId: number, payload: UpdateUserPayload) {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Gagal update user.");

  return data as { status: "success"; data: UserItem; message: string };
}

export async function deleteUser(userId: number) {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? "Gagal hapus user.");

  return data as { status: "success"; data: { id: number }; message: string };
}
