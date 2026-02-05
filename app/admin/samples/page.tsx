"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure 
} from "@heroui/modal";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useAudioPlayer } from "@/components/admin/audio-player-context";

interface Sample {
  id: string;
  url: string;
  model: string;
  language: string;
  duration: string;
  ratings: number;
  avgScore: string;
  isActive: boolean;
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deletingSampleId, setDeletingSampleId] = useState<string | null>(null);
  const [sampleToDelete, setSampleToDelete] = useState<Sample | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { playTrack, currentTrack, isPlaying, stop } = useAudioPlayer();

  const fetchSamples = async () => {
    try {
      const res = await fetch("/api/admin/samples");
      const data = await res.json();
      setSamples(data.samples || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch samples:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleDeleteClick = (sample: Sample) => {
    setSampleToDelete(sample);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!sampleToDelete) return;
    
    setDeletingSampleId(sampleToDelete.id);
    
    // Stop playing if this sample is currently playing
    if (currentTrack?.id === sampleToDelete.id) {
      stop();
    }
    
    try {
      const res = await fetch(`/api/admin/samples?id=${sampleToDelete.id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        // Remove from local state
        setSamples((prev) => prev.filter((s) => s.id !== sampleToDelete.id));
        setTotal((prev) => prev - 1);
      } else {
        const error = await res.json();
        console.error("Failed to delete sample:", error);
      }
    } catch (error) {
      console.error("Failed to delete sample:", error);
    } finally {
      setDeletingSampleId(null);
      setSampleToDelete(null);
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audio Samples</h1>
          <p className="text-default-500">{total} samples in database</p>
        </div>
        <Button
          as={Link}
          href="/admin/upload"
          color="primary"
          startContent={<Icon icon="solar:upload-bold" className="h-4 w-4" />}
        >
          Upload Samples
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
            </div>
          ) : samples.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Icon icon="solar:soundwave-bold-duotone" className="h-12 w-12 text-default-300 mb-4" />
              <p className="text-default-500">No audio samples uploaded yet</p>
              <Button
                as={Link}
                href="/admin/upload"
                color="primary"
                className="mt-4"
              >
                Upload First Sample
              </Button>
            </div>
          ) : (
            <Table aria-label="Audio samples table">
              <TableHeader>
                <TableColumn>MODEL</TableColumn>
                <TableColumn>LANGUAGE</TableColumn>
                <TableColumn>DURATION</TableColumn>
                <TableColumn>RATINGS</TableColumn>
                <TableColumn>AVG SCORE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {samples.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:soundwave-bold-duotone" className="h-4 w-4 text-primary" />
                        {sample.model}
                      </div>
                    </TableCell>
                    <TableCell>{sample.language}</TableCell>
                    <TableCell>{sample.duration}</TableCell>
                    <TableCell>{sample.ratings}</TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={
                          sample.avgScore !== "N/A" 
                            ? parseFloat(sample.avgScore) >= 4 
                              ? "success" 
                              : parseFloat(sample.avgScore) >= 3 
                                ? "warning" 
                                : "danger"
                            : "default"
                        }
                      >
                        {sample.avgScore}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color={sample.isActive ? "success" : "default"}>
                        {sample.isActive ? "active" : "inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tooltip content="Play">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            color={currentTrack?.id === sample.id && isPlaying ? "primary" : "default"}
                            onPress={() => {
                              playTrack({
                                id: sample.id,
                                url: sample.url,
                                title: `${sample.model} Sample`,
                                subtitle: `${sample.language} • ${sample.duration}`,
                              });
                            }}
                          >
                            <Icon 
                              icon={currentTrack?.id === sample.id && isPlaying ? "solar:pause-bold" : "solar:play-bold"} 
                              className="h-4 w-4" 
                            />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete" color="danger">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            color="danger"
                            isLoading={deletingSampleId === sample.id}
                            onPress={() => handleDeleteClick(sample)}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="h-5 w-5 text-danger" />
              Delete Audio Sample
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to delete this audio sample?
            </p>
            {sampleToDelete && (
              <div className="bg-default-100 rounded-lg p-3 mt-2">
                <p className="font-medium">{sampleToDelete.model}</p>
                <p className="text-sm text-default-500">
                  {sampleToDelete.language} • {sampleToDelete.duration}
                </p>
                {sampleToDelete.ratings > 0 && (
                  <p className="text-sm text-warning mt-1">
                    ⚠️ This will also delete {sampleToDelete.ratings} associated rating(s)
                  </p>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="danger" 
              onPress={handleDeleteConfirm}
              isLoading={deletingSampleId !== null}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
