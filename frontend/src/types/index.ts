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

export interface Objectif {
  id: number;
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
  code: string;
  description: string;
}

export interface TachePlan {
  id: number;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TachePlanCreate {
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

export const DEFAULT_ANNEE = 2025;

export const TRIMESTRE_MOIS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

export const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export type TacheStatut = "en_cours" | "terminee" | "en_retard";

export interface SemainePlan {
  mois: number;
  semaine: number;
}

export interface SemaineRead extends SemainePlan {
  id: number;
  planifie: boolean;
  date_fin_semaine: string | null;
}

export interface TacheFichier {
  id: number;
  nom_original: string;
  mime_type: string | null;
  taille: number | null;
  uploaded_at: string;
}

export interface Tache {
  id: number;
  activite_id: number;
  trimestre: number;
  annee: number;
  description: string;
  responsable: string;
  email_responsable: string | null;
  ponderation: string;
  statut: TacheStatut;
  observation: string | null;
  semaines: SemaineRead[];
  fichiers: TacheFichier[];
  created_at: string;
  updated_at: string;
}

export interface TacheCreate {
  trimestre: number;
  annee?: number;
  description: string;
  responsable: string;
  email_responsable?: string | null;
  ponderation: number;
  semaines?: SemainePlan[];
}

export interface TacheUpdate {
  description?: string;
  responsable?: string;
  email_responsable?: string | null;
  ponderation?: number;
  semaines?: SemainePlan[];
}

export interface TacheDetails extends Tache {
  activite_code: string;
  activite_description: string;
}

export interface PlanificationActivite {
  id: number;
  code: string;
  description: string;
  execution: string;
  budget: string;
  objectif_id: number;
  direction_ids: number[];
  nb_taches: number;
}

export interface PlanificationPaoTacheItem {
  tache_plan_id: number;
  ponderation: number;
}

export interface PlanificationPaoCreate {
  description: string;
  objectif_id: number;
  budget: number;
  date_debut: string;
  date_fin: string;
  direction_id: number;
  email_responsable: string;
  email_ministre: string;
  taches: PlanificationPaoTacheItem[];
}

export interface PlanificationPaoTacheRead {
  tache_plan_id: number;
  tache_plan_code: string;
  tache_plan_description: string;
  ponderation: string;
}

export interface PlanificationPaoActivite {
  id: number;
  code: string;
  description: string;
  budget: string;
  objectif_id: number;
  objectif_code: string;
  objectif_description: string;
  date_debut: string;
  date_fin: string;
  direction_id: number;
  direction_code: string;
  direction_libelle: string;
  email_responsable: string;
  email_ministre: string;
  tdr_nom_original: string | null;
  taches: PlanificationPaoTacheRead[];
  created_at: string;
}

export type TypeBudgetProjet = "BND" | "FINEX";

export interface PlanificationProjetActiviteInput {
  titre: string;
}

export interface PlanificationProjetComposanteInput {
  libelle?: string | null;
  activites: PlanificationProjetActiviteInput[];
}

export interface PlanificationProjetCreate {
  projet_id: number;
  type_budget: TypeBudgetProjet;
  composantes: PlanificationProjetComposanteInput[];
  montant: number;
  lieu: string;
  date_debut: string;
  date_fin: string;
  direction_id: number;
  email_responsable: string;
  email_ministre: string;
}

export interface PlanificationProjetActiviteRead {
  id: number;
  ordre: number;
  titre: string;
  terminee: boolean;
  rapport_nom_original: string | null;
}

export interface PlanificationProjetComposanteRead {
  id: number;
  ordre: number;
  libelle: string | null;
  activites: PlanificationProjetActiviteRead[];
}

export interface PlanificationProjetPlan {
  id: number;
  projet_id: number;
  projet_code: string;
  projet_description: string;
  type_budget: TypeBudgetProjet;
  montant: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  direction_id: number;
  direction_code: string;
  direction_libelle: string;
  email_responsable: string;
  email_ministre: string;
  composantes: PlanificationProjetComposanteRead[];
  created_at: string;
}

export interface SuiviActivite {
  id: number;
  code: string;
  description: string;
  execution: string;
  budget: string;
  objectif_id: number;
  direction_ids: number[];
  nb_taches: number;
  nb_terminees: number;
  nb_en_retard: number;
}

export interface Recommandation {
  id: number;
  trimestre: number;
  annee: number;
  date_recommandation: string;
  description: string;
  responsable: string;
  execution: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecommandationCreate {
  trimestre?: number;
  annee?: number;
  date_recommandation: string;
  description: string;
  responsable: string;
  execution?: number;
  observations?: string | null;
}

export interface RecommandationUpdate {
  trimestre?: number;
  annee?: number;
  date_recommandation?: string;
  description?: string;
  responsable?: string;
  execution?: number;
  observations?: string | null;
}

export interface Mission {
  id: number;
  trimestre: number;
  annee: number;
  date_mission: string;
  description: string;
  responsable: string;
  execution: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface MissionCreate {
  trimestre?: number;
  annee?: number;
  date_mission: string;
  description: string;
  responsable: string;
  execution?: number;
  observations?: string | null;
}

export interface MissionUpdate {
  trimestre?: number;
  annee?: number;
  date_mission?: string;
  description?: string;
  responsable?: string;
  execution?: number;
  observations?: string | null;
}

export type PpmStatut =
  | "dao_elabore"
  | "dao_publie"
  | "marche_attribue"
  | "contrat_signe";

export interface Ppm {
  id: number;
  numero: string | null;
  intitule: string;
  type_marche: string | null;
  mode_passation: string | null;
  montant_estime: string | null;
  montant_attribue: string | null;
  financement: string | null;
  date_marche: string | null;
  statut: PpmStatut;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface PpmCreate {
  numero?: string | null;
  intitule: string;
  type_marche?: string | null;
  mode_passation?: string | null;
  montant_estime?: number | null;
  montant_attribue?: number | null;
  financement?: string | null;
  date_marche?: string | null;
  statut?: PpmStatut;
  observations?: string | null;
}

export interface PpmUpdate {
  numero?: string | null;
  intitule?: string;
  type_marche?: string | null;
  mode_passation?: string | null;
  montant_estime?: number | null;
  montant_attribue?: number | null;
  financement?: string | null;
  date_marche?: string | null;
  statut?: PpmStatut;
  observations?: string | null;
}

export interface Projet {
  id: number;
  code: string;
  description: string;
  abreviation: string | null;
  cout: string | null;
  bailleur: string | null;
  part_etat: string | null;
  part_bailleur: string | null;
  execution_financiere: string;
  execution_physique: string;
  date_debut: string | null;
  date_fin: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjetCreate {
  description: string;
  abreviation?: string | null;
  cout?: number | null;
  bailleur?: string | null;
  part_etat?: number | null;
  part_bailleur?: number | null;
  execution_financiere?: number;
  execution_physique?: number;
  date_debut?: string | null;
  date_fin?: string | null;
  observations?: string | null;
}

export interface ProjetUpdate {
  description?: string;
  abreviation?: string | null;
  cout?: number | null;
  bailleur?: string | null;
  part_etat?: number | null;
  part_bailleur?: number | null;
  execution_financiere?: number;
  execution_physique?: number;
  date_debut?: string | null;
  date_fin?: string | null;
  observations?: string | null;
}

export interface Indicateur {
  id: number;
  code: string;
  libelle: string;
  reference: string | null;
  cible: string | null;
  realise: string;
  created_at: string;
  updated_at: string;
}

export interface IndicateurCreate {
  code: string;
  libelle: string;
  reference?: string | null;
  cible?: number | null;
  realise?: number;
}

export interface IndicateurUpdate {
  code?: string;
  libelle?: string;
  reference?: string | null;
  cible?: number | null;
  realise?: number;
}

export interface ModuleListResponse<T> {
  items: T[];
  avg_execution: string | null;
}

export interface ActiviteStats {
  total: number;
  non_demare: number;
  en_cours: number;
  termine: number;
  en_retard: number;
  progression: string;
}

export interface ExecutionStats {
  total: number;
  non_demare: number;
  en_cours: number;
  termine: number;
  progression: string;
}

export interface PpmStats {
  total: number;
  dao_elabore: number;
  dao_publie: number;
  marche_attribue: number;
  contrat_signe: number;
}

export interface ProjetStats {
  total: number;
  execution_financiere: string;
  execution_physique: string;
}

export type ExportType =
  | "activites"
  | "taches"
  | "recommandations"
  | "missions"
  | "ppm"
  | "projets";

export interface Dossier {
  id: number;
  nom: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface FichierArchive {
  id: number;
  nom: string;
  dossier_id: number | null;
  mime_type: string | null;
  taille: number;
  created_at: string;
}

export interface BreadcrumbItem {
  id: number;
  nom: string;
}

export interface ArchiveRoot {
  dossiers: Dossier[];
  fichiers: FichierArchive[];
}

export interface DossierContent {
  dossier: Dossier;
  breadcrumb: BreadcrumbItem[];
  sous_dossiers: Dossier[];
  fichiers: FichierArchive[];
}

export type ExecutionStatutFilter = "non_demare" | "en_cours" | "termine" | null;

export const TACHE_STATUT_LABELS: Record<TacheStatut, string> = {
  en_cours: "En cours",
  terminee: "Terminée",
  en_retard: "En retard",
};

export const PPM_STATUT_LABELS: Record<PpmStatut, string> = {
  dao_elabore: "DAO élaboré",
  dao_publie: "DAO publié",
  marche_attribue: "Marché attribué",
  contrat_signe: "Contrat signé",
};

export type { HealthResponse } from "@/lib/api";
