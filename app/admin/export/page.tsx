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
            languages: 2, // From config/languages.ts
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export?format=${format}`);
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
        <p className="text-default-500">Download evaluation data for analysis</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:file-download-bold-duotone" className="h-5 w-5 text-primary" />
              <p className="font-semibold">Export Data</p>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Select
              label="Format"
              selectedKeys={[format]}
              onSelectionChange={(keys) => setFormat(Array.from(keys)[0] as string)}
            >
              <SelectItem key="csv">CSV (Excel)</SelectItem>
              <SelectItem key="json">JSON</SelectItem>
              <SelectItem key="latex">LaTeX Table</SelectItem>
            </Select>

            <div className="space-y-2">
              <p className="text-sm font-medium">Include columns:</p>
              <Checkbox defaultSelected size="sm">audio_id</Checkbox>
              <Checkbox defaultSelected size="sm">model_type</Checkbox>
              <Checkbox defaultSelected size="sm">score</Checkbox>
              <Checkbox defaultSelected size="sm">rater_id</Checkbox>
              <Checkbox defaultSelected size="sm">timestamp</Checkbox>
              <Checkbox defaultSelected size="sm">demographics</Checkbox>
            </div>

            <Button
              color="primary"
              onPress={handleExport}
              isLoading={isExporting}
              startContent={!isExporting && <Icon icon="solar:download-bold" className="h-4 w-4" />}
            >
              Download {format.toUpperCase()}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:document-text-bold-duotone" className="h-5 w-5 text-success" />
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
                  <span className="font-semibold">{stats.totalRatings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Unique Raters</span>
                  <span className="font-semibold">{stats.totalRaters.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Audio Samples</span>
                  <span className="font-semibold">{stats.totalSamples.toLocaleString()}</span>
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
