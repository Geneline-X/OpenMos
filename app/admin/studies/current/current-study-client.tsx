"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";

import { StudyWithRelations, StudyStats } from "@/app/actions/studies";

interface CurrentStudyClientProps {
  study: StudyWithRelations | null;
  stats: StudyStats | null;
}

export default function CurrentStudyClient({
  study,
  stats,
}: CurrentStudyClientProps) {
  const [copied, setCopied] = useState(false);

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

  const s = stats || {
    totalRaters: 0,
    completedRaters: 0,
    totalRatings: 0,
    avgMos: "--",
    completionRate: 0,
    modelPerformance: [],
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-success";
    if (score >= 3) return "text-warning";

    return "text-danger";
  };

  const getBarColor = (score: number) => {
    if (score >= 4) return "success";
    if (score >= 3) return "warning";

    return "danger";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Access Key Banner */}
      <Card className="bg-primary-50/50 border border-primary-100">
        <CardBody className="flex flex-row items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Icon
              className="h-5 w-5 text-primary"
              icon="solar:key-bold-duotone"
            />
            <div>
              <p className="text-sm text-default-600">
                Share this key with evaluators
              </p>
              <code className="text-lg font-mono font-bold text-primary">
                {study.accessKey}
              </code>
            </div>
          </div>
          <Button
            color={copied ? "success" : "primary"}
            size="sm"
            startContent={
              <Icon
                className="h-4 w-4"
                icon={copied ? "solar:check-circle-bold" : "solar:copy-bold"}
              />
            }
            variant="flat"
            onPress={() => {
              navigator.clipboard.writeText(study.accessKey);
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
          >
            {copied ? "Copied!" : "Copy Key"}
          </Button>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className="h-4 w-4 text-primary"
                icon="solar:users-group-rounded-bold-duotone"
              />
              <p className="text-sm text-default-500">Raters</p>
            </div>
            <p className="text-3xl font-bold">{s.totalRaters}</p>
            <p className="text-xs text-default-400 mt-2">
              {s.totalRaters > 0
                ? `${s.completedRaters} completed`
                : "Awaiting participants"}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className="h-4 w-4 text-success"
                icon="solar:star-bold-duotone"
              />
              <p className="text-sm text-default-500">Total Ratings</p>
            </div>
            <p className="text-3xl font-bold">{s.totalRatings}</p>
            <p className="text-xs text-default-400 mt-2">
              {s.totalRatings > 0
                ? `~${Math.round(s.totalRatings / Math.max(s.totalRaters, 1))} per rater`
                : "No ratings yet"}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className="h-4 w-4 text-warning"
                icon="solar:chart-bold-duotone"
              />
              <p className="text-sm text-default-500">Avg MOS</p>
            </div>
            <p className="text-3xl font-bold">{s.avgMos}</p>
            <p className="text-xs text-default-400 mt-2">
              {s.avgMos !== "--"
                ? "Mean Opinion Score (1-5)"
                : "No ratings yet"}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className="h-4 w-4 text-secondary"
                icon="solar:pie-chart-2-bold-duotone"
              />
              <p className="text-sm text-default-500">Completion Rate</p>
            </div>
            <p className="text-3xl font-bold">{s.completionRate}%</p>
            <p className="text-xs text-default-400 mt-2">
              {s.completedRaters} of {s.totalRaters} finished
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Model Performance */}
        <Card>
          <CardHeader>
            <p className="font-semibold">Model Performance</p>
          </CardHeader>
          <CardBody className="gap-4">
            {s.modelPerformance.length === 0 ? (
              <div className="text-center py-6">
                <Icon
                  className="h-10 w-10 text-default-200 mx-auto mb-2"
                  icon="solar:server-square-bold-duotone"
                />
                <p className="text-default-500 text-sm">
                  No rating data yet. Scores will appear as evaluators submit
                  ratings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {s.modelPerformance.map((mp) => {
                  const score = parseFloat(mp.avgScore);

                  return (
                    <div key={mp.model} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {mp.model}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-default-400">
                            {mp.count} ratings
                          </span>
                          <span className={`font-bold ${getScoreColor(score)}`}>
                            {mp.avgScore}
                          </span>
                        </div>
                      </div>
                      <Progress
                        color={getBarColor(score)}
                        size="sm"
                        value={(score / 5) * 100}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Study Details */}
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
              <div className="flex justify-between">
                <span className="text-default-500">Access Key</span>
                <code className="font-mono text-primary">
                  {study.accessKey}
                </code>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-divider">
              <Button
                as={Link}
                className="w-full"
                href="/admin/studies"
                startContent={
                  <Icon
                    className="h-4 w-4"
                    icon="solar:settings-bold-duotone"
                  />
                }
                variant="flat"
              >
                Manage Studies
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
