"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import { chartIcons } from "../icons";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RatingDistributionData {
  model: string;
  color: string;
  ratings: number[]; // [count for 1, count for 2, count for 3, count for 4, count for 5]
}

interface RatingDistributionChartProps {
  data?: RatingDistributionData[];
  isLoading?: boolean;
}

const defaultData: RatingDistributionData[] = [];

export function RatingDistributionChart({ 
  data = defaultData, 
  isLoading = false 
}: RatingDistributionChartProps) {
  const [viewMode, setViewMode] = useState<"grouped" | "stacked">("grouped");
  
  // Handle empty data state
  const hasData = data && data.length > 0;

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      stacked: viewMode === "stacked",
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
        speed: 600,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: viewMode === "stacked" ? "40%" : "70%",
        borderRadius: 4,
      },
    },
    colors: data.map((d) => d.color),
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["1", "2", "3", "4", "5"],
      title: {
        text: "Rating Score",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      title: {
        text: "Count",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        size: 12,
        shape: "circle" as const,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val} ratings`,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const series = data.map((d) => ({
    name: d.model,
    data: d.ratings,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Icon icon={chartIcons.pieChart} className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Rating Distribution</h3>
        </div>
        <ButtonGroup size="sm" variant="flat">
          <Button
            color={viewMode === "grouped" ? "primary" : "default"}
            onPress={() => setViewMode("grouped")}
          >
            Grouped
          </Button>
          <Button
            color={viewMode === "stacked" ? "primary" : "default"}
            onPress={() => setViewMode("stacked")}
          >
            Stacked
          </Button>
        </ButtonGroup>
      </CardHeader>

      <CardBody className="px-6 pb-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[320px] text-center">
            <Icon icon="solar:pie-chart-2-bold-duotone" className="h-12 w-12 text-default-200 mb-3" />
            <p className="text-default-500 text-sm">No distribution data yet</p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <Chart
              options={chartOptions}
              series={series}
              type="bar"
              height="100%"
              width="100%"
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
