export type AccessType = "lecture" | "ecriture";
export type UserRole = "user" | "admin";

export interface User {
  id: number;
  username: string;
  prenom: string;
  role: UserRole;
  type_acces: AccessType;
  etat: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserCreate {
  username: string;
  password: string;
  prenom: string;
  type_acces: AccessType;
  role?: UserRole;
}

export type ObjectifType = "oct" | "omt" | "olt";

export interface Objectif {
  id: number;
  type: ObjectifType;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Direction {
  id: number;
  code: string;
  libelle: string;
}

export interface TrimestrePlan {
  annee: number;
  trimestre: number;
}

export interface Activite {
  id: number;
  objectif_id: number;
  code: string;
  description: string;
  budget: string;
  execution: string;
  direction_ids: number[];
  trimestres: TrimestrePlan[];
  created_at: string;
  updated_at: string;
}

export interface ObjectifCreate {
  type: ObjectifType;
  code: string;
  description: string;
}

export interface ActiviteCreate {
  code: string;
  description: string;
  budget: number;
  direction_ids: number[];
  trimestres: TrimestrePlan[];
}

export const OBJECTIF_LABELS: Record<ObjectifType, { label: string; year: number }> = {
  oct: { label: "OCT", year: 2025 },
  omt: { label: "OMT", year: 2026 },
  olt: { label: "OLT", year: 2027 },
};

export type { HealthResponse } from "@/lib/api";
