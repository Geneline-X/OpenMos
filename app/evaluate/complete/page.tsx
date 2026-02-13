"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";
import confetti from "canvas-confetti";

export default function CompletePage() {
  const [stats, setStats] = useState({
    totalSamples: 0,
    timeSpent: "0s",
    totalRaters: 0,
  });

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);

        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#10b981", "#1e40af", "#f59e0b"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#10b981", "#1e40af", "#f59e0b"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load stats from localStorage if available
    const ratingsData = localStorage.getItem("openmos_ratings");

    if (ratingsData) {
      try {
        const ratings = JSON.parse(ratingsData) as Array<{
          timeToRateMs: number;
        }>;

        // Calculate total time spent from all ratings
        const totalMs = ratings.reduce(
          (sum, r) => sum + (r.timeToRateMs || 0),
          0,
        );
        const totalSeconds = Math.floor(totalMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let timeSpent = "";

        if (minutes > 0) {
          timeSpent = `${minutes}m ${seconds}s`;
        } else {
          timeSpent = `${seconds}s`;
        }

        setStats({
          totalSamples: ratings.length,
          timeSpent,
          totalRaters: 0, // Will be updated by API
        });
      } catch (e) {
        console.error("Failed to parse ratings data");
      }
    }

    // Fetch total raters count from API
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.totalRaters) {
          setStats((prev) => ({ ...prev, totalRaters: data.totalRaters }));
        }
      })
      .catch((err) => console.error("Failed to fetch raters count:", err));
  }, []);

  const handleDownloadData = () => {
    const ratingsData = localStorage.getItem("openmos_ratings");
    const raterData = localStorage.getItem("openmos_rater");

    const data = {
      rater: raterData ? JSON.parse(raterData) : null,
      ratings: ratingsData ? JSON.parse(ratingsData) : [],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `openmos-my-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-16 max-w-lg mx-auto">
      {/* Success Icon */}
      <div className="relative">
        <Icon
          className="w-20 h-20 text-success"
          icon="solar:check-circle-bold-duotone"
        />
      </div>

      {/* Headline */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Evaluation Complete! 🎉
        </h1>
        <p className="text-default-600">
          Thank you for contributing to voice AI research
        </p>
      </div>

      {/* Impact Stats */}
      <Card className="w-full" shadow="sm">
        <CardBody className="gap-4 p-6">
          <h2 className="font-semibold flex items-center gap-2">
            <Icon
              className="w-5 h-5 text-primary"
              icon="solar:chart-bold-duotone"
            />
            Your Impact
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 bg-default-50 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Icon
                  className="w-5 h-5 text-primary"
                  icon="solar:document-text-linear"
                />
              </div>
              <div>
                <p className="font-medium">
                  {stats.totalSamples} samples evaluated
                </p>
                <p className="text-sm text-default-500">
                  Contributing valuable research data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-default-50 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
                <Icon
                  className="w-5 h-5 text-warning"
                  icon="solar:clock-circle-linear"
                />
              </div>
              <div>
                <p className="font-medium">{stats.timeSpent} spent</p>
                <p className="text-sm text-default-500">
                  Thank you for your time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-default-50 rounded-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                <Icon
                  className="w-5 h-5 text-success"
                  icon="solar:users-group-rounded-linear"
                />
              </div>
              <div>
                <p className="font-medium">
                  Joined {stats.totalRaters} other raters
                </p>
                <p className="text-sm text-default-500">
                  Part of our research community
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="w-full space-y-3">
        <Button
          className="w-full h-12"
          startContent={
            <Icon
              className="w-5 h-5"
              icon="solar:download-minimalistic-bold-duotone"
            />
          }
          variant="bordered"
          onPress={handleDownloadData}
        >
          Download Your Data
        </Button>

        <Button as={Link} className="w-full h-12" color="primary" href="/">
          Return Home
        </Button>
      </div>

      {/* Additional Info */}
      <Card
        className="w-full bg-primary/5 border border-primary/20"
        shadow="none"
      >
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <Icon
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              icon="solar:info-circle-bold-duotone"
            />
            <div className="text-sm">
              <p className="font-medium mb-1">What happens next?</p>
              <p className="text-default-600">
                Your ratings will be analyzed alongside other participants to
                evaluate the quality of AI-generated speech. Results will
                contribute to academic research on improving voice technology
                for African languages.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Share Option */}
      <div className="text-center">
        <p className="text-sm text-default-500 mb-2">
          Know other native speakers?
        </p>
        <Button
          size="sm"
          startContent={
            <Icon className="w-4 h-4" icon="solar:share-bold-duotone" />
          }
          variant="light"
          onPress={() => {
            if (navigator.share) {
              navigator.share({
                title: "OpenMOS Evaluation",
                text: "Help improve AI voice technology for African languages!",
                url: window.location.origin,
              });
            } else {
              navigator.clipboard.writeText(window.location.origin);
            }
          }}
        >
          Share this study
        </Button>
      </div>
    </section>
  );
}
