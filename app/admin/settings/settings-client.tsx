"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { Select, SelectItem } from "@heroui/select";
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
  userRole?: string;
}

export default function SettingsClient({
  initialModels,
  initialLanguages,
  userModels,
  userLanguages,
  userId,
  userRole,
}: SettingsClientProps) {
  // Model Management State
  const [newModelName, setNewModelName] = useState("");
  const [newModelValue, setNewModelValue] = useState("");
  const [isAddingModel, setIsAddingModel] = useState(false);

  // Language Management State
  const [newLangName, setNewLangName] = useState("");
  const [newLangFlag, setNewLangFlag] = useState("");
  const [isAddingLang, setIsAddingLang] = useState(false);

  const flagOptions = [
    { key: "🇩🇿", label: "🇩🇿 Algeria" },
    { key: "🇦🇴", label: "🇦🇴 Angola" },
    { key: "🇧🇯", label: "🇧🇯 Benin" },
    { key: "🇧🇼", label: "🇧🇼 Botswana" },
    { key: "🇧🇫", label: "🇧🇫 Burkina Faso" },
    { key: "🇧🇮", label: "🇧🇮 Burundi" },
    { key: "🇨🇻", label: "🇨🇻 Cabo Verde" },
    { key: "🇨🇲", label: "🇨🇲 Cameroon" },
    { key: "🇨🇫", label: "🇨🇫 Central African Republic" },
    { key: "🇹🇩", label: "🇹🇩 Chad" },
    { key: "🇰🇲", label: "🇰🇲 Comoros" },
    { key: "🇨🇩", label: "🇨🇩 Congo (DRC)" },
    { key: "🇨🇬", label: "🇨🇬 Congo (Republic)" },
    { key: "🇨🇮", label: "🇨🇮 Côte d'Ivoire" },
    { key: "🇩🇯", label: "🇩🇯 Djibouti" },
    { key: "🇪🇬", label: "🇪🇬 Egypt" },
    { key: "🇬🇶", label: "🇬🇶 Equatorial Guinea" },
    { key: "🇪🇷", label: "🇪🇷 Eritrea" },
    { key: "🇸🇿", label: "🇸🇿 Eswatini" },
    { key: "🇪🇹", label: "🇪🇹 Ethiopia" },
    { key: "🇬🇦", label: "🇬🇦 Gabon" },
    { key: "🇬🇲", label: "🇬🇲 Gambia" },
    { key: "🇬🇭", label: "🇬🇭 Ghana" },
    { key: "🇬🇳", label: "🇬🇳 Guinea" },
    { key: "🇬🇼", label: "🇬🇼 Guinea-Bissau" },
    { key: "🇰🇪", label: "🇰🇪 Kenya" },
    { key: "🇱🇸", label: "🇱🇸 Lesotho" },
    { key: "🇱🇷", label: "🇱🇷 Liberia" },
    { key: "🇱🇾", label: "🇱🇾 Libya" },
    { key: "🇲🇬", label: "🇲🇬 Madagascar" },
    { key: "🇲🇼", label: "🇲🇼 Malawi" },
    { key: "🇲🇱", label: "🇲🇱 Mali" },
    { key: "🇲🇷", label: "🇲🇷 Mauritania" },
    { key: "🇲🇺", label: "🇲🇺 Mauritius" },
    { key: "🇲🇦", label: "🇲🇦 Morocco" },
    { key: "🇲🇿", label: "🇲🇿 Mozambique" },
    { key: "🇳🇦", label: "🇳🇦 Namibia" },
    { key: "🇳🇪", label: "🇳🇪 Niger" },
    { key: "🇳🇬", label: "🇳🇬 Nigeria" },
    { key: "🇷🇼", label: "🇷🇼 Rwanda" },
    { key: "🇸🇹", label: "🇸🇹 Sao Tome and Principe" },
    { key: "🇸🇳", label: "🇸🇳 Senegal" },
    { key: "🇸🇨", label: "🇸🇨 Seychelles" },
    { key: "🇸🇱", label: "🇸🇱 Sierra Leone" },
    { key: "🇸🇴", label: "🇸🇴 Somalia" },
    { key: "🇿🇦", label: "🇿🇦 South Africa" },
    { key: "🇸🇸", label: "🇸🇸 South Sudan" },
    { key: "🇸🇩", label: "🇸🇩 Sudan" },
    { key: "🇹🇿", label: "🇹🇿 Tanzania" },
    { key: "🇹🇬", label: "🇹🇬 Togo" },
    { key: "🇹🇳", label: "🇹🇳 Tunisia" },
    { key: "🇺🇬", label: "🇺🇬 Uganda" },
    { key: "🇿🇲", label: "🇿🇲 Zambia" },
    { key: "🇿🇼", label: "🇿🇼 Zimbabwe" },
  ];

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
    });

    setIsAddingModel(false);

    if (res.success) {
      toast.success("Model added successfully");
      setNewModelName("");
      setNewModelValue("");
      if (res.modelId) {
        setEnabledModelIds((prev) => new Set(Array.from(prev).concat(res.modelId!)));
      }
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
      const res = await deleteModel(id);

      if (res?.success) {
        toast.success("Model deleted successfully");
      } else {
        toast.error(res?.error || "Failed to delete model");
      }
    }
  };

  // --- Language Actions ---
  const handleAddLanguage = async () => {
    if (!newLangName || !newLangFlag) {
      toast.error("Please fill in name and flag");

      return;
    }

    setIsAddingLang(true);
    const res = await addLanguage({
      name: newLangName,
      flag: newLangFlag,
    });

    setIsAddingLang(false);

    if (res.success) {
      toast.success("Language added successfully");
      setNewLangName("");
      setNewLangFlag("");
      if (res.languageId) {
        setEnabledLanguageIds((prev) => new Set(Array.from(prev).concat(res.languageId!)));
      }
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
    const res = await deleteLanguage(id);

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
                      {/* Delete button: 
                          - If model.userId === userId, it's mine -> allow delete.
                          - If model.userId is null (global) -> user can only delete if owner role.
                      */}
                      {(model.userId === userId ||
                        (!model.userId && userRole === "owner")) && (
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
                <Select
                  className="w-24"
                  items={flagOptions}
                  label="Flag"
                  placeholder="🇺🇬"
                  selectedKeys={newLangFlag ? [newLangFlag] : []}
                  size="sm"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setNewLangFlag(selected || "");
                  }}
                >
                  {(flag) => (
                    <SelectItem key={flag.key}>{flag.label}</SelectItem>
                  )}
                </Select>
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
                      {/* Delete button: Only show if user owns this language, or if they are owner editing a global language */}
                      {(lang.userId === userId ||
                        (!lang.userId && userRole === "owner")) && (
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
