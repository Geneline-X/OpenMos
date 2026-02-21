"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";

interface ExportStats {
  totalRatings: number;
  totalRaters: number;
  totalSamples: number;
  languages: number;
}

export default function ExportPage() {
  const [format, setFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const allColumns = [
    "audio_id",
    "model_type",
    "score",
    "rater_id",
    "timestamp",
    "language",
    "age",
    "gender",
    "playback_count",
    "time_to_rate_ms",
    "session_id",
  ];

  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(allColumns),
  );

  // Fetch real stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");

        if (res.ok) {
          const data = await res.json();

          setStats({
            totalRatings: data.totalRatings || 0,
            totalRaters: data.totalRaters || 0,
            totalSamples: data.totalSamples || 0,
            languages: data.totalLanguages || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleColumnToggle = (column: string) => {
    const newSelected = new Set(selectedColumns);

    if (newSelected.has(column)) {
      newSelected.delete(column);
    } else {
      newSelected.add(column);
    }
    setSelectedColumns(newSelected);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const columnsParam = Array.from(selectedColumns).join(",");
      const response = await fetch(
        `/api/export?format=${format}&columns=${columnsParam}`,
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = `mos-ratings.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export Center</h1>
        <p className="text-default-500">
          Download evaluation data for analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon
                className="h-5 w-5 text-primary"
                icon="solar:file-download-bold-duotone"
              />
              <p className="font-semibold">Export Data</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Select
              label="Format"
              selectedKeys={[format]}
              onSelectionChange={(keys) =>
                setFormat(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="csv">CSV (Excel)</SelectItem>
              <SelectItem key="json">JSON</SelectItem>
              <SelectItem key="latex">LaTeX Table</SelectItem>
            </Select>

            <div className="space-y-2">
              <p className="text-sm font-medium">Include columns:</p>
              <div className="grid grid-cols-2 gap-2">
                {allColumns.map((col) => (
                  <Checkbox
                    key={col}
                    isSelected={selectedColumns.has(col)}
                    size="sm"
                    onValueChange={() => handleColumnToggle(col)}
                  >
                    {col}
                  </Checkbox>
                ))}
              </div>
            </div>

            <Button
              color="primary"
              isDisabled={selectedColumns.size === 0}
              isLoading={isExporting}
              startContent={
                !isExporting && (
                  <Icon className="h-4 w-4" icon="solar:download-bold" />
                )
              }
              onPress={handleExport}
            >
              Download {format.toUpperCase()}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon
                className="h-5 w-5 text-success"
                icon="solar:document-text-bold-duotone"
              />
              <p className="font-semibold">Quick Stats</p>
            </div>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-default-500">Total Ratings</span>
                  <span className="font-semibold">
                    {stats.totalRatings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Unique Raters</span>
                  <span className="font-semibold">
                    {stats.totalRaters.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Audio Samples</span>
                  <span className="font-semibold">
                    {stats.totalSamples.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Languages</span>
                  <span className="font-semibold">{stats.languages}</span>
                </div>
              </div>
            ) : (
              <p className="text-default-500 text-center">No data available</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
