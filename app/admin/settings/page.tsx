import SettingsClient from "./settings-client";

import { getModels } from "@/app/actions/models";
import { getLanguages } from "@/app/actions/languages";

export default async function SettingsPage() {
  const models = await getModels();
  const languages = await getLanguages();

  return <SettingsClient initialLanguages={languages} initialModels={models} />;
}
