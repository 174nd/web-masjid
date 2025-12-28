import { ChangePasswordFormValues } from "../schemas/changePassword.schema";
import { LoginFormValues } from "../schemas/login.schema";

export type AdminUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type AuthMeResponse = {
  status: "success";
  data: AdminUser;
};

export type LoginResponse = {
  status: "success" | "error";
  data?: AdminUser;
  message: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function assertBaseUrl() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL belum diset (.env.local).");
}

export async function loginRequest(payload: LoginFormValues): Promise<LoginResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => null)) as LoginResponse | null;

  if (!res.ok) {
    throw new Error((data as any)?.message ?? "Login gagal.");
  }

  return data as LoginResponse;
}

export async function fetchAuthMe(): Promise<AuthMeResponse> {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/userinfo`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("NOT_AUTHENTICATED");
  }

  return res.json();
}

export async function logoutRequest() {
  assertBaseUrl();

  const res = await fetch(`${API_BASE}/logout`, {
    method: "GET",
    credentials: "include",
  });

  // tidak wajib strict
  return res.ok;
}

export async function changePasswordRequest(payload: ChangePasswordFormValues) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL belum diset.");

  const res = await fetch(`${baseUrl}/change-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message ?? "Change password gagal.");
  }

  return data as { status: "success"; message: string };
}
