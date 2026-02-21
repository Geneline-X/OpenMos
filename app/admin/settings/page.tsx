import SettingsClient from "./settings-client";

import { auth } from "@/lib/auth";
import { getAvailableModels } from "@/app/actions/models";
import { getLanguages } from "@/app/actions/languages";
import {
  getUserModels,
  getUserLanguages,
} from "@/app/actions/user-preferences";

export default async function SettingsPage() {
  const session = await auth();

  // Pass userId to get languages scoped to the user (System + Private)
  const languages = await getLanguages(session?.user?.id);

  // If user is logged in, get models available to them (Private + Global)
  // Otherwise get all (or just global? getAvailableModels handles undefined)
  const models = await getAvailableModels(session?.user?.id);

  let userModels: any[] = [];

  let userLanguages: any[] = [];

  if (session?.user?.id) {
    [userModels, userLanguages] = await Promise.all([
      getUserModels(session.user.id),
      getUserLanguages(session.user.id),
    ]);
  }

  return (
    <SettingsClient
      initialLanguages={languages}
      initialModels={models}
      userId={session?.user?.id || ""}
      userLanguages={userLanguages}
      userModels={userModels}
    />
  );
}
