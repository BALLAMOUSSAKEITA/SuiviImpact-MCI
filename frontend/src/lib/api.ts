import type {

  Activite,

  ActiviteCreate,

  ActiviteStats,

  ArchiveRoot,

  Dossier,

  DossierContent,

  ExecutionStats,

  ExportType,

  FichierArchive,

  Indicateur,

  IndicateurCreate,

  IndicateurUpdate,

  LoginRequest,

  Mission,

  MissionCreate,

  MissionUpdate,

  ModuleListResponse,

  Objectif,

  ObjectifCreate,

  TachePlan,

  TachePlanCreate,

  Direction,

  DirectionCreate,

  DirectionUpdate,

  MinistreParametrage,

  MinistreParametrageUpdate,

  PlanificationActivite,

  PlanificationPaoActivite,

  PlanificationPaoCreate,

  PlanificationProjetCreate,

  PlanificationProjetPlan,

  Ppm,

  PpmCreate,

  PpmStats,

  PpmUpdate,

  Projet,

  ProjetCreate,

  ProjetStats,

  ProjetUpdate,

  Recommandation,

  RecommandationCreate,

  RecommandationUpdate,

  SuiviActivite,

  Tache,

  TacheCreate,

  TacheDetails,

  TacheUpdate,

  TokenResponse,

  User,

  PasswordChange,

  ProfileUpdate,

  UserCreate,

  UserCreateResponse,

} from "@/types";

import { appendStatsPeriodToSearch, yearToDateRange } from "@/lib/stats-period";
import { DEFAULT_ANNEE, type PaoExportOptions, type StatsPeriodParams } from "@/types";

import { messageFromFailedResponse } from "./api-errors";



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



function buildAuthHeaders(options: RequestInit, body?: BodyInit | null): Headers {

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && body && !(body instanceof FormData)) {

    headers.set("Content-Type", "application/json");

  }

  const token = getAccessToken();

  if (token) {

    headers.set("Authorization", `Bearer ${token}`);

  }

  return headers;

}



async function handleResponse<T>(response: Response): Promise<T> {

  if (!response.ok) {

    const error = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    throw new Error(messageFromFailedResponse(error, response.status));

  }

  if (response.status === 204) {

    return undefined as T;

  }

  return response.json();

}



export async function apiFetch<T>(

  path: string,

  options: RequestInit = {},

  retry = true,

): Promise<T> {

  const headers = buildAuthHeaders(options, options.body);



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



  return handleResponse<T>(response);

}



async function apiFetchFormData<T>(

  path: string,

  formData: FormData,

  method = "POST",

  retry = true,

): Promise<T> {

  const headers = buildAuthHeaders({});



  let response = await fetch(`${API_BASE_URL}${path}`, {

    method,

    headers,

    body: formData,

  });



  if (response.status === 401 && retry) {

    const newToken = await refreshAccessToken();

    if (newToken) {

      headers.set("Authorization", `Bearer ${newToken}`);

      response = await fetch(`${API_BASE_URL}${path}`, {

        method,

        headers,

        body: formData,

      });

    }

  }



  return handleResponse<T>(response);

}



async function apiFetchBlob(

  path: string,

  retry = true,

  defaultFilename = "export.xlsx",

): Promise<{ blob: Blob; filename: string }> {

  const headers = buildAuthHeaders({});



  let response = await fetch(`${API_BASE_URL}${path}`, { headers });



  if (response.status === 401 && retry) {

    const newToken = await refreshAccessToken();

    if (newToken) {

      headers.set("Authorization", `Bearer ${newToken}`);

      response = await fetch(`${API_BASE_URL}${path}`, { headers });

    }

  }



  if (!response.ok) {

    const error = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    throw new Error(messageFromFailedResponse(error, response.status));

  }



  const disposition = response.headers.get("Content-Disposition") ?? "";

  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i);

  const filename = match?.[1]?.trim() ?? defaultFilename;

  const blob = await response.blob();

  return { blob, filename };

}



function triggerDownload(blob: Blob, filename: string): void {

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);

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

  const tokens = await apiFetch<TokenResponse>(

    "/api/v1/auth/login",

    { method: "POST", body: JSON.stringify(data) },

    false,

  );

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



export async function updateProfile(data: ProfileUpdate): Promise<User> {

  return apiFetch<User>("/api/v1/auth/me", {

    method: "PATCH",

    body: JSON.stringify(data),

  });

}



export async function uploadProfileAvatar(file: File): Promise<User> {

  const formData = new FormData();

  formData.append("file", file);

  return apiFetchFormData<User>("/api/v1/auth/me/avatar", formData, "POST");

}



export async function fetchMyAvatarBlob(): Promise<Blob> {

  const headers = buildAuthHeaders({});

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me/avatar`, { headers });

  if (!response.ok) {

    throw new Error("Photo introuvable");

  }

  return response.blob();

}



export async function listUsers(): Promise<User[]> {

  return apiFetch<User[]>("/api/v1/users");

}



export async function changePassword(data: PasswordChange): Promise<void> {
  await apiFetch<void>("/api/v1/auth/me/password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}



export async function createUser(data: UserCreate): Promise<UserCreateResponse> {

  return apiFetch<UserCreateResponse>("/api/v1/users", {

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



export async function listDirections(): Promise<Direction[]> {
  return apiFetch<Direction[]>("/api/v1/directions");
}

export async function createDirection(data: DirectionCreate): Promise<Direction> {
  return apiFetch<Direction>("/api/v1/directions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDirection(
  id: number,
  data: DirectionUpdate,
): Promise<Direction> {
  return apiFetch<Direction>(`/api/v1/directions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDirection(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/directions/${id}`, { method: "DELETE" });
}

export async function getMinistreParametrage(): Promise<MinistreParametrage> {
  return apiFetch<MinistreParametrage>("/api/v1/parametrage/ministre");
}

export async function updateMinistreParametrage(
  data: MinistreParametrageUpdate,
): Promise<MinistreParametrage> {
  return apiFetch<MinistreParametrage>("/api/v1/parametrage/ministre", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}



export async function listObjectifs(): Promise<Objectif[]> {
  return apiFetch<Objectif[]>("/api/v1/objectifs");
}



export async function createObjectif(data: ObjectifCreate): Promise<Objectif> {

  return apiFetch<Objectif>("/api/v1/objectifs", {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateObjectif(

  id: number,

  data: Partial<Pick<Objectif, "code" | "description">>,

): Promise<Objectif> {

  return apiFetch<Objectif>(`/api/v1/objectifs/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteObjectif(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/objectifs/${id}`, { method: "DELETE" });

}



export async function listTachesPlan(): Promise<TachePlan[]> {
  return apiFetch<TachePlan[]>("/api/v1/taches-plan");
}



export async function createTachePlan(data: TachePlanCreate): Promise<TachePlan> {
  return apiFetch<TachePlan>("/api/v1/taches-plan", {
    method: "POST",
    body: JSON.stringify(data),
  });
}



export async function updateTachePlan(
  id: number,
  data: Partial<Pick<TachePlan, "code" | "description">>,
): Promise<TachePlan> {
  return apiFetch<TachePlan>(`/api/v1/taches-plan/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}



export async function deleteTachePlan(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/taches-plan/${id}`, { method: "DELETE" });
}



export async function listActivites(objectifId: number): Promise<Activite[]> {

  return apiFetch<Activite[]>(`/api/v1/objectifs/${objectifId}/activites`);

}



export async function createActivite(

  objectifId: number,

  data: ActiviteCreate,

): Promise<Activite> {

  return apiFetch<Activite>(`/api/v1/objectifs/${objectifId}/activites`, {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateActivite(

  id: number,

  data: Partial<ActiviteCreate>,

): Promise<Activite> {

  return apiFetch<Activite>(`/api/v1/activites/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteActivite(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/activites/${id}`, { method: "DELETE" });

}



// --- Planification ---



export async function listPlanificationPao(): Promise<PlanificationPaoActivite[]> {
  return apiFetch<PlanificationPaoActivite[]>("/api/v1/planification/pao");
}



export async function createPlanificationPao(
  data: PlanificationPaoCreate,
  tdr?: File | null,
): Promise<PlanificationPaoActivite> {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(data));
  if (tdr) {
    formData.append("tdr", tdr);
  }
  return apiFetchFormData<PlanificationPaoActivite>(
    "/api/v1/planification/pao",
    formData,
  );
}

export async function updatePlanificationPao(
  activiteId: number,
  data: PlanificationPaoCreate,
  tdr?: File | null,
): Promise<PlanificationPaoActivite> {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(data));
  if (tdr) {
    formData.append("tdr", tdr);
  }
  return apiFetchFormData<PlanificationPaoActivite>(
    `/api/v1/planification/pao/${activiteId}`,
    formData,
    "PUT",
  );
}



export async function listPlanificationProjet(): Promise<PlanificationProjetPlan[]> {
  return apiFetch<PlanificationProjetPlan[]>("/api/v1/planification/projet");
}



export async function createPlanificationProjet(
  data: PlanificationProjetCreate,
): Promise<PlanificationProjetPlan> {
  return apiFetch<PlanificationProjetPlan>("/api/v1/planification/projet", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlanificationProjet(
  planifId: number,
  data: PlanificationProjetCreate,
): Promise<PlanificationProjetPlan> {
  return apiFetch<PlanificationProjetPlan>(`/api/v1/planification/projet/${planifId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}



export async function toggleSuiviProjetActivite(
  activiteId: number,
  rapport?: File | null,
): Promise<{ id: number; terminee: boolean; rapport_nom_original: string | null }> {
  const formData = new FormData();
  if (rapport) {
    formData.append("rapport", rapport);
  }
  return apiFetchFormData<{ id: number; terminee: boolean; rapport_nom_original: string | null }>(
    `/api/v1/suivi/projet/activite/${activiteId}/toggle`,
    formData,
  );
}



export async function getPlanification(

  annee: number,

  trimestre: number,

  direction?: string,

): Promise<PlanificationActivite[]> {

  const params = new URLSearchParams();

  if (direction) params.set("direction", direction);

  const query = params.toString() ? `?${params.toString()}` : "";

  return apiFetch<PlanificationActivite[]>(

    `/api/v1/planification/${annee}/${trimestre}${query}`,

  );

}



export async function listTaches(

  activiteId: number,

  trimestre: number,

  annee = DEFAULT_ANNEE,

): Promise<Tache[]> {

  return apiFetch<Tache[]>(

    `/api/v1/activites/${activiteId}/taches?trimestre=${trimestre}&annee=${annee}`,

  );

}



export async function createTache(

  activiteId: number,

  data: TacheCreate,

): Promise<Tache> {

  return apiFetch<Tache>(`/api/v1/activites/${activiteId}/taches`, {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateTache(

  tacheId: number,

  data: TacheUpdate,

): Promise<Tache> {

  return apiFetch<Tache>(`/api/v1/taches/${tacheId}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteTache(tacheId: number): Promise<void> {

  return apiFetch<void>(`/api/v1/taches/${tacheId}`, { method: "DELETE" });

}



// --- Suivi ---



export async function getSuivi(

  annee: number,

  trimestre: number,

  direction?: string,

): Promise<SuiviActivite[]> {

  const params = new URLSearchParams();

  if (direction) params.set("direction", direction);

  const query = params.toString() ? `?${params.toString()}` : "";

  return apiFetch<SuiviActivite[]>(

    `/api/v1/suivi/${annee}/${trimestre}${query}`,

  );

}



export async function listTachesSuivi(

  annee: number,

  trimestre: number,

  activiteId: number,

): Promise<Tache[]> {

  return apiFetch<Tache[]>(

    `/api/v1/suivi/${annee}/${trimestre}/activites/${activiteId}/taches`,

  );

}



export async function finaliserTache(

  tacheId: number,

  data: { observation?: string; fichier?: File },

): Promise<TacheDetails> {

  const formData = new FormData();

  if (data.observation) formData.append("observation", data.observation);

  if (data.fichier) formData.append("fichier", data.fichier);

  return apiFetchFormData<TacheDetails>(

    `/api/v1/taches/${tacheId}/finaliser`,

    formData,

  );

}



export async function getTacheDetails(tacheId: number): Promise<TacheDetails> {

  return apiFetch<TacheDetails>(`/api/v1/taches/${tacheId}/details`);

}



// --- Recommandations (RCC) ---



export async function listRecommandations(params?: {

  trimestre?: number;

  annee?: number;

  statut?: string;

}): Promise<ModuleListResponse<Recommandation>> {

  const search = new URLSearchParams();

  if (params?.trimestre) search.set("trimestre", String(params.trimestre));

  if (params?.annee) search.set("annee", String(params.annee));

  if (params?.statut) search.set("statut", params.statut);

  const query = search.toString() ? `?${search.toString()}` : "";

  return apiFetch<ModuleListResponse<Recommandation>>(

    `/api/v1/recommandations${query}`,

  );

}



export async function createRecommandation(

  data: RecommandationCreate,

): Promise<Recommandation> {

  return apiFetch<Recommandation>("/api/v1/recommandations", {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateRecommandation(

  id: number,

  data: RecommandationUpdate,

): Promise<Recommandation> {

  return apiFetch<Recommandation>(`/api/v1/recommandations/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteRecommandation(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/recommandations/${id}`, {

    method: "DELETE",

  });

}



export async function finaliserRecommandation(

  id: number,

): Promise<Recommandation> {

  return apiFetch<Recommandation>(

    `/api/v1/recommandations/${id}/finaliser`,

    { method: "PATCH" },

  );

}



// --- Missions ---



export async function listMissions(params?: {

  trimestre?: number;

  annee?: number;

  statut?: string;

}): Promise<ModuleListResponse<Mission>> {

  const search = new URLSearchParams();

  if (params?.trimestre) search.set("trimestre", String(params.trimestre));

  if (params?.annee) search.set("annee", String(params.annee));

  if (params?.statut) search.set("statut", params.statut);

  const query = search.toString() ? `?${search.toString()}` : "";

  return apiFetch<ModuleListResponse<Mission>>(

    `/api/v1/missions${query}`,

  );

}



export async function createMission(data: MissionCreate): Promise<Mission> {

  return apiFetch<Mission>("/api/v1/missions", {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateMission(

  id: number,

  data: MissionUpdate,

): Promise<Mission> {

  return apiFetch<Mission>(`/api/v1/missions/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteMission(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/missions/${id}`, { method: "DELETE" });

}



export async function finaliserMission(id: number): Promise<Mission> {

  return apiFetch<Mission>(`/api/v1/missions/${id}/finaliser`, {

    method: "PATCH",

  });

}



// --- PPM ---



export async function listPpm(params?: {

  type?: string;

  statut?: string;

}): Promise<Ppm[]> {

  const search = new URLSearchParams();

  if (params?.type) search.set("type", params.type);

  if (params?.statut) search.set("statut", params.statut);

  const query = search.toString() ? `?${search.toString()}` : "";

  return apiFetch<Ppm[]>(`/api/v1/ppm${query}`);

}



export async function createPpm(data: PpmCreate): Promise<Ppm> {

  return apiFetch<Ppm>("/api/v1/ppm", {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updatePpm(id: number, data: PpmUpdate): Promise<Ppm> {

  return apiFetch<Ppm>(`/api/v1/ppm/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deletePpm(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/ppm/${id}`, { method: "DELETE" });

}



// --- Projets ---



export async function listProjets(statut?: string): Promise<Projet[]> {

  const query = statut ? `?statut=${statut}` : "";

  return apiFetch<Projet[]>(`/api/v1/projets${query}`);

}



export async function createProjet(data: ProjetCreate): Promise<Projet> {

  return apiFetch<Projet>("/api/v1/projets", {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateProjet(

  id: number,

  data: ProjetUpdate,

): Promise<Projet> {

  return apiFetch<Projet>(`/api/v1/projets/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteProjet(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/projets/${id}`, { method: "DELETE" });

}



// --- Indicateurs ---



export async function listIndicateurs(): Promise<Indicateur[]> {

  return apiFetch<Indicateur[]>("/api/v1/indicateurs");

}



export async function createIndicateur(

  data: IndicateurCreate,

): Promise<Indicateur> {

  return apiFetch<Indicateur>("/api/v1/indicateurs", {

    method: "POST",

    body: JSON.stringify(data),

  });

}



export async function updateIndicateur(

  id: number,

  data: IndicateurUpdate,

): Promise<Indicateur> {

  return apiFetch<Indicateur>(`/api/v1/indicateurs/${id}`, {

    method: "PUT",

    body: JSON.stringify(data),

  });

}



export async function deleteIndicateur(id: number): Promise<void> {

  return apiFetch<void>(`/api/v1/indicateurs/${id}`, { method: "DELETE" });

}



// --- Stats ---



export async function getStatsActivites(
  direction?: string,
  period?: StatsPeriodParams,
): Promise<ActiviteStats> {
  const search = new URLSearchParams();
  if (direction) search.set("direction", direction);
  if (period) appendStatsPeriodToSearch(search, period);
  const query = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<ActiviteStats>(`/api/v1/stats/activites${query}`);
}



export async function getStatsRcc(params?: {
  trimestre?: number;
  period?: StatsPeriodParams;
}): Promise<ExecutionStats> {
  const search = new URLSearchParams();
  if (params?.trimestre) search.set("trimestre", String(params.trimestre));
  if (params?.period) appendStatsPeriodToSearch(search, params.period);
  const query = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<ExecutionStats>(
    `/api/v1/stats/recommandations${query}`,
  );
}



export async function getStatsMissions(params?: {
  trimestre?: number;
  period?: StatsPeriodParams;
}): Promise<ExecutionStats> {
  const search = new URLSearchParams();
  if (params?.trimestre) search.set("trimestre", String(params.trimestre));
  if (params?.period) appendStatsPeriodToSearch(search, params.period);
  const query = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<ExecutionStats>(`/api/v1/stats/missions${query}`);
}



export async function getStatsPpm(
  type?: string,
  period?: StatsPeriodParams,
): Promise<PpmStats> {
  const search = new URLSearchParams();
  if (type) search.set("type", type);
  if (period) appendStatsPeriodToSearch(search, period);
  const query = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<PpmStats>(`/api/v1/stats/ppm${query}`);
}



export async function getStatsProjets(
  projetId?: number,
  period?: StatsPeriodParams,
): Promise<ProjetStats> {
  const search = new URLSearchParams();
  if (projetId) search.set("projet_id", String(projetId));
  if (period) appendStatsPeriodToSearch(search, period);
  const query = search.toString() ? `?${search.toString()}` : "";
  return apiFetch<ProjetStats>(`/api/v1/stats/projets${query}`);
}



// --- Exports ---

const EXPORT_DEFAULT_FILENAMES: Record<ExportType, string> = {
  pao: "pao.xlsx",
  recommandations: "recommandations.xlsx",
  missions: "missions.xlsx",
  ppm: "ppm.xlsx",
  projets: "projets.xlsx",
};

function defaultExportFilename(
  type: ExportType,
  options?: { pao?: PaoExportOptions },
): string {
  if (type !== "pao") return EXPORT_DEFAULT_FILENAMES[type];

  const p = options?.pao ?? { mode: "annee" as const, annee: DEFAULT_ANNEE };
  if (p.mode === "annee") {
    return `pao_${p.annee ?? DEFAULT_ANNEE}.xlsx`;
  }
  if (p.mode === "plage") {
    const { du, au } = yearToDateRange(p.annee ?? DEFAULT_ANNEE);
    const from = p.du?.trim() || du;
    const to = p.au?.trim() || au;
    return `pao_${from}_${to}.xlsx`;
  }
  if (p.mode === "mois" && p.mois) {
    return `pao_${p.mois.replace(/,/g, "_")}.xlsx`;
  }
  return EXPORT_DEFAULT_FILENAMES.pao;
}



export async function downloadExport(
  type: ExportType,
  options?: { pao?: PaoExportOptions },
): Promise<void> {
  let path: string;
  if (type === "pao") {
    const p = options?.pao ?? { mode: "annee" as const, annee: DEFAULT_ANNEE };
    const params = new URLSearchParams({ mode: p.mode });
    if (p.mode === "annee") {
      params.set("annee", String(p.annee ?? DEFAULT_ANNEE));
    } else if (p.mode === "plage") {
      const { du, au } = yearToDateRange(p.annee ?? DEFAULT_ANNEE);
      params.set("du", p.du?.trim() || du);
      params.set("au", p.au?.trim() || au);
    } else if (p.mode === "mois" && p.mois) {
      params.set("mois", p.mois);
    }
    path = `/api/v1/exports/pao?${params.toString()}`;
  } else {
    path = `/api/v1/exports/${type}`;
  }
  const fallback = defaultExportFilename(type, options);
  const { blob, filename } = await apiFetchBlob(path, true, fallback);
  triggerDownload(blob, filename);
}



// --- Archive ---



export async function getArchiveRoot(): Promise<ArchiveRoot> {

  return apiFetch<ArchiveRoot>("/api/v1/archive");

}



export async function getDossier(dossierId: number): Promise<DossierContent> {

  return apiFetch<DossierContent>(

    `/api/v1/archive/dossiers/${dossierId}`,

  );

}



export async function createDossier(

  nom: string,

  parentId?: number | null,

): Promise<Dossier> {

  return apiFetch<Dossier>("/api/v1/archive/dossiers", {

    method: "POST",

    body: JSON.stringify({ nom, parent_id: parentId ?? null }),

  });

}



export async function renameDossier(

  dossierId: number,

  nom: string,

): Promise<Dossier> {

  return apiFetch<Dossier>(`/api/v1/archive/dossiers/${dossierId}`, {

    method: "PATCH",

    body: JSON.stringify({ nom }),

  });

}



export async function deleteDossier(dossierId: number): Promise<void> {

  return apiFetch<void>(`/api/v1/archive/dossiers/${dossierId}`, {

    method: "DELETE",

  });

}



export async function uploadArchiveFile(

  file: File,

  dossierId?: number | null,

): Promise<FichierArchive> {

  const formData = new FormData();

  formData.append("file", file);

  if (dossierId != null) formData.append("dossier_id", String(dossierId));

  return apiFetchFormData<FichierArchive>(

    "/api/v1/archive/fichiers",

    formData,

  );

}



export async function deleteArchiveFile(fichierId: number): Promise<void> {

  return apiFetch<void>(`/api/v1/archive/fichiers/${fichierId}`, {

    method: "DELETE",

  });

}



export { API_BASE_URL };


/* ─── Workflow ─── */

import type { WorkflowItem } from "@/types";

export async function listWorkflows(): Promise<WorkflowItem[]> {
  return apiFetch<WorkflowItem[]>("/api/v1/workflows");
}

export async function getWorkflow(id: number): Promise<WorkflowItem> {
  return apiFetch<WorkflowItem>(`/api/v1/workflows/${id}`);
}

export async function createWorkflow(
  data: { title: string; type: string },
  fichier: File,
): Promise<WorkflowItem> {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(data));
  formData.append("fichier", fichier);
  return apiFetchFormData<WorkflowItem>("/api/v1/workflows", formData, "POST");
}

export async function downloadWorkflowFile(actionId: number): Promise<Blob> {
  const headers = buildAuthHeaders({});
  const response = await fetch(
    `${API_BASE_URL}/api/v1/workflows/fichiers/${actionId}/download`,
    { headers },
  );
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    throw new Error(messageFromFailedResponse(error, response.status));
  }
  return response.blob();
}

export async function performWorkflowAction(
  workflowId: number,
  stepId: number,
  data: { action_type: string; comment?: string; target_role?: string },
  fichier?: File | null,
): Promise<WorkflowItem> {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(data));
  if (fichier) {
    formData.append("fichier", fichier);
  }
  return apiFetchFormData<WorkflowItem>(
    `/api/v1/workflows/${workflowId}/steps/${stepId}/action`,
    formData,
  );
}

export async function deleteWorkflow(id: number): Promise<void> {
  await apiFetch<void>(`/api/v1/workflows/${id}`, { method: "DELETE" });
}

/* ─── Notifications e-mail ─── */

import type { EmailConfig, NotificationEmailItem, RappelActivitesStats } from "@/types";

export async function getEmailConfig(): Promise<EmailConfig> {
  return apiFetch<EmailConfig>("/api/v1/notifications/email-config");
}

export async function listNotificationEmails(
  limit = 100,
): Promise<NotificationEmailItem[]> {
  return apiFetch<NotificationEmailItem[]>(
    `/api/v1/notifications?limit=${limit}`,
  );
}

export async function triggerActiviteReminders(
  force = false,
): Promise<RappelActivitesStats> {
  return apiFetch<RappelActivitesStats>(
    `/api/v1/notifications/rappels-activites?force=${force ? "true" : "false"}`,
    { method: "POST" },
  );
}

