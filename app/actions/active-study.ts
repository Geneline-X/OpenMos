"use server";

import { getActiveStudy } from "@/app/actions/studies";

/**
 * Lightweight check for the StudyGuard component.
 * Returns whether the current user has an active study.
 */
export async function checkActiveStudy(): Promise<{
  hasActiveStudy: boolean;
  studyName?: string;
}> {
  const study = await getActiveStudy();

  return {
    hasActiveStudy: !!study,
    studyName: study?.name,
  };
}
