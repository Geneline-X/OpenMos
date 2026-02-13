"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/theme";

import { exportIcons } from "./icons";

interface QuickExport {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  format: string;
}

interface ExportCenterProps {
  onExport?: (exportType: string) => void;
}

const quickExports: QuickExport[] = [
  {
    id: "csv",
    icon: exportIcons.csv,
    iconColor: "text-success",
    title: "CSV",
    format: ".csv",
  },
  {
    id: "excel",
    icon: exportIcons.excel,
    iconColor: "text-warning",
    title: "Excel",
    format: ".xlsx",
  },
  {
    id: "json",
    icon: exportIcons.json,
    iconColor: "text-secondary",
    title: "JSON",
    format: ".json",
  },
  {
    id: "latex",
    icon: exportIcons.latex,
    iconColor: "text-primary",
    title: "LaTeX",
    format: ".tex",
  },
];

export function ExportCenter({ onExport }: ExportCenterProps) {
  const handleExport = (exportId: string) => {
    onExport?.(exportId);
    console.log(`Exporting: ${exportId}`);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Icon
            className="h-5 w-5 text-primary"
            icon="solar:download-bold-duotone"
          />
          <h3 className="text-lg font-semibold">Export</h3>
        </div>
      </CardHeader>

      <CardBody className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-2">
          {quickExports.map((exp) => (
            <Button
              key={exp.id}
              className="h-auto flex-col items-center gap-1 py-3"
              variant="flat"
              onPress={() => handleExport(exp.id)}
            >
              <Icon className={cn("h-6 w-6", exp.iconColor)} icon={exp.icon} />
              <span className="text-xs font-medium">{exp.title}</span>
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
