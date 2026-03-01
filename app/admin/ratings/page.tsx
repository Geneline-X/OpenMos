"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";

import { usePagination } from "@/hooks/usePagination";

interface Rating {
  id: string;
  sample: string;
  model: string;
  score: number;
  rater: string;
  time: string;
  date: string;
}

type SortKey = "score" | "date" | "model" | "rater";
type SortDir = "asc" | "desc";

const getScoreColor = (score: number) => {
  if (score >= 4) return "success";
  if (score === 3) return "warning";

  return "danger";
};

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: "0.00",
    avgTime: "0s",
    today: 0,
  });

  // Filters
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [raterFilter, setRaterFilter] = useState<string>("all");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Extract unique models and raters for filter dropdowns
  const uniqueModels = useMemo(
    () => Array.from(new Set(ratings.map((r) => r.model))).sort(),
    [ratings],
  );
  const uniqueRaters = useMemo(
    () => Array.from(new Set(ratings.map((r) => r.rater))).sort(),
    [ratings],
  );

  // Filtered + sorted data
  const processedData = useMemo(() => {
    let filtered = [...ratings];

    if (modelFilter !== "all") {
      filtered = filtered.filter((r) => r.model === modelFilter);
    }

    if (raterFilter !== "all") {
      filtered = filtered.filter((r) => r.rater === raterFilter);
    }

    filtered.sort((a, b) => {
      let cmp = 0;

      switch (sortKey) {
        case "score":
          cmp = a.score - b.score;
          break;
        case "date":
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "model":
          cmp = a.model.localeCompare(b.model);
          break;
        case "rater":
          cmp = a.rater.localeCompare(b.rater);
          break;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [ratings, modelFilter, raterFilter, sortKey, sortDir]);

  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination({ data: processedData, itemsPerPage: 20 });

  useEffect(() => {
    async function fetchRatings() {
      try {
        const res = await fetch("/api/admin/ratings");
        const data = await res.json();

        setRatings(data.ratings || []);
        setStats({
          total: data.total || 0,
          avgScore: data.avgScore || "0.00",
          avgTime: data.avgTime || "0s",
          today: data.today || 0,
        });
      } catch (error) {
        console.error("Failed to fetch ratings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRatings();
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return "solar:sort-vertical-linear";
    if (sortDir === "asc") return "solar:sort-from-bottom-to-top-linear";

    return "solar:sort-from-top-to-bottom-linear";
  };

  const clearFilters = () => {
    setModelFilter("all");
    setRaterFilter("all");
  };

  const hasActiveFilters = modelFilter !== "all" || raterFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ratings</h1>
        <p className="text-default-500">All evaluation ratings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon
                className="h-6 w-6 text-primary"
                icon="solar:star-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-default-500">Total Ratings</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-success/10 p-2">
              <Icon
                className="h-6 w-6 text-success"
                icon="solar:chart-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgScore}</p>
              <p className="text-sm text-default-500">Average MOS</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-warning/10 p-2">
              <Icon
                className="h-6 w-6 text-warning"
                icon="solar:clock-circle-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgTime}</p>
              <p className="text-sm text-default-500">Avg Response</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Icon
                className="h-6 w-6 text-secondary"
                icon="solar:calendar-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-default-500">Today</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      {!isLoading && ratings.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <Select
            className="w-48"
            label="Model"
            placeholder="All models"
            selectedKeys={[modelFilter]}
            size="sm"
            startContent={
              <Icon
                className="h-4 w-4 text-default-400"
                icon="solar:server-square-linear"
              />
            }
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;

              setModelFilter(val || "all");
            }}
          >
            {[
              <SelectItem key="all">All Models</SelectItem>,
              ...uniqueModels.map((m) => <SelectItem key={m}>{m}</SelectItem>),
            ]}
          </Select>

          <Select
            className="w-48"
            label="Rater"
            placeholder="All raters"
            selectedKeys={[raterFilter]}
            size="sm"
            startContent={
              <Icon
                className="h-4 w-4 text-default-400"
                icon="solar:user-linear"
              />
            }
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;

              setRaterFilter(val || "all");
            }}
          >
            {[
              <SelectItem key="all">All Raters</SelectItem>,
              ...uniqueRaters.map((r) => (
                <SelectItem key={r}>Rater {r}</SelectItem>
              )),
            ]}
          </Select>

          {hasActiveFilters && (
            <Button
              size="sm"
              startContent={
                <Icon className="h-4 w-4" icon="solar:close-circle-linear" />
              }
              variant="flat"
              onPress={clearFilters}
            >
              Clear Filters
            </Button>
          )}

          {hasActiveFilters && (
            <span className="text-sm text-default-400 self-center">
              {processedData.length} of {ratings.length} ratings
            </span>
          )}
        </div>
      )}

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Icon
                className="h-12 w-12 text-default-300 mb-4"
                icon="solar:star-bold-duotone"
              />
              <p className="text-default-500">No ratings collected yet</p>
              <p className="text-sm text-default-400 mt-2">
                Ratings will appear here as native speakers evaluate your audio
                samples
              </p>
            </div>
          ) : (
            <Table aria-label="Ratings table">
              <TableHeader>
                <TableColumn>SAMPLE</TableColumn>
                <TableColumn>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("model")}
                  >
                    MODEL
                    <Icon className="h-3.5 w-3.5" icon={getSortIcon("model")} />
                  </button>
                </TableColumn>
                <TableColumn>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("score")}
                  >
                    SCORE
                    <Icon className="h-3.5 w-3.5" icon={getSortIcon("score")} />
                  </button>
                </TableColumn>
                <TableColumn>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("rater")}
                  >
                    RATER
                    <Icon className="h-3.5 w-3.5" icon={getSortIcon("rater")} />
                  </button>
                </TableColumn>
                <TableColumn>TIME</TableColumn>
                <TableColumn>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    DATE
                    <Icon className="h-3.5 w-3.5" icon={getSortIcon("date")} />
                  </button>
                </TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon
                          className="h-4 w-4 text-default-400"
                          icon="solar:soundwave-linear"
                        />
                        <span className="font-mono text-sm">
                          {rating.sample}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{rating.model}</TableCell>
                    <TableCell>
                      <Chip color={getScoreColor(rating.score)} size="sm">
                        {rating.score}
                      </Chip>
                    </TableCell>
                    <TableCell>Rater {rating.rater}</TableCell>
                    <TableCell>{rating.time}</TableCell>
                    <TableCell className="text-default-500">
                      {rating.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {!isLoading && processedData.length > 20 && (
            <div className="flex items-center justify-between border-t border-divider px-4 py-3">
              <p className="text-sm text-default-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  isDisabled={!hasPrev}
                  size="sm"
                  variant="flat"
                  onPress={prevPage}
                >
                  <Icon
                    className="h-4 w-4"
                    icon="solar:alt-arrow-left-linear"
                  />
                </Button>
                <Button
                  isIconOnly
                  isDisabled={!hasNext}
                  size="sm"
                  variant="flat"
                  onPress={nextPage}
                >
                  <Icon
                    className="h-4 w-4"
                    icon="solar:alt-arrow-right-linear"
                  />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
