"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";

import { usePagination } from "@/hooks/usePagination";

interface Rater {
  id: string;
  language: string;
  age: number | null;
  gender: string | null;
  completed: number;
  total: number;
  avgTime: string;
  status: string;
}

export default function RatersPage() {
  const [raters, setRaters] = useState<Rater[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination({ data: raters, itemsPerPage: 20 });

  useEffect(() => {
    async function fetchRaters() {
      try {
        const res = await fetch("/api/admin/raters");
        const data = await res.json();

        setRaters(data.raters || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch raters:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRaters();
  }, []);

  const activeCount = raters.filter((r) => r.status === "in_progress").length;
  const completedCount = raters.filter((r) => r.status === "completed").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Raters</h1>
        <p className="text-default-500">Native speaker participants</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon
                className="h-6 w-6 text-primary"
                icon="solar:users-group-rounded-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-default-500">Total Raters</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-success/10 p-2">
              <Icon
                className="h-6 w-6 text-success"
                icon="solar:check-circle-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-default-500">Completed</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="rounded-lg bg-warning/10 p-2">
              <Icon
                className="h-6 w-6 text-warning"
                icon="solar:play-circle-bold-duotone"
              />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-default-500">In Progress</p>
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
          ) : raters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Icon
                className="h-12 w-12 text-default-300 mb-4"
                icon="solar:users-group-rounded-bold-duotone"
              />
              <p className="text-default-500">
                No raters have participated yet
              </p>
              <p className="text-sm text-default-400 mt-2">
                Share the evaluation link to get native speakers to rate your
                audio samples
              </p>
            </div>
          ) : (
            <Table aria-label="Raters table">
              <TableHeader>
                <TableColumn>RATER</TableColumn>
                <TableColumn>LANGUAGE</TableColumn>
                <TableColumn>DEMOGRAPHICS</TableColumn>
                <TableColumn>PROGRESS</TableColumn>
                <TableColumn>AVG TIME</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((rater, idx) => {
                  const displayIndex = (currentPage - 1) * 20 + idx + 1;

                  return (
                    <TableRow key={rater.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={`R${displayIndex}`} size="sm" />
                          <span>Rater #{displayIndex}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {rater.language}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {rater.age ? `${rater.age}y` : "N/A"} •{" "}
                          {rater.gender || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {rater.completed}/{rater.total}
                        </span>
                      </TableCell>
                      <TableCell>{rater.avgTime}</TableCell>
                      <TableCell>
                        <Chip
                          color={
                            rater.status === "completed" ? "success" : "warning"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {rater.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {!isLoading && raters.length > 20 && (
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
