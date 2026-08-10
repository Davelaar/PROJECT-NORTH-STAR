"use client";

export type StoredAuth = {
  token: string;
  user: { uuid: string; username: string; role: string; trustScore?: number };
};

const KEY = "of_auth";

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function authToken(): string | undefined {
  return loadAuth()?.token;
}
