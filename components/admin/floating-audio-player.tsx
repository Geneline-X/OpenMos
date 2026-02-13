"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Slider } from "@heroui/slider";
import { Icon } from "@iconify/react";

import { useAudioPlayer } from "./audio-player-context";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function FloatingAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isVisible,
    isMinimized,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    stop,
    minimize,
    maximize,
    hide,
  } = useAudioPlayer();

  if (!isVisible || !currentTrack) return null;

  // Minimized view - small floating button
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          isIconOnly
          className="h-14 w-14 shadow-lg"
          color="primary"
          size="lg"
          onPress={maximize}
        >
          <div className="relative">
            <Icon className="h-6 w-6" icon="solar:soundwave-bold" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
            )}
          </div>
        </Button>
      </div>
    );
  }

  // Full player view
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:left-64">
      <Card className="mx-auto max-w-3xl shadow-2xl border border-default-200 bg-background/80 backdrop-blur-lg">
        <CardBody className="p-4">
          <div className="flex flex-col gap-3">
            {/* Header with track info and controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon
                    className="h-5 w-5 text-primary"
                    icon={
                      isPlaying
                        ? "solar:soundwave-bold"
                        : "solar:music-note-bold"
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{currentTrack.title}</p>
                  {currentTrack.subtitle && (
                    <p className="text-xs text-default-500 truncate">
                      {currentTrack.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  aria-label="Minimize player"
                  size="sm"
                  variant="light"
                  onPress={minimize}
                >
                  <Icon
                    className="h-4 w-4"
                    icon="solar:minimize-square-linear"
                  />
                </Button>
                <Button
                  isIconOnly
                  aria-label="Close player"
                  size="sm"
                  variant="light"
                  onPress={hide}
                >
                  <Icon className="h-4 w-4" icon="solar:close-circle-linear" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-default-500 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                aria-label="Audio progress"
                className="flex-1"
                classNames={{
                  track: "bg-default-200",
                  filler: "bg-primary",
                }}
                maxValue={duration || 100}
                minValue={0}
                size="sm"
                step={0.1}
                value={currentTime}
                onChange={(value) => seek(value as number)}
              />
              <span className="text-xs text-default-500 w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                isIconOnly
                aria-label="Rewind 5 seconds"
                size="sm"
                variant="light"
                onPress={() => skipBackward(5)}
              >
                <Icon
                  className="h-5 w-5"
                  icon="solar:rewind-5-seconds-back-bold"
                />
              </Button>

              <Button
                isIconOnly
                aria-label={isPlaying ? "Pause" : "Play"}
                className="h-12 w-12"
                color="primary"
                size="lg"
                onPress={togglePlay}
              >
                <Icon
                  className="h-6 w-6"
                  icon={isPlaying ? "solar:pause-bold" : "solar:play-bold"}
                />
              </Button>

              <Button
                isIconOnly
                aria-label="Forward 5 seconds"
                size="sm"
                variant="light"
                onPress={() => skipForward(5)}
              >
                <Icon
                  className="h-5 w-5"
                  icon="solar:rewind-5-seconds-forward-bold"
                />
              </Button>

              <div className="ml-4 border-l border-default-200 pl-4">
                <Button
                  isIconOnly
                  aria-label="Stop and close"
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={stop}
                >
                  <Icon className="h-5 w-5" icon="solar:stop-bold" />
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
