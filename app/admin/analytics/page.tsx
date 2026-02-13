"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";

import {
  MOSComparisonChart,
  RatingDistributionChart,
  ProgressTimelineChart,
} from "@/components/admin";

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

interface RatingDistributionData {
  model: string;
  color: string;
  ratings: number[];
}

interface DailyData {
  date: string;
  cumulative: number;
  daily: number;
}

interface Demographics {
  gender: { gender: string; count: number }[];
  age: { ageGroup: string; count: number }[];
  language: { language: string; count: number }[];
}

interface AnalyticsData {
  mosComparison: ModelData[];
  ratingDistribution: RatingDistributionData[];
  progressTimeline: {
    data: DailyData[];
    target: number;
    current: number;
  };
  demographics: Demographics;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");

        if (res.ok) {
          const data = await res.json();

          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-default-500">Detailed analysis of evaluation data</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* MOS Comparison - Full Width */}
          <MOSComparisonChart
            data={analytics?.mosComparison}
            isLoading={isLoading}
          />

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RatingDistributionChart
              data={analytics?.ratingDistribution}
              isLoading={isLoading}
            />
            <ProgressTimelineChart
              data={analytics?.progressTimeline?.data}
              isLoading={isLoading}
              target={analytics?.progressTimeline?.target}
            />
          </div>

          {/* Demographics Section */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Gender Distribution */}
            <Card>
              <CardHeader className="flex gap-3">
                <Icon
                  className="h-5 w-5 text-primary"
                  icon="solar:users-group-rounded-bold-duotone"
                />
                <div>
                  <p className="font-semibold">Gender Distribution</p>
                </div>
              </CardHeader>
              <CardBody>
                {analytics?.demographics?.gender &&
                analytics.demographics.gender.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.demographics.gender.map((item) => (
                      <div
                        key={item.gender}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize">
                          {item.gender || "Not specified"}
                        </span>
                        <Chip size="sm" variant="flat">
                          {item.count}
                        </Chip>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-400 py-4">
                    No data yet
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Age Distribution */}
            <Card>
              <CardHeader className="flex gap-3">
                <Icon
                  className="h-5 w-5 text-success"
                  icon="solar:calendar-bold-duotone"
                />
                <div>
                  <p className="font-semibold">Age Groups</p>
                </div>
              </CardHeader>
              <CardBody>
                {analytics?.demographics?.age &&
                analytics.demographics.age.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.demographics.age.map((item) => (
                      <div
                        key={item.ageGroup}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{item.ageGroup}</span>
                        <Chip size="sm" variant="flat">
                          {item.count}
                        </Chip>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-400 py-4">
                    No data yet
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader className="flex gap-3">
                <Icon
                  className="h-5 w-5 text-warning"
                  icon="solar:global-bold-duotone"
                />
                <div>
                  <p className="font-semibold">Languages</p>
                </div>
              </CardHeader>
              <CardBody>
                {analytics?.demographics?.language &&
                analytics.demographics.language.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.demographics.language.map((item) => (
                      <div
                        key={item.language}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize">
                          {item.language}
                        </span>
                        <Chip color="primary" size="sm" variant="flat">
                          {item.count}
                        </Chip>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-400 py-4">
                    No data yet
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
