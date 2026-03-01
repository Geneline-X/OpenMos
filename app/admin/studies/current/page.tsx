import CurrentStudyClient from "./current-study-client";

import { getActiveStudy, getStudyStats } from "@/app/actions/studies";

export const dynamic = "force-dynamic";

export default async function CurrentStudyPage() {
  const activeStudy = await getActiveStudy();
  const stats = activeStudy ? await getStudyStats(activeStudy.id) : null;

  return <CurrentStudyClient stats={stats} study={activeStudy} />;
}
