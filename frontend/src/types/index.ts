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

export type { HealthResponse } from "@/lib/api";
