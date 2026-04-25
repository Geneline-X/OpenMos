"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { RadioGroup, Radio } from "@heroui/radio";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Icon } from "@iconify/react";

import { useUploadThing } from "@/lib/uploadthing-react";
import { Language } from "@/lib/db/schema";

const MAX_FILES = 30;

type UploadFile = {
  file: File;
  id: string;
  progress: number;
  status: "queued" | "uploading" | "complete" | "error";
  url?: string;
  error?: string;
};

type AudioUploaderProps = {
  onUploadComplete?: (files: { url: string; key: string }[]) => void;
  models: { name: string; value: string; description?: string | null }[];
  languages: Language[];
  /** ID of the active study to associate uploads with */
  studyId?: string | null;
  studyName?: string | null;
};

export function AudioUploader({
  onUploadComplete,
  models,
  languages,
  studyId = null,
  studyName = null,
}: AudioUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [modelType, setModelType] = useState<string>(
    models?.[0]?.value || "orpheus",
  );
  const [language, setLanguage] = useState<string>("");
  const [languageError, setLanguageError] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("audioUploader", {
    headers: {
      "x-model-type": modelType,
      "x-language": language,
      "x-text-content": textContent,
      ...(studyId ? { "x-study-id": studyId } : {}),
    },
    onUploadProgress: (progress) => {
      setFiles((prev) =>
        prev.map((f) => (f.status === "uploading" ? { ...f, progress } : f)),
      );
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: "queued",
    }));

    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      // Enforce the cap so the dropzone never exceeds MAX_FILES
      return combined.slice(0, MAX_FILES);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".wav", ".mp3", ".m4a", ".ogg", ".flac"],
    },
    maxSize: 16 * 1024 * 1024, // 16 MB
    maxFiles: MAX_FILES,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued");

    if (queuedFiles.length === 0) return;

    if (!language) {
      setLanguageError("Please select a language before uploading");

      return;
    }

    setIsUploading(true);

    // Mark all queued files as uploading before we start
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "queued" ? { ...f, status: "uploading", progress: 0 } : f,
      ),
    );

    try {
      // 1. Upload all files to UploadThing CDN
      const uploadResults = await startUpload(
        queuedFiles.map((f) => f.file),
      );

      if (!uploadResults || uploadResults.length === 0) {
        throw new Error("Upload returned no results");
      }

      // 2. Build the payload — metadata comes back from the server callback
      type ServerData = {
        modelType?: string;
        language?: string;
        textContent?: string | null;
      };

      const batchData = uploadResults.map((r) => {
        const sd = (r.serverData as ServerData) ?? {};

        return {
          url: r.ufsUrl || r.url,
          key: r.key,
          modelType: sd.modelType ?? modelType,
          language: sd.language ?? language,
          textContent: sd.textContent ?? (textContent || null),
          studyId: (sd as any).studyId ?? studyId ?? null,
        };
      });

      // 3. Atomically persist all samples with a single DB INSERT.
      //    If this fails, the server cleans up the CDN files for us.
      const saveRes = await fetch("/api/admin/samples/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: batchData }),
      });

      if (!saveRes.ok) {
        const errBody = await saveRes
          .json()
          .catch(() => ({ error: "Unknown error" }));

        throw new Error(errBody.error || "Failed to save samples");
      }

      // 4. Everything succeeded — mark all as complete
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading" ? { ...f, status: "complete" } : f,
        ),
      );

      onUploadComplete?.(
        batchData.map((f) => ({ url: f.url, key: f.key })),
      );
    } catch (error) {
      console.error("Upload or save failed:", error);

      // Atomicity: if anything failed, mark the whole batch as failed
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? {
                ...f,
                status: "error",
                error:
                  error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const completedCount = files.filter((f) => f.status === "complete").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <Card shadow="sm">
      <CardHeader className="flex items-center gap-2">
        <Icon
          className="w-6 h-6 text-primary"
          icon="solar:cloud-upload-bold-duotone"
        />
        <h3 className="font-semibold">Upload Audio Samples</h3>
      </CardHeader>
      <CardBody className="gap-6">
        {/* Study association banner */}
        {studyId ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" icon="solar:clipboard-text-bold-duotone" />
            <span>
              Samples will be added to study{" "}
              <strong>{studyName ?? studyId}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-lg text-sm">
            <Icon className="w-4 h-4 text-warning flex-shrink-0" icon="solar:danger-triangle-bold-duotone" />
            <span>No active study — samples will not be tied to any study</span>
          </div>
        )}

        {/* Metadata Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Model Type</p>
            <RadioGroup
              className="flex-wrap gap-y-2"
              orientation="horizontal"
              value={modelType}
              onValueChange={setModelType}
            >
              {models?.map((model) => (
                <Radio key={model.value} value={model.value}>
                  <div className="flex items-center gap-1">
                    <Icon
                      className="w-4 h-4"
                      icon="solar:microphone-bold-duotone"
                    />
                    {model.name}
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <Select
            isRequired
            errorMessage={languageError}
            isInvalid={!!languageError}
            items={languages}
            label="Language"
            labelPlacement="outside"
            placeholder="Select a language"
            selectedKeys={language ? [language] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;

              setLanguage(val || "");
              setLanguageError("");
            }}
          >
            {(lang) => (
              <SelectItem
                key={lang.code}
                startContent={<span>{lang.flag}</span>}
              >
                {lang.name}
              </SelectItem>
            )}
          </Select>
        </div>

        {/* Transcript Input */}
        <Textarea
          description="The text content spoken in the audio. Can also be added/edited later."
          label="Transcript (optional)"
          labelPlacement="outside"
          maxRows={4}
          minRows={2}
          placeholder="Type the transcript of the audio content here..."
          value={textContent}
          onValueChange={setTextContent}
        />

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-default-300 hover:border-primary/50 hover:bg-default-50"
            }
          `}
        >
          <input {...getInputProps()} />
          <Icon
            className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? "text-primary" : "text-default-400"}`}
            icon="solar:cloud-upload-bold-duotone"
          />
          <p className="font-medium mb-1">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop audio files here"}
          </p>
          <p className="text-sm text-default-500 mb-2">or click to browse</p>
          <p className="text-xs text-default-400">
            Supported: .wav, .mp3, .m4a, .ogg, .flac • Max size: 16 MB per
            file • Up to {MAX_FILES} files
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Files to Upload ({files.length})</p>
              <div className="flex gap-3 text-sm">
                {completedCount > 0 && (
                  <span className="text-success">{completedCount} saved</span>
                )}
                {errorCount > 0 && (
                  <span className="text-danger">{errorCount} failed</span>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-3 p-3 bg-default-50 rounded-lg"
                >
                  <Icon
                    className="w-5 h-5 text-default-400 flex-shrink-0"
                    icon="solar:music-note-linear"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-default-400">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    {uploadFile.status === "uploading" && (
                      <Progress
                        className="mt-1"
                        color="primary"
                        size="sm"
                        value={uploadFile.progress}
                      />
                    )}
                    {uploadFile.status === "error" && uploadFile.error && (
                      <p className="text-xs text-danger mt-0.5">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {uploadFile.status === "queued" && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => removeFile(uploadFile.id)}
                      >
                        <Icon
                          className="w-4 h-4"
                          icon="solar:close-circle-linear"
                        />
                      </Button>
                    )}
                    {uploadFile.status === "uploading" && (
                      <Icon
                        className="w-5 h-5 text-primary animate-spin"
                        icon="solar:refresh-linear"
                      />
                    )}
                    {uploadFile.status === "complete" && (
                      <Icon
                        className="w-5 h-5 text-success"
                        icon="solar:check-circle-bold"
                      />
                    )}
                    {uploadFile.status === "error" && (
                      <Icon
                        className="w-5 h-5 text-danger"
                        icon="solar:danger-circle-bold"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {files.length > 0 && (
            <Button
              isDisabled={isUploading}
              variant="light"
              onPress={() => setFiles([])}
            >
              Clear All
            </Button>
          )}
          <Button
            color="primary"
            isDisabled={queuedCount === 0 || isUploading}
            isLoading={isUploading}
            startContent={
              !isUploading && (
                <Icon
                  className="w-5 h-5"
                  icon="solar:cloud-upload-bold-duotone"
                />
              )
            }
            onPress={handleUpload}
          >
            {isUploading
              ? "Uploading..."
              : `Upload All (${queuedCount})`}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
