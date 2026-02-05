"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import { chartIcons } from "../icons";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DailyData {
  date: string;
  cumulative: number;
  daily: number;
}

interface ProgressTimelineChartProps {
  data?: DailyData[];
  target?: number;
  isLoading?: boolean;
}

const defaultData: DailyData[] = [];

export function ProgressTimelineChart({
  data = defaultData,
  target = 500,
  isLoading = false,
}: ProgressTimelineChartProps) {
  const current = data[data.length - 1]?.cumulative || 0;
  const hasReachedTarget = current >= target;
  
  // Handle empty data state
  const hasData = data && data.length > 0;

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    stroke: {
      curve: "smooth",
      width: [3, 0, 2],
    },
    fill: {
      type: ["gradient", "solid", "solid"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    colors: ["#1e40af", "#10b981", "#9ca3af"],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: data.map((d) => d.date),
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(target * 1.1, current * 1.1),
      title: {
        text: "Ratings",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
    },
    annotations: {
      yaxis: [
        {
          y: target,
          borderColor: "#9ca3af",
          borderWidth: 2,
          strokeDashArray: 5,
          label: {
            borderColor: "#9ca3af",
            style: {
              color: "#fff",
              background: "#9ca3af",
              fontSize: "11px",
            },
            text: `Target (n=${target})`,
            position: "right",
          },
        },
      ],
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: "Cumulative Total",
      type: "area" as const,
      data: data.map((d) => d.cumulative),
    },
    {
      name: "Daily New Ratings",
      type: "column" as const,
      data: data.map((d) => d.daily),
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Icon icon={chartIcons.lineChart} className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Collection Progress</h3>
        </div>
        <Chip
          color={hasReachedTarget ? "success" : "warning"}
          variant="flat"
          size="sm"
        >
          {current}/{target} ({Math.round((current / target) * 100)}%)
        </Chip>
      </CardHeader>

      <CardBody className="px-6 pb-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[280px] text-center">
            <Icon icon="solar:graph-up-bold-duotone" className="h-12 w-12 text-default-200 mb-3" />
            <p className="text-default-500 text-sm">No progress data yet</p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <Chart
              options={chartOptions}
              series={series}
              type="line"
              height="100%"
              width="100%"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
