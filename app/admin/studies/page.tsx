import { Suspense } from "react";

import StudiesClient from "./studies-client";

import { getStudies } from "@/app/actions/studies";
import { getModels } from "@/app/actions/models";
import { getLanguages } from "@/app/actions/languages";

export const dynamic = "force-dynamic";

export default async function StudiesPage() {
  const studies = await getStudies();
  const models = await getModels();
  const languages = await getLanguages();

  return (
    <Suspense fallback={<div>Loading studies...</div>}>
      <StudiesClient
        initialLanguages={languages}
        initialModels={models}
        initialStudies={studies}
      />
    </Suspense>
  );
}
