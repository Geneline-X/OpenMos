"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";

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

  const activeCount = raters.filter(r => r.status === "in_progress").length;
  const completedCount = raters.filter(r => r.status === "completed").length;

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
              <Icon icon="solar:users-group-rounded-bold-duotone" className="h-6 w-6 text-primary" />
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
              <Icon icon="solar:check-circle-bold-duotone" className="h-6 w-6 text-success" />
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
              <Icon icon="solar:play-circle-bold-duotone" className="h-6 w-6 text-warning" />
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
              <Icon icon="solar:users-group-rounded-bold-duotone" className="h-12 w-12 text-default-300 mb-4" />
              <p className="text-default-500">No raters have participated yet</p>
              <p className="text-sm text-default-400 mt-2">
                Share the evaluation link to get native speakers to rate your audio samples
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
                {raters.map((rater, idx) => (
                  <TableRow key={rater.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm" name={`R${idx + 1}`} />
                        <span>Rater #{idx + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">{rater.language}</Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {rater.age ? `${rater.age}y` : "N/A"} • {rater.gender || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{rater.completed}/{rater.total}</span>
                    </TableCell>
                    <TableCell>{rater.avgTime}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={rater.status === "completed" ? "success" : "warning"}
                        variant="flat"
                      >
                        {rater.status === "completed" ? "Completed" : "In Progress"}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
