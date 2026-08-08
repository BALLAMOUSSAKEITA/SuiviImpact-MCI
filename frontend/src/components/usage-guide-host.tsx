"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { UsageGuideModal } from "@/components/usage-guide-modal";
import {
  USAGE_GUIDE_OPEN_EVENT,
  hasCompletedOnboarding,
  markOnboardingCompleted,
} from "@/lib/onboarding";

export function UsageGuideHost() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!hasCompletedOnboarding(user.id)) {
      setOpen(true);
    }
  }, [isLoading, user]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(USAGE_GUIDE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(USAGE_GUIDE_OPEN_EVENT, onOpen);
  }, []);

  if (!user) return null;

  return (
    <UsageGuideModal
      open={open}
      onClose={() => setOpen(false)}
      onFinished={() => markOnboardingCompleted(user.id)}
    />
  );
}
