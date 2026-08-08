/** Plage d'années et dates autorisées (alignée backend). */

export const MIN_ANNEE = 2026;
export const MAX_ANNEE = 2040;

export const DEFAULT_ANNEE = MIN_ANNEE;

export const ANNEE_OPTIONS = Array.from(
  { length: MAX_ANNEE - MIN_ANNEE + 1 },
  (_, i) => MIN_ANNEE + i,
);

export const YEAR_OPTIONS = ANNEE_OPTIONS;

export function defaultYearRange() {
  return {
    du: `${DEFAULT_ANNEE}-01-01`,
    au: `${DEFAULT_ANNEE}-12-31`,
  };
}

export function maxDateInput() {
  return `${MAX_ANNEE}-12-31`;
}

export function minDateInput() {
  return `${MIN_ANNEE}-01-01`;
}
