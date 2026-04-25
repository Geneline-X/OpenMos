"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { RadioGroup, Radio } from "@heroui/radio";
import { Progress } from "@heroui/progress";
import { Checkbox } from "@heroui/checkbox";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

interface StudyLanguage {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface StudyData {
  studyId: string;
  studyName: string;
  languages: StudyLanguage[];
}

type OnboardingStep = "welcome" | "demographics" | "consent";

const AGE_RANGES = [
  { label: "18–24", value: "18-24", numeric: 21 },
  { label: "25–34", value: "25-34", numeric: 30 },
  { label: "35–44", value: "35-44", numeric: 40 },
  { label: "45–54", value: "45-54", numeric: 50 },
  { label: "55–64", value: "55-64", numeric: 60 },
  { label: "65+", value: "65+", numeric: 67 },
];

interface Demographics {
  age: string;
  gender: string;
  nativeLanguage: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [studyKey, setStudyKey] = useState("");
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [demographics, setDemographics] = useState<Demographics>({
    age: "",
    gender: "",
    nativeLanguage: "",
  });
  const [consent, setConsent] = useState({
    dataUsage: false,
    anonymous: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const progressMap = {
    welcome: 0,
    demographics: 50,
    consent: 100,
  };

  const handleValidateKey = async () => {
    if (!studyKey.trim()) {
      setKeyError("Please enter a study access key");

      return;
    }

    setIsValidatingKey(true);
    setKeyError("");

    try {
      const res = await fetch("/api/studies/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: studyKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setKeyError(data.error || "Invalid access key");
        setIsValidatingKey(false);

        return;
      }

      setStudyData(data);
      setStep("demographics");
    } catch {
      setKeyError("Failed to validate key. Please try again.");
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleStartSession = async () => {
    if (!studyData) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age:
            AGE_RANGES.find((r) => r.value === demographics.age)?.numeric ?? 21,
          gender: demographics.gender,
          nativeLanguage: demographics.nativeLanguage,
          studyId: studyData.studyId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start session");
      }

      // Store session info
      localStorage.setItem(
        "openmos_session",
        JSON.stringify({
          sessionId: data.sessionId,
          raterId: data.raterId,
          token: data.token,
          samples: data.samples,
          totalSamples: data.totalSamples,
          language: data.language,
          studyName: studyData.studyName,
        }),
      );

      router.push("/evaluate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedFromDemographics =
    demographics.age && demographics.gender && demographics.nativeLanguage;

  const canProceedFromConsent = consent.dataUsage && consent.anonymous;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <Progress
          className="mb-6"
          color="primary"
          size="sm"
          value={progressMap[step]}
        />

        {/* Welcome + Key Entry Step */}
        {step === "welcome" && (
          <Card className="shadow-lg">
            <CardHeader className="flex-col items-center gap-3 pb-0 pt-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  className="h-8 w-8 text-primary"
                  icon="solar:microphone-3-bold-duotone"
                />
              </div>
              <h1 className="text-2xl font-bold text-default-900">
                Voice Quality Study
              </h1>
            </CardHeader>
            <CardBody className="gap-4 px-6 pb-8 pt-4 text-center">
              <p className="text-default-600">
                Help us evaluate text-to-speech quality by rating short audio
                clips.
              </p>

              <div className="mt-2 space-y-2 text-left text-sm text-default-500">
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary"
                    icon="solar:clock-circle-linear"
                  />
                  <span>10-15 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary"
                    icon="solar:headphones-round-linear"
                  />
                  <span>Audio clips rated on naturalness</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-primary"
                    icon="solar:shield-check-linear"
                  />
                  <span>Anonymous</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Input
                  description="Enter the access key provided by the researcher"
                  errorMessage={keyError}
                  isInvalid={!!keyError}
                  label="Study Access Key"
                  placeholder="e.g. MOS-A7X3K9"
                  startContent={
                    <Icon
                      className="h-4 w-4 text-default-400"
                      icon="solar:key-bold-duotone"
                    />
                  }
                  value={studyKey}
                  onValueChange={(val) => {
                    setStudyKey(val);
                    setKeyError("");
                  }}
                />

                <Button
                  className="w-full"
                  color="primary"
                  isDisabled={!studyKey.trim()}
                  isLoading={isValidatingKey}
                  size="lg"
                  onPress={handleValidateKey}
                >
                  Continue
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Demographics Step */}
        {step === "demographics" && (
          <Card className="shadow-lg">
            <CardHeader className="flex-col items-start gap-1 px-6 pt-6">
              <h2 className="text-xl font-semibold">About You</h2>
              <p className="text-sm text-default-500">
                Quick info for{" "}
                <span className="font-medium text-primary">
                  {studyData?.studyName}
                </span>
              </p>
            </CardHeader>
            <CardBody className="gap-5 px-6 pb-8">
              <Select
                isRequired
                label="Native Language"
                placeholder="Select your native language"
                selectedKeys={
                  demographics.nativeLanguage
                    ? [demographics.nativeLanguage]
                    : []
                }
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setDemographics({ ...demographics, nativeLanguage: value });
                }}
              >
                {(studyData?.languages || []).map((lang) => (
                  <SelectItem
                    key={lang.code}
                    startContent={<span aria-hidden="true">{lang.flag}</span>}
                  >
                    {lang.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                isRequired
                label="Age Range"
                placeholder="Select your age range"
                selectedKeys={demographics.age ? [demographics.age] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  setDemographics({ ...demographics, age: value });
                }}
              >
                {AGE_RANGES.map((range) => (
                  <SelectItem key={range.value}>{range.label}</SelectItem>
                ))}
              </Select>

              <RadioGroup
                isRequired
                label="Gender"
                orientation="horizontal"
                value={demographics.gender}
                onValueChange={(value) =>
                  setDemographics({ ...demographics, gender: value })
                }
              >
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </RadioGroup>

              <div className="flex gap-2 pt-2">
                <Button variant="flat" onPress={() => setStep("welcome")}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  color="primary"
                  isDisabled={!canProceedFromDemographics}
                  onPress={() => setStep("consent")}
                >
                  Continue
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Consent Step */}
        {step === "consent" && (
          <Card className="shadow-lg">
            <CardHeader className="flex-col items-start gap-1 px-6 pt-6">
              <h2 className="text-xl font-semibold">Consent</h2>
            </CardHeader>
            <CardBody className="gap-4 px-6 pb-8">
              <div className="space-y-3">
                <Checkbox
                  isSelected={consent.dataUsage}
                  onValueChange={(checked) =>
                    setConsent({ ...consent, dataUsage: checked })
                  }
                >
                  <span className="text-sm">
                    I agree my ratings may be used for academic research.
                  </span>
                </Checkbox>

                <Checkbox
                  isSelected={consent.anonymous}
                  onValueChange={(checked) =>
                    setConsent({ ...consent, anonymous: checked })
                  }
                >
                  <span className="text-sm">
                    I understand participation is anonymous and voluntary.
                  </span>
                </Checkbox>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="flex gap-2 pt-2">
                <Button variant="flat" onPress={() => setStep("demographics")}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  color="primary"
                  isDisabled={!canProceedFromConsent}
                  isLoading={isLoading}
                  onPress={handleStartSession}
                >
                  Start
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
