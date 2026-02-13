"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { RadioGroup, Radio } from "@heroui/radio";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";

import { useUploadThing } from "@/lib/uploadthing-react";
import { Language } from "@/lib/db/schema";

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
};

export function AudioUploader({
  onUploadComplete,
  models,
  languages,
}: AudioUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [modelType, setModelType] = useState<string>(
    models?.[0]?.value || "orpheus",
  );
  const [language, setLanguage] = useState<string>("luganda");
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("audioUploader", {
    headers: {
      "x-model-type": modelType,
      "x-language": language,
    },
    onUploadProgress: (progress) => {
      // Update progress for all uploading files
      setFiles((prev) =>
        prev.map((f) => (f.status === "uploading" ? { ...f, progress } : f)),
      );
    },
    onClientUploadComplete: (res) => {
      // Mark files as complete
      setFiles((prev) =>
        prev.map((f, idx) =>
          f.status === "uploading" && res[idx]
            ? { ...f, status: "complete", url: res[idx].ufsUrl || res[idx].url }
            : f,
        ),
      );
      setIsUploading(false);

      // Notify parent
      const completedFiles = res.map((r) => ({
        url: r.ufsUrl || r.url,
        key: r.key,
      }));

      onUploadComplete?.(completedFiles);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", error: error.message }
            : f,
        ),
      );
      setIsUploading(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: "queued",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".wav", ".mp3", ".m4a", ".ogg", ".flac"],
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    maxFiles: 20,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued");

    if (queuedFiles.length === 0) return;

    setIsUploading(true);

    // Mark all queued files as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "queued" ? { ...f, status: "uploading", progress: 0 } : f,
      ),
    );

    // Start upload using UploadThing
    try {
      await startUpload(queuedFiles.map((f) => f.file));
    } catch (error) {
      console.error("Upload failed:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", error: "Upload failed" }
            : f,
        ),
      );
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
        {/* Metadata Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Model Type</p>
            <RadioGroup
              className="flex-wrap"
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
            items={languages}
            label="Language"
            labelPlacement="outside"
            selectedKeys={[language]}
            onSelectionChange={(keys) =>
              setLanguage(Array.from(keys)[0] as string)
            }
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
            Supported: .wav, .mp3, .m4a, .ogg, .flac • Max size: 16MB per file
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium">Files to Upload ({files.length})</p>
              {completedCount > 0 && (
                <p className="text-sm text-success">
                  {completedCount} completed
                </p>
              )}
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
            {isUploading ? "Uploading..." : `Upload All (${queuedCount})`}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
