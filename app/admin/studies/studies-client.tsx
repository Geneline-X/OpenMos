"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

import { AiModel, Language } from "@/lib/db/schema";
import {
  StudyWithRelations,
  createStudy,
  deleteStudy,
  toggleStudyActive,
} from "@/app/actions/studies";

interface StudiesClientProps {
  initialStudies: StudyWithRelations[];
  initialModels: AiModel[];
  initialLanguages: Language[];
}

export default function StudiesClient({
  initialStudies,
  initialModels,
  initialLanguages,
}: StudiesClientProps) {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const isPastStudies = filter === "past";

  // Study Management State
  const [newStudyName, setNewStudyName] = useState("");
  const [selectedModelValues, setSelectedModelValues] = useState<string[]>([]);
  const [selectedLangCodes, setSelectedLangCodes] = useState<string[]>([]);
  const [isAddingStudy, setIsAddingStudy] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [activeStudyId, setActiveStudyId] = useState<string | null>(
    initialStudies.find((s) => s.isActive)?.id ?? null,
  );
  const [togglingStudyId, setTogglingStudyId] = useState<string | null>(null);

  // Filter studies based on view using local active state
  const displayedStudies = isPastStudies
    ? initialStudies.filter((s) => activeStudyId !== s.id)
    : initialStudies;

  const handleAddStudy = async () => {
    if (!newStudyName) {
      toast.error("Please enter a study name");

      return;
    }

    if (selectedLangCodes.length === 0) {
      toast.error("Please select at least one language");

      return;
    }

    if (selectedModelValues.length === 0) {
      toast.error("Please select at least one model");

      return;
    }

    setIsAddingStudy(true);
    const res = await createStudy({
      name: newStudyName,
      modelValues: selectedModelValues,
      languageCodes: selectedLangCodes,
    });

    setIsAddingStudy(false);

    if (res.success) {
      toast.success("Study created successfully");
      setNewStudyName("");
      setSelectedModelValues([]);
      setSelectedLangCodes([]);
    } else {
      toast.error(res.error || "Failed to create study");
    }
  };

  const handleToggleStudy = async (id: string, isActive: boolean) => {
    if (togglingStudyId) return;

    const previousActiveId = activeStudyId;

    // Optimistic update
    setActiveStudyId(isActive ? id : null);
    setTogglingStudyId(id);

    if (isActive) {
      toast.info("Activating this study will deactivate others.");
    }

    const res = await toggleStudyActive(id, isActive);

    setTogglingStudyId(null);

    if (res.success) {
      toast.success(isActive ? "Study activated" : "Study deactivated");
    } else {
      // Revert optimistic update on failure
      setActiveStudyId(previousActiveId);
      toast.error("Failed to update study status");
    }
  };

  const handleDeleteStudy = async (id: string) => {
    if (
      !confirm(
        "Delete this study? All audio samples tied to it and their ratings will be permanently removed.",
      )
    ) {
      return;
    }

    const res = await deleteStudy(id);

    if (res.success) {
      const count = (res as any).deletedSamples;
      toast.success(
        count
          ? `Study deleted along with ${count} sample${count !== 1 ? "s" : ""}`
          : "Study deleted",
      );
    } else {
      toast.error(res.error || "Failed to delete study");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isPastStudies ? "Past Studies" : "Studies Management"}
          </h1>
          <p className="text-default-500">
            {isPastStudies
              ? "View details of completed and inactive studies"
              : "Create and manage evaluation studies"}
          </p>
        </div>
      </div>

      {!isPastStudies && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon
                className="h-5 w-5 text-primary"
                icon="solar:clipboard-text-bold-duotone"
              />
              <p className="font-semibold">Create New Study</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Input
                label="Study Name"
                placeholder="e.g. Q1 2026 Evaluation"
                size="sm"
                value={newStudyName}
                onValueChange={setNewStudyName}
              />
              <Select
                label="Languages"
                placeholder="Select languages"
                selectedKeys={new Set(selectedLangCodes)}
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) =>
                  setSelectedLangCodes(Array.from(keys) as string[])
                }
              >
                {initialLanguages
                  .filter((l) => l.isActive)
                  .map((lang) => (
                    <SelectItem
                      key={lang.code}
                      textValue={`${lang.flag} ${lang.name}`}
                    >
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
              </Select>
              <Select
                label="Models"
                placeholder="Select models"
                selectedKeys={new Set(selectedModelValues)}
                selectionMode="multiple"
                size="sm"
                onSelectionChange={(keys) =>
                  setSelectedModelValues(Array.from(keys) as string[])
                }
              >
                {initialModels
                  .filter((m) => m.isActive)
                  .map((model) => (
                    <SelectItem key={model.value}>{model.name}</SelectItem>
                  ))}
              </Select>
            </div>
            <Button
              className="w-full md:w-auto self-end"
              color="primary"
              isDisabled={
                !newStudyName ||
                selectedLangCodes.length === 0 ||
                selectedModelValues.length === 0
              }
              isLoading={isAddingStudy}
              onPress={handleAddStudy}
            >
              Create Study
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {isPastStudies ? "Completed Studies" : "Existing Studies"}
        </h2>
        {displayedStudies.length === 0 && (
          <p className="text-default-400">
            {isPastStudies
              ? "No past studies found."
              : "No studies created yet."}
          </p>
        )}
        <div className="grid gap-4">
          {displayedStudies.map((study) => (
            <Card key={study.id}>
              <CardBody className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{study.name}</h3>
                    {activeStudyId === study.id ? (
                      <span className="text-xs bg-success-100 text-success-600 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-default-100 text-default-600 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-default-500 flex flex-wrap gap-4">
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:global-linear" />
                      {study.languages.length} languages
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:server-square-linear" />
                      {study.models.length} models
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:calendar-linear" />
                      Started {new Date(study.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-default-400">
                      Access Key:
                    </span>
                    <code className="text-xs font-mono bg-default-100 px-2 py-0.5 rounded">
                      {study.accessKey}
                    </code>
                    <Button
                      isIconOnly
                      color={copiedKeyId === study.id ? "success" : "default"}
                      size="sm"
                      variant="light"
                      onPress={() => {
                        navigator.clipboard.writeText(study.accessKey);
                        setCopiedKeyId(study.id);
                        setTimeout(() => setCopiedKeyId(null), 1000);
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        icon={
                          copiedKeyId === study.id
                            ? "solar:check-circle-bold"
                            : "solar:copy-bold"
                        }
                      />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-default-500">Status:</span>
                    <Switch
                      isDisabled={togglingStudyId !== null}
                      isSelected={activeStudyId === study.id}
                      size="sm"
                      onValueChange={(val) => handleToggleStudy(study.id, val)}
                    >
                      <span className="sr-only">Active</span>
                    </Switch>
                  </div>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDeleteStudy(study.id)}
                  >
                    <Icon
                      className="w-5 h-5"
                      icon="solar:trash-bin-trash-bold"
                    />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
