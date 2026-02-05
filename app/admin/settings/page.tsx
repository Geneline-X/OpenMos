"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function SettingsPage() {
  const [studyName, setStudyName] = useState("Luganda TTS Evaluation");
  const [samplesPerRater, setSamplesPerRater] = useState("20");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [qualityAlerts, setQualityAlerts] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-default-500">Configure platform and study settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:clipboard-text-bold-duotone" className="h-5 w-5 text-primary" />
              <p className="font-semibold">Study Configuration</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Input
              label="Study Name"
              value={studyName}
              onValueChange={setStudyName}
            />
            <Input
              label="Samples per Rater"
              type="number"
              value={samplesPerRater}
              onValueChange={setSamplesPerRater}
              description="Number of audio samples each rater will evaluate"
            />
            <Select
              label="Languages"
              selectionMode="multiple"
              defaultSelectedKeys={["luganda", "krio"]}
            >
              <SelectItem key="luganda">Luganda</SelectItem>
              <SelectItem key="krio">Krio</SelectItem>
            </Select>
            <Select
              label="Models"
              selectionMode="multiple"
              defaultSelectedKeys={["orpheus", "nemo", "ground"]}
            >
              <SelectItem key="orpheus">Orpheus</SelectItem>
              <SelectItem key="nemo">NeMo</SelectItem>
              <SelectItem key="ground">Ground Truth</SelectItem>
            </Select>
          </CardBody>
        </Card>

        {/* Dashboard Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:settings-bold-duotone" className="h-5 w-5 text-warning" />
              <p className="font-semibold">Dashboard Preferences</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-refresh</p>
                <p className="text-sm text-default-500">Update dashboard data automatically</p>
              </div>
              <Switch isSelected={autoRefresh} onValueChange={setAutoRefresh} />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-default-500">Receive daily summary emails</p>
              </div>
              <Switch isSelected={emailNotifications} onValueChange={setEmailNotifications} />
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Quality Alerts</p>
                <p className="text-sm text-default-500">Get notified of data quality issues</p>
              </div>
              <Switch isSelected={qualityAlerts} onValueChange={setQualityAlerts} />
            </div>
          </CardBody>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader className="flex justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="h-5 w-5 text-success" />
              <p className="font-semibold">User Management</p>
            </div>
            <Button as={Link} href="/admin/settings/users" size="sm" variant="flat">
              Manage Users
            </Button>
          </CardHeader>
          <CardBody>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-default-500">Total Admin Users</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Owners</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-500">Researchers</span>
                <span className="font-medium">2</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-check-bold-duotone" className="h-5 w-5 text-secondary" />
              <p className="font-semibold">Data & Privacy</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="rounded-lg bg-default-100 p-3 text-sm">
              <p className="font-medium">Data Retention</p>
              <p className="text-default-500 mt-1">
                Rater data is stored anonymously. Only age, gender, and language are collected.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="flat" color="danger" size="sm">
                <Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4 mr-1" />
                Clear Test Data
              </Button>
              <Button variant="flat" size="sm">
                <Icon icon="solar:download-bold" className="h-4 w-4 mr-1" />
                Export All Data
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="flat">Reset to Defaults</Button>
        <Button color="primary">Save Changes</Button>
      </div>
    </div>
  );
}
