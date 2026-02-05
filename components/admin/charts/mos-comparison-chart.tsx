"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@heroui/table";
import { Icon } from "@iconify/react";
import { Tooltip } from "@heroui/tooltip";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

import { chartIcons } from "../icons";

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ModelData {
  name: string;
  mean: number;
  stdDev: number;
  ciLower: number;
  ciUpper: number;
  n: number;
  pValue: string | null;
  color: string;
}

interface MOSComparisonChartProps {
  data?: ModelData[];
  isLoading?: boolean;
}

const defaultData: ModelData[] = [];

function generateLatexTable(data: ModelData[]): string {
  const rows = data
    .map(
      (d) =>
        `${d.name} & ${d.mean.toFixed(2)} & ${d.stdDev.toFixed(2)} & [${d.ciLower.toFixed(2)}, ${d.ciUpper.toFixed(2)}] & ${d.n} & ${d.pValue || "-"} \\\\`
    )
    .join("\n");

  return `\\begin{table}[h]
\\centering
\\caption{MOS Comparison Across Models}
\\label{tab:mos_comparison}
\\begin{tabular}{lccccc}
\\toprule
Model & Mean & Std Dev & 95\\% CI & n & p-value \\\\
\\midrule
${rows}
\\bottomrule
\\end{tabular}
\\end{table}`;
}

export function MOSComparisonChart({ data = defaultData, isLoading = false }: MOSComparisonChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Handle empty data state
  const hasData = data && data.length > 0;

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
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
        export: {
          csv: {
            filename: "mos_comparison",
          },
          svg: {
            filename: "mos_comparison",
          },
          png: {
            filename: "mos_comparison",
          },
        },
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: data.map((d) => d.color),
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts) => {
        const model = data[opts.dataPointIndex];
        return `${val.toFixed(2)} ± ${model.stdDev.toFixed(2)}`;
      },
      offsetY: -25,
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#374151"],
      },
    },
    xaxis: {
      categories: data.map((d) => d.name),
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      min: 1,
      max: 5,
      tickAmount: 4,
      title: {
        text: "Mean Opinion Score (MOS)",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (val: number) => val.toFixed(1),
      },
    },
    annotations: {
      yaxis: [
        {
          y: 3.0,
          borderColor: "#6b7280",
          borderWidth: 2,
          strokeDashArray: 5,
          label: {
            borderColor: "#6b7280",
            style: {
              color: "#fff",
              background: "#6b7280",
              fontSize: "11px",
            },
            text: "Acceptance Threshold (3.0)",
            position: "right",
          },
        },
      ],
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const model = data[dataPointIndex];
        return `
          <div class="p-3 bg-background border border-divider rounded-lg shadow-lg">
            <p class="font-semibold text-default-900">${model.name}</p>
            <div class="mt-2 space-y-1 text-sm">
              <p><span class="text-default-500">Mean:</span> ${model.mean.toFixed(2)}</p>
              <p><span class="text-default-500">Std Dev:</span> ${model.stdDev.toFixed(2)}</p>
              <p><span class="text-default-500">95% CI:</span> [${model.ciLower.toFixed(2)}, ${model.ciUpper.toFixed(2)}]</p>
              <p><span class="text-default-500">n:</span> ${model.n}</p>
              ${model.pValue ? `<p><span class="text-default-500">p-value:</span> ${model.pValue}</p>` : ""}
            </div>
          </div>
        `;
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: "MOS",
      data: data.map((d) => d.mean),
    },
  ];

  const handleCopyLatex = () => {
    const latex = generateLatexTable(data);
    navigator.clipboard.writeText(latex);
    // Could add a toast notification here
  };

  const handleDownloadPNG = () => {
    // ApexCharts toolbar handles this
  };

  return (
    <Card className={`shadow-sm ${isFullscreen ? "fixed inset-4 z-50" : ""}`}>
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Icon icon={chartIcons.barChart} className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">MOS Comparison</h3>
        </div>
        <div className="flex gap-1">
          <Tooltip content="Export">
            <Button isIconOnly size="sm" variant="light">
              <Icon icon={chartIcons.export} className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content={isFullscreen ? "Exit" : "Expand"}>
            <Button 
              isIconOnly 
              size="sm" 
              variant="light"
              onPress={() => setIsFullscreen(!isFullscreen)}
            >
              <Icon 
                icon={isFullscreen ? chartIcons.minimize : chartIcons.fullscreen} 
                className="h-4 w-4" 
              />
            </Button>
          </Tooltip>
        </div>
      </CardHeader>

      <CardBody className="px-6 pb-6">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[350px] text-center">
            <Icon icon="solar:chart-2-bold-duotone" className="h-16 w-16 text-default-200 mb-4" />
            <p className="text-default-500 font-medium">No rating data yet</p>
            <p className="text-default-400 text-sm mt-1">
              Charts will appear once raters submit evaluations
            </p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className={`w-full ${isFullscreen ? "h-[60vh]" : "h-[350px]"}`}>
              <Chart
                options={chartOptions}
                series={series}
                type="bar"
                height="100%"
                width="100%"
              />
            </div>

            {/* Compact Stats Table */}
            <Table 
              aria-label="MOS comparison table"
              classNames={{
                wrapper: "shadow-none border border-divider mt-4",
              }}
              isCompact
            >
              <TableHeader>
                <TableColumn>Model</TableColumn>
                <TableColumn align="center">MOS</TableColumn>
                <TableColumn align="center">±SD</TableColumn>
                <TableColumn align="center">n</TableColumn>
              </TableHeader>
              <TableBody>
                {data.map((model, idx) => (
                  <TableRow key={model.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: model.color }}
                        />
                        <span className="text-sm">{model.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {model.mean.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {model.stdDev.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-sm">{model.n}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardBody>
    </Card>
  );
}
