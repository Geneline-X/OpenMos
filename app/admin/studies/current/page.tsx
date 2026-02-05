"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";

export default function CurrentStudyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Current Study</h1>
          <p className="text-default-500">Luganda TTS Evaluation</p>
        </div>
        <Chip color="success" variant="flat" startContent={<Icon icon="solar:play-circle-bold" className="h-4 w-4" />}>
          Active
        </Chip>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Target Raters</p>
            <p className="text-3xl font-bold">50</p>
            <Progress value={64} size="sm" color="primary" className="mt-2" />
            <p className="text-xs text-default-400 mt-1">32 completed</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Total Ratings</p>
            <p className="text-3xl font-bold">640</p>
            <Progress value={64} size="sm" color="success" className="mt-2" />
            <p className="text-xs text-default-400 mt-1">Target: 1000</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Avg MOS</p>
            <p className="text-3xl font-bold">3.72</p>
            <p className="text-xs text-success mt-2">↑ 0.12 from last week</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-default-500">Completion Rate</p>
            <p className="text-3xl font-bold">78%</p>
            <p className="text-xs text-default-400 mt-2">25 of 32 finished</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="font-semibold">Model Performance</p>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <span>Ground Truth</span>
              <div className="flex items-center gap-2">
                <Progress value={92} size="sm" color="success" className="w-32" />
                <span className="font-mono">4.58</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Orpheus</span>
              <div className="flex items-center gap-2">
                <Progress value={76} size="sm" color="primary" className="w-32" />
                <span className="font-mono">3.82</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>NeMo</span>
              <div className="flex items-center gap-2">
                <Progress value={60} size="sm" color="warning" className="w-32" />
                <span className="font-mono">3.01</span>
              </div>
            </div>
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
                <span>Luganda, Krio</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Models</span>
                <span>Orpheus, NeMo, Ground Truth</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Samples per rater</span>
                <span>20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Started</span>
                <span>Jan 15, 2026</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
