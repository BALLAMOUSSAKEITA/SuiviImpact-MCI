export interface HealthResponse {
  status: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`API indisponible (${response.status})`);
  }

  return response.json();
}

export { API_BASE_URL };
