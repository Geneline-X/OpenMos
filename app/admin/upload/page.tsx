import UploadClient from "./upload-client";

import { auth } from "@/lib/auth";
import { getActiveModels } from "@/app/actions/models";
import { getActiveLanguages } from "@/app/actions/languages";
import {
  getUserModels,
  getUserLanguages,
} from "@/app/actions/user-preferences";

export default async function AdminUploadPage() {
  const session = await auth();

  let models;
  let languages;

  if (session?.user?.id) {
    // Get user-specific enabled models/languages
    const [userModels, userLangs] = await Promise.all([
      getUserModels(session.user.id),
      getUserLanguages(session.user.id),
    ]);

    models = userModels;
    languages = userLangs;
  } else {
    // Fallback to all active models/languages
    const [activeModels, activeLangs] = await Promise.all([
      getActiveModels(),
      getActiveLanguages(),
    ]);

    models = activeModels;
    languages = activeLangs;
  }

  return <UploadClient languages={languages} models={models} />;
}
