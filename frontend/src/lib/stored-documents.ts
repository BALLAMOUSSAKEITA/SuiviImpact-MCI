import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "suiviimpact_access_token";
const REFRESH_TOKEN_KEY = "suiviimpact_refresh_token";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string };
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    return data.access_token;
  } catch {
    return null;
  }
}

export type StoredDocumentFetch = () => Promise<{ blob: Blob; filename: string }>;

async function fetchAuthedBlob(path: string, retry = true): Promise<{ blob: Blob; filename: string }> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, { headers });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { detail?: string }).detail ?? `Erreur (${response.status})`,
    );
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const filename = match?.[1] ?? "document";
  const blob = await response.blob();
  return { blob, filename };
}

export function fetchPlanificationPaoTdr(
  activiteId: number,
  inline = false,
): Promise<{ blob: Blob; filename: string }> {
  const q = inline ? "?inline=true" : "";
  return fetchAuthedBlob(`/api/v1/planification/pao/${activiteId}/tdr${q}`);
}

export function isInlineViewable(filename: string, mime?: string): boolean {
  if (mime?.startsWith("image/") || mime === "application/pdf") return true;
  return /\.(pdf|png|jpe?g|gif)$/i.test(filename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function openBlobInNewTab(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    URL.revokeObjectURL(url);
    throw new Error("Pop-up bloquée — autorisez les fenêtres ou téléchargez le fichier.");
  }
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

export async function openStoredDocument(fetchDoc: StoredDocumentFetch): Promise<void> {
  const { blob, filename } = await fetchDoc();
  if (!isInlineViewable(filename, blob.type)) {
    downloadBlob(blob, filename);
    toast.message("Ouverture directe indisponible — téléchargement lancé.");
    return;
  }
  openBlobInNewTab(blob, filename);
}

export async function downloadStoredDocument(fetchDoc: StoredDocumentFetch): Promise<void> {
  const { blob, filename } = await fetchDoc();
  downloadBlob(blob, filename);
}
