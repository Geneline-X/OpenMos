"use client";

import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

interface ResumeSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  onStartFresh: () => void;
  progress: {
    current: number;
    total: number;
    startedAt: string;
  };
  isLoading?: boolean;
}

export function ResumeSessionDialog({
  isOpen,
  onClose,
  onResume,
  onStartFresh,
  progress,
  isLoading,
}: ResumeSessionDialogProps) {
  const completionPercentage = Math.round(
    (progress.current / progress.total) * 100,
  );

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "yesterday";

    return `${diffDays} days ago`;
  };

  return (
    <Modal hideCloseButton isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon
              className="w-10 h-10 text-primary"
              icon="solar:login-bold-duotone"
            />
          </div>
          <h2 className="text-xl font-bold">Welcome Back!</h2>
        </ModalHeader>

        <ModalBody className="px-6 py-6">
          <p className="text-center text-default-500 mb-4">
            We detected a previous session on this device.
          </p>

          <Card className="bg-default-50">
            <CardBody className="gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-default-500">Progress</span>
                <span className="text-sm font-semibold">
                  {progress.current}/{progress.total} samples
                </span>
              </div>
              <Progress
                className="max-w-full"
                color="primary"
                size="md"
                value={completionPercentage}
              />
              <div className="flex items-center gap-2 text-xs text-default-400">
                <Icon className="w-4 h-4" icon="solar:clock-circle-linear" />
                <span>Started {getRelativeTime(progress.startedAt)}</span>
              </div>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter className="flex-col gap-2 pb-6">
          <Button
            className="w-full"
            color="primary"
            isLoading={isLoading}
            size="lg"
            startContent={
              !isLoading && (
                <Icon className="w-5 h-5" icon="solar:restart-bold" />
              )
            }
            onPress={onResume}
          >
            Continue Evaluation
          </Button>
          <Button
            className="w-full"
            isDisabled={isLoading}
            startContent={
              <Icon className="w-5 h-5" icon="solar:trash-bin-linear" />
            }
            variant="light"
            onPress={onStartFresh}
          >
            Start Fresh Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Session lost dialog
interface SessionLostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
}

export function SessionLostDialog({
  isOpen,
  onClose,
  onStartNew,
}: SessionLostDialogProps) {
  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-warning/10">
            <Icon
              className="w-10 h-10 text-warning"
              icon="solar:shield-warning-bold-duotone"
            />
          </div>
          <h2 className="text-xl font-bold">Session Lost</h2>
        </ModalHeader>

        <ModalBody className="px-6 py-6">
          <p className="text-center text-default-500 mb-4">
            We couldn&apos;t find your progress. This might happen if you:
          </p>
          <ul className="space-y-2 text-sm text-default-500">
            <li className="flex items-center gap-2">
              <Icon
                className="w-4 h-4 text-danger"
                icon="solar:close-circle-linear"
              />
              Cleared browser data
            </li>
            <li className="flex items-center gap-2">
              <Icon
                className="w-4 h-4 text-danger"
                icon="solar:close-circle-linear"
              />
              Used private/incognito mode
            </li>
            <li className="flex items-center gap-2">
              <Icon
                className="w-4 h-4 text-danger"
                icon="solar:close-circle-linear"
              />
              Switched devices
            </li>
          </ul>
          <p className="text-center text-sm text-default-400 mt-4">
            Your previous ratings are saved, but you&apos;ll need to start a new
            evaluation session.
          </p>
        </ModalBody>

        <ModalFooter className="justify-center pb-6">
          <Button color="primary" onPress={onStartNew}>
            Start New Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Session expired dialog
interface SessionExpiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
}

export function SessionExpiredDialog({
  isOpen,
  onClose,
  onStartNew,
}: SessionExpiredDialogProps) {
  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-default-100">
            <Icon
              className="w-10 h-10 text-default-400"
              icon="solar:clock-circle-bold-duotone"
            />
          </div>
          <h2 className="text-xl font-bold">Session Expired</h2>
        </ModalHeader>

        <ModalBody className="px-6 py-6">
          <p className="text-center text-default-500">
            Your previous session has expired. Sessions are valid for 7 days
            from your last activity.
          </p>
          <p className="text-center text-sm text-default-400 mt-4">
            Don&apos;t worry, your previous ratings have been saved!
          </p>
        </ModalBody>

        <ModalFooter className="justify-center pb-6">
          <Button color="primary" onPress={onStartNew}>
            Start New Session
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
