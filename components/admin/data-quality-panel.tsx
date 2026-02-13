"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/theme";

import { qualityIcons } from "./icons";

interface QualityMetric {
  title: string;
  value: string;
  status: "good" | "warning" | "error";
  description: string;
  icon: string;
  actionLabel?: string;
  actionHref?: string;
}

interface QualityAlert {
  id: string;
  type: "warning" | "error";
  title: string;
  description: string;
  actions: Array<{
    label: string;
    variant?: "flat" | "solid" | "bordered";
    color?: "default" | "primary" | "danger";
    href?: string;
  }>;
}

interface DataQualityPanelProps {
  metrics?: QualityMetric[];
  alerts?: QualityAlert[];
  isLoading?: boolean;
}

const defaultMetrics: QualityMetric[] = [
  {
    title: "Inter-Rater Reliability",
    value: "0.78",
    status: "good",
    description: "Krippendorff's α (Acceptable)",
    icon: qualityIcons.qualityGood,
    actionLabel: "Learn More",
  },
  {
    title: "Response Time Distribution",
    value: "32s",
    status: "good",
    description: "Median • IQR: 24-45s",
    icon: qualityIcons.info,
    actionLabel: "View Details",
  },
  {
    title: "Outlier Detection",
    value: "3",
    status: "warning",
    description: "Outliers flagged",
    icon: qualityIcons.qualityWarning,
    actionLabel: "Review Now",
  },
];

const defaultAlerts: QualityAlert[] = [
  {
    id: "1",
    type: "warning",
    title: "Rater #43 completed evaluation in 4m 12s (avg is 11m)",
    description: "Possible rushed responses",
    actions: [
      { label: "Review", variant: "flat", color: "primary" },
      { label: "Flag", variant: "flat", color: "danger" },
      { label: "Dismiss", variant: "flat", color: "default" },
    ],
  },
  {
    id: "2",
    type: "warning",
    title: "Sample lug_nemo_015 has unusually low agreement (α=0.45)",
    description: "Possible audio quality issue",
    actions: [
      { label: "Listen", variant: "flat", color: "primary" },
      { label: "Replace", variant: "flat", color: "danger" },
      { label: "Dismiss", variant: "flat", color: "default" },
    ],
  },
];

const statusConfig = {
  good: {
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success",
    chipColor: "success" as const,
  },
  warning: {
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning",
    chipColor: "warning" as const,
  },
  error: {
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger",
    chipColor: "danger" as const,
  },
};

function QualityMetricCard({ metric }: { metric: QualityMetric }) {
  const config = statusConfig[metric.status];

  return (
    <Card className="shadow-sm">
      <CardBody className="p-3">
        <div className="flex items-start gap-2">
          <div className={cn("rounded-lg p-1.5", config.bgColor)}>
            <Icon className={cn("h-5 w-5", config.color)} icon={metric.icon} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-default-500">
              {metric.title}
            </p>
            <p className="text-xl font-bold text-default-900">{metric.value}</p>
            <p className="text-xs text-default-400">{metric.description}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function QualityAlertItem({
  alert,
  onDismiss,
}: {
  alert: QualityAlert;
  onDismiss?: () => void;
}) {
  const isError = alert.type === "error";

  return (
    <div
      className={cn(
        "rounded-lg border-l-3 bg-default-50 p-3",
        isError ? "border-l-danger" : "border-l-warning",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            className={cn(
              "h-4 w-4 flex-shrink-0",
              isError ? "text-danger" : "text-warning",
            )}
            icon={
              isError ? qualityIcons.qualityError : qualityIcons.qualityWarning
            }
          />
          <p className="text-sm font-medium text-default-900 truncate">
            {alert.title}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {alert.actions.slice(0, 2).map((action, idx) => (
            <Button
              key={idx}
              color={action.color || "default"}
              size="sm"
              variant="light"
              onPress={action.label === "Dismiss" ? onDismiss : undefined}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DataQualityPanel({
  metrics = defaultMetrics,
  alerts = defaultAlerts,
  isLoading = false,
}: DataQualityPanelProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Icon
            className="h-5 w-5 text-primary"
            icon="solar:shield-check-bold-duotone"
          />
          <h3 className="text-lg font-semibold">Quality Metrics</h3>
        </div>
        {alerts.length > 0 && (
          <Chip color="warning" size="sm" variant="flat">
            {alerts.length} alert{alerts.length > 1 ? "s" : ""}
          </Chip>
        )}
      </CardHeader>

      <CardBody className="px-6 pb-6">
        {/* Quality Metrics Grid */}
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric, idx) => (
            <QualityMetricCard key={idx} metric={metric} />
          ))}
        </div>

        {/* Quality Alerts */}
        {alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <QualityAlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
