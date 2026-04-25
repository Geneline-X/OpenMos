import UploadClient from "./upload-client";

import { auth } from "@/lib/auth";
import { getActiveModels } from "@/app/actions/models";
import { getActiveLanguages } from "@/app/actions/languages";
import { getActiveStudy } from "@/app/actions/studies";
import {
  getUserModels,
  getUserLanguages,
} from "@/app/actions/user-preferences";

export default async function AdminUploadPage() {
  const session = await auth();

  let models;
  let languages;

  if (session?.user?.id) {
    const [userModels, userLangs] = await Promise.all([
      getUserModels(session.user.id),
      getUserLanguages(session.user.id),
    ]);

    models = userModels;
    languages = userLangs;
  } else {
    const [activeModels, activeLangs] = await Promise.all([
      getActiveModels(),
      getActiveLanguages(),
    ]);

    models = activeModels;
    languages = activeLangs;
  }

  const activeStudy = await getActiveStudy();

  return (
    <UploadClient
      activeStudyId={activeStudy?.id ?? null}
      activeStudyName={activeStudy?.name ?? null}
      languages={languages}
      models={models}
    />
  );
}
