"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  StatsOverview,
  MOSComparisonChart,
  RatingDistributionChart,
  ProgressTimelineChart,
  ActivityFeed,
} from "@/components/admin";

interface Stats {
  totalRatings: number;
  ratingsToday: number;
  ratingsTrend: number;
  activeSessions: number;
  avgSessionDuration: string;
  completionRate: number;
  completionTrend: number;
  avgDuration: string;
  durationDiff: string;
}

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

interface AnalyticsData {
  mosComparison: ModelData[];
  ratingDistribution: RatingDistributionData[];
  progressTimeline: {
    data: DailyData[];
    target: number;
    current: number;
  };
}

/**
 * OpenMOS Professional Admin Dashboard
 *
 * A publication-ready interface for academic researchers conducting
 * Mean Opinion Score (MOS) evaluations for AI voice model validation.
 */
export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | undefined>(undefined);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats and analytics in parallel
        const [statsRes, analyticsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/analytics"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();

          setStats(statsData);
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();

          setAnalytics(analyticsData);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date: Date | null) => {
    if (!date) return "Loading...";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 120) return "1 minute ago";

    return `${Math.floor(seconds / 60)} minutes ago`;
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-default-900">
          Welcome back,{" "}
          {session?.user?.fullName || session?.user?.username || "Researcher"}{" "}
          👋
        </h1>
        <p className="mt-1 text-sm text-default-500">
          Last data update: {getTimeAgo(lastUpdated)}
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Statistics Overview */}
        <StatsOverview isLoading={isLoading} stats={stats} />

        {/* Primary Visualization - MOS Comparison */}
        <MOSComparisonChart
          data={analytics?.mosComparison}
          isLoading={isLoading}
        />

        {/* Two-Column Layout: Rating Distribution + Progress Timeline */}
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

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </>
  );
}
