"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

import { AiModel, Language } from "@/lib/db/schema";
import { addModel, deleteModel } from "@/app/actions/models";
import { addLanguage, deleteLanguage } from "@/app/actions/languages";
import {
  toggleUserModel,
  toggleUserLanguage,
} from "@/app/actions/user-preferences";

interface SettingsClientProps {
  initialModels: AiModel[];
  initialLanguages: Language[];
  userModels: AiModel[];
  userLanguages: Language[];
  userId: string;
}

export default function SettingsClient({
  initialModels,
  initialLanguages,
  userModels,
  userLanguages,
  userId,
}: SettingsClientProps) {
  // Model Management State
  const [newModelName, setNewModelName] = useState("");
  const [newModelValue, setNewModelValue] = useState("");
  const [isAddingModel, setIsAddingModel] = useState(false);

  // Language Management State
  const [newLangName, setNewLangName] = useState("");
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangFlag, setNewLangFlag] = useState("");
  const [isAddingLang, setIsAddingLang] = useState(false);

  // Local state for user preferences (initialized from props)
  const [enabledModelIds, setEnabledModelIds] = useState<Set<string>>(
    new Set(userModels.map((m) => m.id)),
  );
  const [enabledLanguageIds, setEnabledLanguageIds] = useState<Set<string>>(
    new Set(userLanguages.map((l) => l.id)),
  );

  // --- Model Actions ---
  const handleAddModel = async () => {
    if (!newModelName || !newModelValue) {
      toast.error("Please fill in both name and value");

      return;
    }

    setIsAddingModel(true);
    const res = await addModel({
      name: newModelName,
      value: newModelValue,
      userId,
    });

    setIsAddingModel(false);

    if (res.success) {
      toast.success("Model added successfully");
      setNewModelName("");
      setNewModelValue("");
      // Note: We might want to auto-enable it for the user or refresh the list
      // Since this is a client component receiving props, we rely on Server Action revalidation
      // to update the list, but user preference state might need manual update if we want instant feedback
    } else {
      toast.error(res.error || "Failed to add model");
    }
  };

  const handleToggleModel = async (id: string, isActive: boolean) => {
    // Optimistic update for UI
    const newSet = new Set(enabledModelIds);

    if (isActive) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setEnabledModelIds(newSet);

    const res = await toggleUserModel(userId, id);

    if (res.success) {
      toast.success(
        isActive ? "Model enabled for you" : "Model disabled for you",
      );
    } else {
      // Revert on failure
      const revertedSet = new Set(enabledModelIds);

      if (!isActive)
        revertedSet.add(id); // was active
      else revertedSet.delete(id); // was inactive
      setEnabledModelIds(revertedSet);
      toast.error("Failed to update preference");
    }
  };

  const handleDeleteModel = async (id: string) => {
    // Check if user is allowed to delete
    // We enforce this on server, but UI also hides button for non-owners of private models.

    if (confirm("Are you sure you want to delete this model?")) {
      // Pass current userId to deleteModel for verification
      const res = await deleteModel(id, userId);

      if (res?.success) {
        toast.success("Model deleted successfully");
      } else {
        toast.error(res?.error || "Failed to delete model");
      }
    }
  };

  // --- Language Actions ---
  const handleAddLanguage = async () => {
    if (!newLangName || !newLangCode || !newLangFlag) {
      toast.error("Please fill in name, code, and flag");

      return;
    }

    setIsAddingLang(true);
    const res = await addLanguage({
      name: newLangName,
      code: newLangCode,
      flag: newLangFlag,
      userId, // Pass userId for ownership
    });

    setIsAddingLang(false);

    if (res.success) {
      toast.success("Language added successfully");
      setNewLangName("");
      setNewLangCode("");
      setNewLangFlag("");
    } else {
      toast.error(res.error || "Failed to add language");
    }
  };

  const handleToggleLanguage = async (id: string, isActive: boolean) => {
    // Optimistic update
    const newSet = new Set(enabledLanguageIds);

    if (isActive) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setEnabledLanguageIds(newSet);

    const res = await toggleUserLanguage(userId, id);

    if (res.success) {
      toast.success(
        isActive ? "Language enabled for you" : "Language disabled for you",
      );
    } else {
      // Revert
      const revertedSet = new Set(enabledLanguageIds);

      if (!isActive) revertedSet.add(id);
      else revertedSet.delete(id);
      setEnabledLanguageIds(revertedSet);
      toast.error("Failed to update preference");
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this language? data associated with it might be affected.",
      )
    ) {
      return;
    }
    const res = await deleteLanguage(id, userId);

    if (res.success) {
      toast.success("Language deleted");
    } else {
      toast.error(res.error || "Failed to delete language");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-default-500">
          Configure platform and study settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon
                className="h-5 w-5 text-secondary"
                icon="solar:server-square-bold-duotone"
              />
              <p className="font-semibold">AI Model Management</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="space-y-4">
              {/* Add New Model */}
              <div className="flex gap-2 items-end">
                <Input
                  label="Name"
                  placeholder="e.g. GPT-4o"
                  size="sm"
                  value={newModelName}
                  onValueChange={setNewModelName}
                />
                <Input
                  label="Value (ID)"
                  placeholder="e.g. gpt_4o"
                  size="sm"
                  value={newModelValue}
                  onValueChange={setNewModelValue}
                />
                <Button
                  isIconOnly
                  color="secondary"
                  isLoading={isAddingModel}
                  size="lg"
                  onPress={handleAddModel}
                >
                  <Icon className="w-6 h-6" icon="solar:add-circle-bold" />
                </Button>
              </div>

              <Divider />

              {/* List Models */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <p className="text-xs text-default-400 px-2 uppercase font-semibold">
                  Enable models you want to use
                </p>
                {initialModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-2 bg-default-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${model.isActive ? "bg-success" : "bg-default-300"}`}
                        title={
                          model.isActive
                            ? "Globally Active"
                            : "Globally Inactive"
                        }
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{model.name}</p>
                          {model.userId && (
                            <span className="text-[10px] bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded-full font-medium border border-secondary-200">
                              PRIVATE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-default-500">
                          {model.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        isDisabled={
                          !model.isActive && !enabledModelIds.has(model.id)
                        } // Cannot enable if globally inactive
                        isSelected={enabledModelIds.has(model.id)}
                        size="sm"
                        onValueChange={(val) =>
                          handleToggleModel(model.id, val)
                        }
                      />
                      {/* Delete button: Only show if user owns the model (private) or if admin (simulated by checking !userId for now, but really regular user shouldn't see/delete global) 
                          Actually: 
                          - If model.userId === userId, it's mine -> allow delete.
                          - If model.userId is null (global) -> user cannot delete.
                      */}
                      {model.userId === userId && (
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => handleDeleteModel(model.id)}
                        >
                          <Icon
                            className="w-4 h-4"
                            icon="solar:trash-bin-trash-bold"
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Language Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon
                className="h-5 w-5 text-primary"
                icon="solar:global-bold-duotone"
              />
              <p className="font-semibold">Language Management</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="space-y-4">
              {/* Add New Language */}
              <div className="flex gap-2 items-end">
                <Input
                  className="flex-1"
                  label="Name"
                  placeholder="e.g. Swahili"
                  size="sm"
                  value={newLangName}
                  onValueChange={setNewLangName}
                />
                <Input
                  className="w-24"
                  label="Code"
                  placeholder="sw"
                  size="sm"
                  value={newLangCode}
                  onValueChange={setNewLangCode}
                />
                <Input
                  className="w-16"
                  label="Flag"
                  placeholder="🇰🇪"
                  size="sm"
                  value={newLangFlag}
                  onValueChange={setNewLangFlag}
                />
                <Button
                  isIconOnly
                  color="secondary"
                  isLoading={isAddingLang}
                  size="lg"
                  onPress={handleAddLanguage}
                >
                  <Icon className="w-6 h-6" icon="solar:add-circle-bold" />
                </Button>
              </div>

              <Divider />

              {/* List Languages */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <p className="text-xs text-default-400 px-2 uppercase font-semibold">
                  Enable languages you want to use
                </p>
                {initialLanguages.map((lang) => (
                  <div
                    key={lang.id}
                    className="flex items-center justify-between p-2 bg-default-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${lang.isActive ? "bg-success" : "bg-default-300"}`}
                        title={
                          lang.isActive
                            ? "Globally Active"
                            : "Globally Inactive"
                        }
                      />
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{lang.name}</p>
                          {lang.userId && (
                            <span className="text-[10px] bg-secondary-100 text-secondary-600 px-1.5 py-0.5 rounded-full font-medium border border-secondary-200">
                              PRIVATE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-default-500">{lang.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        isDisabled={
                          !lang.isActive && !enabledLanguageIds.has(lang.id)
                        }
                        isSelected={enabledLanguageIds.has(lang.id)}
                        size="sm"
                        onValueChange={(val) =>
                          handleToggleLanguage(lang.id, val)
                        }
                      />
                      {/* Delete button: Only show if user owns this language */}
                      {lang.userId === userId && (
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => handleDeleteLanguage(lang.id)}
                        >
                          <Icon
                            className="w-4 h-4"
                            icon="solar:trash-bin-trash-bold"
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
