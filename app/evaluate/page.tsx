"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Icon } from "@iconify/react";
import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";

interface Sample {
  id: string;
  url: string;
}

interface SessionData {
  sessionId: string;
  raterId: string;
  token: string;
  samples: Sample[];
  totalSamples: number;
  language: string;
}

const RATINGS = [
  {
    score: 5,
    emoji: "😊",
    label: "Excellent",
    description: "Sounds completely human",
  },
  {
    score: 4,
    emoji: "🙂",
    label: "Good",
    description: "Minor robotic qualities",
  },
  {
    score: 3,
    emoji: "😐",
    label: "Fair",
    description: "Clearly synthetic, but okay",
  },
  {
    score: 2,
    emoji: "😕",
    label: "Poor",
    description: "Very robotic, hard to follow",
  },
  { score: 1, emoji: "😞", label: "Bad", description: "Unintelligible" },
];

type PlaybackState = "idle" | "playing" | "paused" | "completed";

export default function EvaluatePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackCount, setPlaybackCount] = useState(0);
  const [collectedRatings, setCollectedRatings] = useState<
    Array<{
      sampleId: string;
      score: number;
      playCount: number;
      timeToRateMs: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Load session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("openmos_session");

    if (!stored) {
      setSessionError(
        "No active session found. Please start from the beginning.",
      );
      setIsLoading(false);

      return;
    }

    try {
      const parsed = JSON.parse(stored) as SessionData;

      if (!parsed.samples || parsed.samples.length === 0) {
        const lang = parsed.language || "your language";

        setSessionError(
          `No audio samples are currently available for ${lang}. The research team is still preparing the evaluation materials. Please check back later or contact the administrator.`,
        );
        setIsLoading(false);

        return;
      }
      setSessionData(parsed);
      setIsLoading(false);
    } catch {
      setSessionError("Invalid session data. Please start from the beginning.");
      setIsLoading(false);
    }
  }, []);

  const totalSamples = sessionData?.totalSamples || 0;
  const progress = totalSamples > 0 ? (currentIndex / totalSamples) * 100 : 0;

  // Get current sample from session
  const currentSample = sessionData?.samples?.[currentIndex];

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setPlaybackState("completed");
    setHasPlayed(true);
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (playbackState === "playing") {
      audioRef.current.pause();
      setPlaybackState("paused");
    } else {
      if (playbackState === "idle" || playbackState === "completed") {
        setTimeStarted(Date.now());
        setPlaybackCount((c) => c + 1);
      }
      audioRef.current.play();
      setPlaybackState("playing");
    }
  };

  const handleRatingSelect = (score: number) => {
    setSelectedRating(score);
  };

  const handleNext = async () => {
    if (selectedRating === null || !currentSample || !sessionData) return;

    // Calculate time to rate
    const timeToRateMs = timeStarted ? Date.now() - timeStarted : 0;
    const isLastSample = currentIndex >= totalSamples - 1;

    // Save the rating
    const newRating = {
      sampleId: currentSample.id,
      score: selectedRating,
      playCount: playbackCount,
      timeToRateMs,
    };

    // Submit rating to API
    try {
      await fetch("/api/ratings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          raterId: sessionData.raterId,
          audioId: currentSample.id,
          score: selectedRating,
          timeToRateMs,
          playbackCount,
          isLastSample,
          language: sessionData.language,
        }),
      });
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }

    const updatedRatings = [...collectedRatings, newRating];

    setCollectedRatings(updatedRatings);

    // Check if completed
    if (currentIndex >= totalSamples - 1) {
      // Save all ratings to localStorage for the completion screen
      localStorage.setItem("openmos_ratings", JSON.stringify(updatedRatings));
      router.push("/evaluate/complete");

      return;
    }

    // Move to next sample
    setCurrentIndex((i) => i + 1);
    setPlaybackState("idle");
    setHasPlayed(false);
    setSelectedRating(null);
    setCurrentTime(0);
    setPlaybackCount(0);
    setTimeStarted(null);
    // Don't set isLoading - samples are already in memory
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPlayIcon = () => {
    switch (playbackState) {
      case "playing":
        return "solar:pause-circle-bold-duotone";
      case "completed":
        return "solar:restart-bold-duotone";
      default:
        return "solar:play-circle-bold-duotone";
    }
  };

  const getPlayLabel = () => {
    switch (playbackState) {
      case "playing":
        return "Pause";
      case "completed":
        return "Replay";
      default:
        return "Play";
    }
  };

  const getRatingColor = (
    score: number,
  ): "success" | "primary" | "warning" | "danger" | "default" => {
    switch (score) {
      case 5:
        return "success";
      case 4:
        return "success";
      case 3:
        return "warning";
      case 2:
        return "danger";
      case 1:
        return "danger";
      default:
        return "default";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner color="primary" size="lg" />
        <p className="text-default-500">Loading evaluation session...</p>
      </section>
    );
  }

  // Error state
  if (sessionError || !sessionData || !currentSample) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 py-8 text-center">
        <Icon
          className="w-16 h-16 text-warning"
          icon="solar:danger-triangle-bold-duotone"
        />
        <h2 className="text-xl font-semibold">Session Error</h2>
        <p className="text-default-500 max-w-md">
          {sessionError || "No samples available for evaluation."}
        </p>
        <div className="flex gap-3">
          <Button as={Link} href="/" variant="flat">
            Go Home
          </Button>
          <Button as={Link} color="primary" href="/start">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 py-2 md:py-4 px-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          className="flex items-center gap-1 text-default-500 text-sm"
          href="/"
        >
          <Icon className="w-5 h-5" icon="solar:alt-arrow-left-linear" />
          Exit
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Sample {currentIndex + 1}/{totalSamples}
          </span>
          <span className="text-sm text-default-500">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <Progress
        aria-label="Evaluation progress"
        color="primary"
        size="sm"
        value={progress}
      />

      {/* Audio Player Card */}
      <Card className="overflow-visible" shadow="sm">
        <CardBody className="gap-4 p-6">
          {/* Waveform Visualization Area */}
          <div className="relative h-20 bg-default-100 rounded-xl flex items-center justify-center overflow-hidden">
            {isLoading ? (
              <Icon
                className="w-8 h-8 text-default-400 animate-spin"
                icon="solar:refresh-linear"
              />
            ) : (
              <>
                {/* Simple waveform visualization */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const height =
                      20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
                    const isActive = (currentTime / duration) * 30 > i;

                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-75 ${
                          isActive ? "bg-primary" : "bg-default-300"
                        }`}
                        style={{
                          height:
                            playbackState === "playing" ? `${height}%` : "20%",
                          opacity: isActive ? 1 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>
                {hasPlayed && (
                  <div className="absolute top-2 right-2">
                    <Icon
                      className="w-5 h-5 text-success"
                      icon="solar:check-circle-bold-duotone"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Play Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              isIconOnly
              className="w-[72px] h-[72px] shadow-lg"
              color={playbackState === "completed" ? "success" : "primary"}
              isDisabled={isLoading}
              radius="full"
              size="lg"
              onPress={togglePlayback}
            >
              <Icon className="w-10 h-10" icon={getPlayIcon()} />
            </Button>
            <span className="text-sm text-default-500">{getPlayLabel()}</span>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-center gap-2 text-sm text-default-500">
            <Icon className="w-4 h-4" icon="solar:clock-circle-linear" />
            <span>
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </span>
            {playbackCount > 1 && (
              <span className="text-xs text-default-400">
                (played {playbackCount}×)
              </span>
            )}
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            preload="metadata"
            src={currentSample?.url || ""}
            onEnded={handleEnded}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          >
            <track kind="captions" />
          </audio>
        </CardBody>
      </Card>

      {/* Rating Section */}
      <Card shadow="sm">
        <CardBody className="gap-4 p-6">
          <div className="flex items-center gap-2">
            <Icon
              className="w-6 h-6 text-warning"
              icon="solar:star-bold-duotone"
            />
            <h2 className="font-semibold">How natural does this sound?</h2>
          </div>

          <div className={`space-y-3 ${hasPlayed ? "fade-in-stagger" : ""}`}>
            {RATINGS.map((rating) => (
              <Button
                key={rating.score}
                className={`w-full h-auto py-3 px-4 justify-start rating-btn ${
                  !hasPlayed ? "opacity-50 cursor-not-allowed" : ""
                }`}
                color={
                  selectedRating === rating.score
                    ? getRatingColor(rating.score)
                    : "default"
                }
                isDisabled={!hasPlayed}
                variant={selectedRating === rating.score ? "solid" : "bordered"}
                onPress={() => handleRatingSelect(rating.score)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon
                    className="w-6 h-6 flex-shrink-0"
                    icon={
                      selectedRating === rating.score
                        ? "solar:star-bold"
                        : "solar:star-bold-duotone"
                    }
                  />
                  <span className="text-xl">{rating.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">
                      {rating.score} - {rating.label}
                    </p>
                    <p className="text-xs text-default-500">
                      {rating.description}
                    </p>
                  </div>
                  {selectedRating === rating.score && (
                    <Icon className="w-5 h-5" icon="solar:check-circle-bold" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          {!hasPlayed && (
            <p className="text-sm text-center text-default-400">
              Listen to the audio first to enable rating
            </p>
          )}
        </CardBody>
      </Card>

      {/* Next Button */}
      <Button
        className="w-full h-14 font-semibold"
        color="primary"
        endContent={
          <Icon className="w-6 h-6" icon="solar:alt-arrow-right-bold-duotone" />
        }
        isDisabled={selectedRating === null}
        size="lg"
        onPress={handleNext}
      >
        {currentIndex >= totalSamples - 1 ? "Finish Evaluation" : "Next Sample"}
      </Button>
    </section>
  );
}
