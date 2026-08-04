import type {
  LoginRequest,
  TokenResponse,
  User,
  UserCreate,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "suiviimpact_access_token";
const REFRESH_TOKEN_KEY = "suiviimpact_refresh_token";

export interface HealthResponse {
  status: string;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: TokenResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const tokens: TokenResponse = await response.json();
  setTokens(tokens);
  return tokens.access_token;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail ?? `Erreur API (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    throw new Error(`API indisponible (${response.status})`);
  }
  return response.json();
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const tokens = await apiFetch<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }, false);
  setTokens(tokens);
  return tokens;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch<void>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // ignore logout errors
    }
  }
  clearTokens();
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me");
}

export async function listUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/v1/users");
}

export async function createUser(data: UserCreate): Promise<User> {
  return apiFetch<User>("/api/v1/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function activateUser(id: number): Promise<User> {
  return apiFetch<User>(`/api/v1/users/${id}/activate`, { method: "PATCH" });
}

export async function deactivateUser(id: number): Promise<User> {
  return apiFetch<User>(`/api/v1/users/${id}/deactivate`, { method: "PATCH" });
}

export async function deleteUser(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/users/${id}`, { method: "DELETE" });
}

export { API_BASE_URL };
