import CurrentStudyClient from "./current-study-client";

import { getActiveStudy } from "@/app/actions/studies";

export const dynamic = "force-dynamic";

export default async function CurrentStudyPage() {
  const activeStudy = await getActiveStudy();

  return <CurrentStudyClient study={activeStudy} />;
}
