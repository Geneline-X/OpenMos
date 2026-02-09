"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
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

const getScoreColor = (score: number) => {
  if (score >= 4) return "success";
  if (score === 3) return "warning";
  return "danger";
};

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: "0.00", avgTime: "0s", today: 0 });

  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination({ data: ratings, itemsPerPage: 20 });

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
              <Icon icon="solar:star-bold-duotone" className="h-6 w-6 text-primary" />
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
              <Icon icon="solar:chart-bold-duotone" className="h-6 w-6 text-success" />
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
              <Icon icon="solar:clock-circle-bold-duotone" className="h-6 w-6 text-warning" />
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
              <Icon icon="solar:calendar-bold-duotone" className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-default-500">Today</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Icon icon="solar:star-bold-duotone" className="h-12 w-12 text-default-300 mb-4" />
              <p className="text-default-500">No ratings collected yet</p>
              <p className="text-sm text-default-400 mt-2">
                Ratings will appear here as native speakers evaluate your audio samples
              </p>
            </div>
          ) : (
            <Table aria-label="Ratings table">
              <TableHeader>
                <TableColumn>SAMPLE</TableColumn>
                <TableColumn>MODEL</TableColumn>
                <TableColumn>SCORE</TableColumn>
                <TableColumn>RATER</TableColumn>
                <TableColumn>TIME</TableColumn>
                <TableColumn>DATE</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:soundwave-linear" className="h-4 w-4 text-default-400" />
                        <span className="font-mono text-sm">{rating.sample}</span>
                      </div>
                    </TableCell>
                    <TableCell>{rating.model}</TableCell>
                    <TableCell>
                      <Chip size="sm" color={getScoreColor(rating.score)}>
                        {rating.score}
                      </Chip>
                    </TableCell>
                    <TableCell>Rater {rating.rater}</TableCell>
                    <TableCell>{rating.time}</TableCell>
                    <TableCell className="text-default-500">{rating.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {!isLoading && ratings.length > 20 && (
            <div className="flex items-center justify-between border-t border-divider px-4 py-3">
              <p className="text-sm text-default-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  isDisabled={!hasPrev}
                  onPress={prevPage}
                >
                  <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  isDisabled={!hasNext}
                  onPress={nextPage}
                >
                  <Icon icon="solar:alt-arrow-right-linear" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
