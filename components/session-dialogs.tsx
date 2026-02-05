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
    (progress.current / progress.total) * 100
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
    <Modal isOpen={isOpen} onClose={onClose} size="md" hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-primary/10">
            <Icon
              icon="solar:login-bold-duotone"
              className="w-10 h-10 text-primary"
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
                value={completionPercentage}
                color="primary"
                className="max-w-full"
                size="md"
              />
              <div className="flex items-center gap-2 text-xs text-default-400">
                <Icon icon="solar:clock-circle-linear" className="w-4 h-4" />
                <span>Started {getRelativeTime(progress.startedAt)}</span>
              </div>
            </CardBody>
          </Card>
        </ModalBody>

        <ModalFooter className="flex-col gap-2 pb-6">
          <Button
            color="primary"
            className="w-full"
            size="lg"
            onPress={onResume}
            isLoading={isLoading}
            startContent={
              !isLoading && (
                <Icon icon="solar:restart-bold" className="w-5 h-5" />
              )
            }
          >
            Continue Evaluation
          </Button>
          <Button
            variant="light"
            className="w-full"
            onPress={onStartFresh}
            isDisabled={isLoading}
            startContent={
              <Icon icon="solar:trash-bin-linear" className="w-5 h-5" />
            }
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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-warning/10">
            <Icon
              icon="solar:shield-warning-bold-duotone"
              className="w-10 h-10 text-warning"
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
                icon="solar:close-circle-linear"
                className="w-4 h-4 text-danger"
              />
              Cleared browser data
            </li>
            <li className="flex items-center gap-2">
              <Icon
                icon="solar:close-circle-linear"
                className="w-4 h-4 text-danger"
              />
              Used private/incognito mode
            </li>
            <li className="flex items-center gap-2">
              <Icon
                icon="solar:close-circle-linear"
                className="w-4 h-4 text-danger"
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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-0">
          <div className="p-3 rounded-full bg-default-100">
            <Icon
              icon="solar:clock-circle-bold-duotone"
              className="w-10 h-10 text-default-400"
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
