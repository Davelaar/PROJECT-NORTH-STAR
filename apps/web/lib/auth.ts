"use client";

export type StoredAuth = {
  user: { uuid: string; username: string; role: string; trustScore?: number };
  token?: string;
};

const KEY = "of_auth";

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed.token) {
      delete parsed.token;
      localStorage.setItem(KEY, JSON.stringify(parsed));
    }
    localStorage.removeItem("of_token");
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth) {
  localStorage.setItem(KEY, JSON.stringify({ user: auth.user }));
  localStorage.removeItem("of_token");
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("of_token");
}

export function authToken(): string | undefined {
  return undefined;
}
