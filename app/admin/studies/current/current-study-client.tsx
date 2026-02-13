"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import Link from "next/link";
import { format } from "date-fns";

import { StudyWithRelations } from "@/app/actions/studies";

interface CurrentStudyClientProps {
  study: StudyWithRelations | null;
}

export default function CurrentStudyClient({ study }: CurrentStudyClientProps) {
  if (!study) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Icon
          className="h-16 w-16 text-default-300"
          icon="solar:folder-with-files-bold-duotone"
        />
        <h2 className="text-xl font-semibold">No Active Study</h2>
        <p className="text-default-500 max-w-md">
          There is no ongoing study at the moment. Activate a study from the
          management page to see its progress here.
        </p>
        <Button as={Link} color="primary" href="/admin/studies">
          Manage Studies
        </Button>
      </div>
    );
  }

  // Placeholder stats for now - to be replaced with real data in future tasks
  const stats = {
    targetRaters: 50,
    completedRaters: 0,
    totalRatings: 0,
    targetRatings: 1000,
    avgMos: 0,
    completionRate: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Current Study</h1>
          <p className="text-default-500">{study.name}</p>
        </div>
        <Chip
          color="success"
          startContent={
            <Icon className="h-4 w-4" icon="solar:play-circle-bold" />
          }
          variant="flat"
        >
          Active
        </Chip>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Target Raters</p>
            <p className="text-3xl font-bold">{stats.targetRaters}</p>
            <Progress
              className="mt-2"
              color="primary"
              size="sm"
              value={(stats.completedRaters / stats.targetRaters) * 100}
            />
            <p className="text-xs text-default-400 mt-1">
              {stats.completedRaters} completed
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Total Ratings</p>
            <p className="text-3xl font-bold">{stats.totalRatings}</p>
            <Progress
              className="mt-2"
              color="success"
              size="sm"
              value={(stats.totalRatings / stats.targetRatings) * 100}
            />
            <p className="text-xs text-default-400 mt-1">
              Target: {stats.targetRatings}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Avg MOS</p>
            <p className="text-3xl font-bold">--</p>
            <p className="text-xs text-default-400 mt-2">No ratings yet</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Completion Rate</p>
            <p className="text-3xl font-bold">{stats.completionRate}%</p>
            <p className="text-xs text-default-400 mt-2">
              {stats.completedRaters} of {stats.targetRaters} finished
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="font-semibold">Model Performance</p>
          </CardHeader>
          <CardBody className="gap-4">
            <p className="text-default-500 text-sm text-center py-4">
              Insufficient data to display model performance.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-semibold">Study Details</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-default-500">Languages</span>
                <span className="text-right capitalize">
                  {study.languages.length > 0
                    ? study.languages.join(", ")
                    : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Models</span>
                <span className="text-right capitalize">
                  {study.models.length > 0 ? study.models.join(", ") : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Samples per rater</span>
                <span>{study.samplesPerRater}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Started</span>
                <span>{format(new Date(study.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
