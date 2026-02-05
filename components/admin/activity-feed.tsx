"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Icon } from "@iconify/react";
import { Skeleton } from "@heroui/skeleton";
import Link from "next/link";
import { cn } from "@heroui/theme";

import { activityIcons } from "./icons";

type ActivityType = 
  | "completed" 
  | "started" 
  | "uploaded" 
  | "downloaded" 
  | "alert" 
  | "settings" 
  | "invited";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  meta?: {
    language?: string;
    count?: number;
    format?: string;
    rating?: number;
  };
  actionLabel?: string;
  actionHref?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  isLoading?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

const activityConfig: Record<
  ActivityType,
  { icon: string; color: string; borderColor: string }
> = {
  completed: {
    icon: activityIcons.completed,
    color: "text-success",
    borderColor: "border-l-success",
  },
  started: {
    icon: activityIcons.started,
    color: "text-primary",
    borderColor: "border-l-primary",
  },
  uploaded: {
    icon: activityIcons.uploaded,
    color: "text-secondary",
    borderColor: "border-l-secondary",
  },
  downloaded: {
    icon: activityIcons.downloaded,
    color: "text-default-600",
    borderColor: "border-l-default-400",
  },
  alert: {
    icon: activityIcons.alert,
    color: "text-warning",
    borderColor: "border-l-warning",
  },
  settings: {
    icon: activityIcons.settingsChanged,
    color: "text-default-600",
    borderColor: "border-l-default-400",
  },
  invited: {
    icon: activityIcons.userInvited,
    color: "text-primary",
    borderColor: "border-l-primary",
  },
};

// Empty default - activities will be fetched from API
const defaultActivities: Activity[] = [];

function ActivityItem({ activity }: { activity: Activity }) {
  const config = activityConfig[activity.type];

  return (
    <div
      className={cn(
        "rounded-lg border border-divider border-l-4 bg-background p-4 transition-colors hover:bg-default-50",
        config.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <Icon icon={config.icon} className={cn("h-5 w-5 mt-0.5", config.color)} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-default-900">{activity.title}</p>
          <p className="text-sm text-default-500 mt-0.5">{activity.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-default-400">{activity.time}</span>
            {activity.actionLabel && activity.actionHref && (
              <Link
                href={activity.actionHref}
                className="text-xs text-primary hover:underline"
              >
                {activity.actionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="rounded-lg border border-divider p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed({
  activities = defaultActivities,
  isLoading = false,
  autoRefresh: initialAutoRefresh = true,
  refreshInterval = 30,
}: ActivityFeedProps) {
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // In a real app, this would fetch new activities
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const displayedActivities = activities.slice(0, displayCount);
  const hasMore = activities.length > displayCount;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <Icon icon="solar:history-bold-duotone" className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Activity</h3>
        </div>
        <Switch
          size="sm"
          isSelected={autoRefresh}
          onValueChange={setAutoRefresh}
        />
      </CardHeader>

      <CardBody className="px-6 pb-6">
        <div className="space-y-2">
          {isLoading ? (
            <>
              <ActivitySkeleton />
              <ActivitySkeleton />
              <ActivitySkeleton />
            </>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Icon icon="solar:history-bold-duotone" className="h-12 w-12 text-default-300 mb-4" />
              <p className="text-default-500">No activity yet</p>
              <p className="text-sm text-default-400 mt-2">
                Activity will appear here as raters complete evaluations
              </p>
            </div>
          ) : (
            displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          )}
        </div>

        {hasMore && !isLoading && (
          <Button
            variant="light"
            size="sm"
            className="mt-3 w-full"
            onPress={() => setDisplayCount((prev) => prev + 5)}
          >
            Load More
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
