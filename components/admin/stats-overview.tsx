"use client";

import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";
import { Skeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";

import { statIcons } from "./icons";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  href?: string;
  linkText?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  href,
  linkText = "View →",
  iconColor = "text-primary",
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <Skeleton className="h-6 w-6 rounded-lg mb-3" />
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      className="shadow-sm transition-all duration-200 hover:shadow-md"
      isPressable={!!href}
    >
      <CardBody className="p-4">
        <div
          className={cn(
            "mb-2 inline-flex rounded-lg bg-default-100 p-1.5",
            iconColor,
          )}
        >
          <Icon className="h-6 w-6" icon={icon} />
        </div>

        <p className="text-xs font-medium text-default-500 mb-0.5">{title}</p>

        <p className="text-3xl font-bold text-default-900 mb-1">{value}</p>

        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                trend.isPositive ? "text-success" : "text-danger",
              )}
            >
              <Icon
                className="h-3 w-3"
                icon={
                  trend.isPositive ? statIcons.trendUp : statIcons.trendDown
                }
              />
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {subtitle && <span className="text-default-400">{subtitle}</span>}
        </div>
      </CardBody>
    </Card>
  );
}

interface StatsOverviewProps {
  isLoading?: boolean;
  stats?: {
    totalRatings: number;
    ratingsToday: number;
    ratingsTrend: number;
    activeSessions: number;
    avgSessionDuration: string;
    completionRate: number;
    completionTrend: number;
    avgDuration: string;
    durationDiff: string;
  };
}

export function StatsOverview({
  isLoading = false,
  stats,
}: StatsOverviewProps) {
  // Default stats when no data
  const defaultStats = {
    totalRatings: 0,
    ratingsToday: 0,
    ratingsTrend: 0,
    activeSessions: 0,
    avgSessionDuration: "N/A",
    completionRate: 0,
    completionTrend: 0,
    avgDuration: "N/A",
    durationDiff: "",
  };

  const data = stats || defaultStats;

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={statIcons.totalRatings}
          iconColor="text-primary"
          isLoading={isLoading}
          subtitle={`+${data.ratingsToday} today`}
          title="Total Ratings"
          trend={{
            value: data.ratingsTrend,
            label: "this week",
            isPositive: data.ratingsTrend > 0,
          }}
          value={data.totalRatings.toLocaleString()}
        />

        <StatCard
          icon={statIcons.activeSessions}
          iconColor="text-success"
          isLoading={isLoading}
          subtitle="Live now"
          title="Active Sessions"
          value={data.activeSessions}
        />

        <StatCard
          icon={statIcons.completionRate}
          iconColor="text-secondary"
          isLoading={isLoading}
          title="Completion Rate"
          trend={{
            value: data.completionTrend,
            label: "this week",
            isPositive: data.completionTrend > 0,
          }}
          value={`${data.completionRate}%`}
        />

        <StatCard
          icon={statIcons.avgDuration}
          iconColor="text-warning"
          isLoading={isLoading}
          subtitle="per session"
          title="Avg Duration"
          value={data.avgDuration}
        />
      </div>
    </section>
  );
}
