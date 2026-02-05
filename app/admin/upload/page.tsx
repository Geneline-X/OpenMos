"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";
import { AudioUploader } from "@/components/audio-uploader";

export default function AdminUploadPage() {
  const handleUploadComplete = (files: { url: string; key: string }[]) => {
    console.log("Upload complete:", files);
    // In production, the files are already saved to DB via UploadThing callback
  };

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          as={Link}
          href="/admin"
          variant="light"
          isIconOnly
        >
          <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Samples</h1>
          <p className="text-sm text-default-500">Add new audio samples for evaluation</p>
        </div>
      </div>

      {/* Upload Component */}
      <AudioUploader onUploadComplete={handleUploadComplete} />

      {/* Instructions */}
      <Card className="mt-6 bg-primary/5 border border-primary/20" shadow="none">
        <CardHeader className="flex items-center gap-2">
          <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Upload Guidelines</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <ul className="text-sm text-default-600 space-y-2">
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success mt-0.5" />
              <span>Select the correct <strong>model type</strong> before uploading</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success mt-0.5" />
              <span>Use <strong>WAV format</strong> for best quality (MP3 also accepted)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success mt-0.5" />
              <span>Ensure audio is <strong>3-30 seconds</strong> in duration</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success mt-0.5" />
              <span>Upload <strong>equal numbers</strong> of samples per model type</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="solar:shield-warning-linear" className="w-4 h-4 text-warning mt-0.5" />
              <span>Maximum file size: <strong>16MB</strong> per file</span>
            </li>
          </ul>
        </CardBody>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card shadow="sm">
          <CardBody className="text-center py-4">
            <Icon icon="solar:microphone-bold-duotone" className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">20</p>
            <p className="text-xs text-default-500">Orpheus Samples</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="text-center py-4">
            <Icon icon="solar:soundwave-bold-duotone" className="w-8 h-8 mx-auto text-warning mb-2" />
            <p className="text-2xl font-bold">20</p>
            <p className="text-xs text-default-500">NeMo Samples</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="text-center py-4">
            <Icon icon="solar:star-bold-duotone" className="w-8 h-8 mx-auto text-success mb-2" />
            <p className="text-2xl font-bold">20</p>
            <p className="text-xs text-default-500">Ground Truth</p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
