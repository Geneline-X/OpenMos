"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { RadioGroup, Radio } from "@heroui/radio";
import { Checkbox } from "@heroui/checkbox";
import { Progress } from "@heroui/progress";
import { Icon } from "@iconify/react";

type OnboardingData = {
  age: string;
  gender: string;
  language: string;
  consent: boolean;
};

type OnboardingErrors = {
  age?: string;
  gender?: string;
  language?: string;
  consent?: string;
};

const steps = [
  { id: 1, title: "About You", icon: "solar:user-bold-duotone" },
  { id: 2, title: "Language", icon: "solar:global-bold-duotone" },
  { id: 3, title: "Instructions", icon: "solar:lightbulb-bolt-bold-duotone" },
  { id: 4, title: "Consent", icon: "solar:shield-check-bold-duotone" },
];

export default function OnboardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    age: "",
    gender: "",
    language: "",
    consent: false,
  });
  const [errors, setErrors] = useState<OnboardingErrors>({});

  const progress = (currentStep / steps.length) * 100;

  const validateStep = (): boolean => {
    const newErrors: OnboardingErrors = {};

    if (currentStep === 1) {
      if (!data.age || parseInt(data.age) < 18 || parseInt(data.age) > 100) {
        newErrors.age = "Please enter a valid age (18-100)";
      }
      if (!data.gender) {
        newErrors.gender = "Please select an option";
      }
    } else if (currentStep === 2) {
      if (!data.language) {
        newErrors.language = "Please select your native language";
      }
    } else if (currentStep === 4) {
      if (!data.consent) {
        newErrors.consent = "You must consent to participate";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data and start evaluation
      localStorage.setItem("openmos_rater", JSON.stringify(data));
      router.push("/evaluate");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center py-4 md:py-8">
      {/* Progress Header */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Icon
            className="w-8 h-8 text-primary"
            icon={steps[currentStep - 1].icon}
          />
          <div className="flex-1">
            <p className="text-sm text-default-500">
              Step {currentStep} of {steps.length}
            </p>
            <p className="font-semibold">{steps[currentStep - 1].title}</p>
          </div>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress
          aria-label="Onboarding progress"
          color="primary"
          size="sm"
          value={progress}
        />
      </div>

      {/* Step Content */}
      <Card className="w-full max-w-lg" shadow="sm">
        <CardBody className="gap-6 p-6">
          {/* Step 1: Demographics */}
          {currentStep === 1 && (
            <>
              <div>
                <p className="text-lg font-medium mb-2">
                  Tell us about yourself
                </p>
                <p className="text-sm text-default-500">
                  This helps us ensure diverse representation in our research
                </p>
              </div>

              <div className="space-y-1">
                <Input
                  classNames={{
                    inputWrapper: "h-12",
                  }}
                  errorMessage={errors.age}
                  isInvalid={!!errors.age}
                  label="Age"
                  labelPlacement="outside"
                  placeholder="Enter your age"
                  startContent={
                    <Icon
                      className="w-5 h-5 text-default-400"
                      icon="solar:hashtag-linear"
                    />
                  }
                  type="number"
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: e.target.value })}
                />
              </div>

              <RadioGroup
                errorMessage={errors.gender}
                isInvalid={!!errors.gender}
                label="Gender"
                value={data.gender}
                onValueChange={(value) => setData({ ...data, gender: value })}
              >
                <Radio classNames={{ base: "py-2" }} value="male">
                  Male
                </Radio>
                <Radio classNames={{ base: "py-2" }} value="female">
                  Female
                </Radio>
                <Radio classNames={{ base: "py-2" }} value="non-binary">
                  Non-binary
                </Radio>
                <Radio classNames={{ base: "py-2" }} value="prefer_not_to_say">
                  Prefer not to say
                </Radio>
              </RadioGroup>
            </>
          )}

          {/* Step 2: Language */}
          {currentStep === 2 && (
            <>
              <div>
                <p className="text-lg font-medium mb-2">
                  Select your native language
                </p>
                <p className="text-sm text-default-500">
                  You should be a native speaker of the language you select
                </p>
              </div>

              <RadioGroup
                classNames={{
                  wrapper: "gap-4",
                }}
                errorMessage={errors.language}
                isInvalid={!!errors.language}
                value={data.language}
                onValueChange={(value) => setData({ ...data, language: value })}
              >
                <Radio
                  classNames={{
                    base: "max-w-full m-0 p-4 border-2 rounded-xl cursor-pointer data-[selected=true]:border-primary bg-default-50 hover:bg-default-100 transition-colors",
                    wrapper: "hidden",
                    labelWrapper: "ml-0",
                  }}
                  value="luganda"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇺🇬</span>
                    <div>
                      <p className="font-medium">Luganda</p>
                      <p className="text-sm text-default-500">Uganda</p>
                    </div>
                  </div>
                </Radio>
                <Radio
                  classNames={{
                    base: "max-w-full m-0 p-4 border-2 rounded-xl cursor-pointer data-[selected=true]:border-primary bg-default-50 hover:bg-default-100 transition-colors",
                    wrapper: "hidden",
                    labelWrapper: "ml-0",
                  }}
                  value="krio"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇸🇱</span>
                    <div>
                      <p className="font-medium">Krio</p>
                      <p className="text-sm text-default-500">Sierra Leone</p>
                    </div>
                  </div>
                </Radio>
              </RadioGroup>
            </>
          )}

          {/* Step 3: Instructions */}
          {currentStep === 3 && (
            <>
              <div>
                <p className="text-lg font-medium mb-2">How it works</p>
                <p className="text-sm text-default-500">
                  Here&apos;s what you&apos;ll be doing in this evaluation
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-default-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
                    <Icon
                      className="w-5 h-5 text-primary"
                      icon="solar:volume-loud-bold-duotone"
                    />
                  </div>
                  <div>
                    <p className="font-medium">
                      1. Listen to each audio sample
                    </p>
                    <p className="text-sm text-default-500">
                      You must hear the full clip before rating
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-default-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-warning/10 rounded-full">
                    <Icon
                      className="w-5 h-5 text-warning"
                      icon="solar:star-bold-duotone"
                    />
                  </div>
                  <div>
                    <p className="font-medium">2. Rate how natural it sounds</p>
                    <p className="text-sm text-default-500">
                      Imagine you&apos;re talking to a friend
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-default-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-success/10 rounded-full">
                    <Icon
                      className="w-5 h-5 text-success"
                      icon="solar:restart-bold-duotone"
                    />
                  </div>
                  <div>
                    <p className="font-medium">3. Repeat for 20 samples</p>
                    <p className="text-sm text-default-500">
                      Takes about 10-15 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <Icon
                  className="w-6 h-6 text-warning flex-shrink-0"
                  icon="solar:headphones-round-bold-duotone"
                />
                <p className="text-sm">
                  <span className="font-medium">Tip:</span> Use headphones for
                  the best experience
                </p>
              </div>
            </>
          )}

          {/* Step 4: Consent */}
          {currentStep === 4 && (
            <>
              <div>
                <p className="text-lg font-medium mb-2">Research Consent</p>
                <p className="text-sm text-default-500">
                  Please review and agree to participate
                </p>
              </div>

              <Card className="bg-default-50" shadow="none">
                <CardBody className="gap-4">
                  <div>
                    <p className="font-medium text-success mb-2 flex items-center gap-2">
                      <Icon
                        className="w-5 h-5"
                        icon="solar:check-circle-bold-duotone"
                      />
                      Your responses will:
                    </p>
                    <ul className="text-sm text-default-600 space-y-1 ml-7">
                      <li>• Be used for academic research</li>
                      <li>• Remain anonymous</li>
                      <li>• Help improve voice AI technology</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-danger mb-2 flex items-center gap-2">
                      <Icon
                        className="w-5 h-5"
                        icon="solar:close-circle-bold-duotone"
                      />
                      Your responses will NOT:
                    </p>
                    <ul className="text-sm text-default-600 space-y-1 ml-7">
                      <li>• Include your personal information</li>
                      <li>• Be sold or shared commercially</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>

              <Checkbox
                classNames={{
                  base: "p-4 bg-default-50 rounded-xl max-w-full",
                  label: "text-sm",
                }}
                isInvalid={!!errors.consent}
                isSelected={data.consent}
                onValueChange={(value) => setData({ ...data, consent: value })}
              >
                <span className={errors.consent ? "text-danger" : ""}>
                  I understand and consent to participate in this research
                </span>
              </Checkbox>
            </>
          )}
        </CardBody>

        <CardFooter className="flex gap-3 p-6 pt-0">
          {currentStep > 1 && (
            <Button
              className="flex-1"
              startContent={
                <Icon className="w-5 h-5" icon="solar:alt-arrow-left-linear" />
              }
              variant="bordered"
              onPress={handleBack}
            >
              Back
            </Button>
          )}
          <Button
            className={currentStep === 1 ? "w-full" : "flex-1"}
            color="primary"
            endContent={
              <Icon className="w-5 h-5" icon="solar:alt-arrow-right-linear" />
            }
            onPress={handleNext}
          >
            {currentStep === steps.length ? "Begin Evaluation" : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
