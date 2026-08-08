const ONBOARDING_VERSION = "v1";

function storageKey(userId: number): string {
  return `suiviimpact-onboarding-${ONBOARDING_VERSION}-${userId}`;
}

export function hasCompletedOnboarding(userId: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(storageKey(userId)) === "completed";
  } catch {
    return true;
  }
}

export function markOnboardingCompleted(userId: number): void {
  try {
    localStorage.setItem(storageKey(userId), "completed");
  } catch {
    /* ignore */
  }
}

export const USAGE_GUIDE_OPEN_EVENT = "suiviimpact:open-usage-guide";

export function openUsageGuide(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(USAGE_GUIDE_OPEN_EVENT));
}
