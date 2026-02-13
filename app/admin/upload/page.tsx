import UploadClient from "./upload-client";

import { getActiveModels } from "@/app/actions/models";
import { getActiveLanguages } from "@/app/actions/languages";

export default async function AdminUploadPage() {
  const models = await getActiveModels();
  const languages = await getActiveLanguages();

  return <UploadClient languages={languages} models={models} />;
}
