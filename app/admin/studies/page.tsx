"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import Link from "next/link";

const studies = [
  {
    id: "1",
    name: "Luganda TTS Evaluation",
    status: "active",
    models: ["Orpheus", "NeMo", "Ground Truth"],
    raters: 32,
    ratings: 640,
    startDate: "Jan 15, 2026",
  },
  {
    id: "2",
    name: "Krio TTS Pilot",
    status: "completed",
    models: ["Orpheus", "NeMo"],
    raters: 15,
    ratings: 300,
    startDate: "Dec 10, 2025",
  },
  {
    id: "3",
    name: "Initial Testing",
    status: "completed",
    models: ["Orpheus"],
    raters: 5,
    ratings: 50,
    startDate: "Nov 20, 2025",
  },
];

export default function StudiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Studies</h1>
          <p className="text-default-500">Manage evaluation studies</p>
        </div>
        <Button color="primary" startContent={<Icon icon="solar:add-circle-bold" className="h-4 w-4" />}>
          New Study
        </Button>
      </div>

      <div className="grid gap-4">
        {studies.map((study) => (
          <Card key={study.id}>
            <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${study.status === "active" ? "bg-success/10" : "bg-default-100"}`}>
                  <Icon
                    icon={study.status === "active" ? "solar:play-circle-bold-duotone" : "solar:check-circle-bold-duotone"}
                    className={`h-6 w-6 ${study.status === "active" ? "text-success" : "text-default-400"}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{study.name}</h3>
                    <Chip size="sm" color={study.status === "active" ? "success" : "default"} variant="flat">
                      {study.status}
                    </Chip>
                  </div>
                  <p className="text-sm text-default-500 mt-1">
                    {study.models.join(", ")} • Started {study.startDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-semibold">{study.raters}</p>
                  <p className="text-xs text-default-500">Raters</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{study.ratings}</p>
                  <p className="text-xs text-default-500">Ratings</p>
                </div>
                <Button as={Link} href={`/admin/studies/${study.id}`} variant="flat" size="sm">
                  View
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
