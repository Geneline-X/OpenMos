"use client";

import { useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";

import { useCookieConsent, CookieConsent } from "@/lib/contexts/cookie-consent";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, savePreferences, setShowBanner } =
    useCookieConsent();
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsent>({
    essential: true,
    functional: false,
    analytics: false,
    research: false,
  });

  if (!showBanner) return null;

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowCustomize(false);
  };

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom slide-up">
        <Card
          className="max-w-lg mx-auto md:max-w-4xl border-t-2 border-primary shadow-lg"
          shadow="lg"
        >
          <CardBody className="gap-4">
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex items-start gap-3 mb-4">
                <Icon
                  className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                  icon="solar:shield-check-bold-duotone"
                />
                <div>
                  <h3 className="font-semibold text-base">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-default-500 mt-1">
                    This research platform uses cookies to:
                  </p>
                  <ul className="text-sm text-default-500 mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4 text-success"
                        icon="solar:check-circle-linear"
                      />
                      Save your progress
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4 text-success"
                        icon="solar:check-circle-linear"
                      />
                      Analyze platform performance
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon
                        className="w-4 h-4 text-success"
                        icon="solar:check-circle-linear"
                      />
                      Ensure data quality
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" color="primary" onPress={acceptAll}>
                  Accept All
                </Button>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="bordered"
                    onPress={rejectAll}
                  >
                    Reject All
                  </Button>
                  <Button
                    className="flex-1"
                    variant="light"
                    onPress={() => setShowCustomize(true)}
                  >
                    Customize
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Icon
                  className="w-8 h-8 text-primary flex-shrink-0"
                  icon="solar:shield-check-bold-duotone"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">We use cookies</span> to
                    improve your experience and ensure research data quality.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => setShowCustomize(true)}
                >
                  Customize
                </Button>
                <Button size="sm" variant="bordered" onPress={rejectAll}>
                  Essential Only
                </Button>
                <Button color="primary" size="sm" onPress={acceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          </CardBody>
          <CardFooter className="pt-0 justify-center">
            <Link
              className="text-default-500 flex items-center gap-1"
              href="/privacy"
              size="sm"
            >
              <Icon className="w-4 h-4" icon="solar:document-text-linear" />
              Read our Privacy Policy
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Customization Modal */}
      <Modal
        isOpen={showCustomize}
        scrollBehavior="inside"
        size="lg"
        onClose={() => setShowCustomize(false)}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Icon
              className="w-6 h-6 text-primary"
              icon="solar:settings-bold-duotone"
            />
            Cookie Preferences
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-4">
              Manage your cookie preferences below. Essential cookies are always
              active as they are required for basic functionality.
            </p>

            <Accordion selectionMode="multiple" variant="bordered">
              {/* Essential Cookies */}
              <AccordionItem
                key="essential"
                aria-label="Essential Cookies"
                startContent={
                  <Icon
                    className="w-6 h-6 text-default-500"
                    icon="solar:shield-check-bold-duotone"
                  />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Essential Cookies</span>
                    <span className="text-xs text-default-400 bg-default-100 px-2 py-1 rounded">
                      Always Active
                    </span>
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>Required for basic functionality. Cannot be disabled.</p>
                  <ul className="space-y-1">
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        session_id
                      </code>
                      : Evaluation progress
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        csrf_token
                      </code>
                      : Security
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        language
                      </code>
                      : Selected language
                    </li>
                  </ul>
                  <p className="text-xs text-default-400">
                    Duration: Session only
                  </p>
                </div>
              </AccordionItem>

              {/* Functional Cookies */}
              <AccordionItem
                key="functional"
                aria-label="Functional Cookies"
                startContent={
                  <Icon
                    className="w-6 h-6 text-primary"
                    icon="solar:settings-linear"
                  />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Functional Cookies</span>
                    <Switch
                      aria-label="Toggle functional cookies"
                      isSelected={preferences.functional}
                      size="sm"
                      onValueChange={(v) =>
                        setPreferences((p) => ({ ...p, functional: v }))
                      }
                    />
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>Remember your preferences for a better experience.</p>
                  <ul className="space-y-1">
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        audio_volume
                      </code>
                      : Playback preference
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        theme
                      </code>
                      : UI appearance
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        remember_me
                      </code>
                      : Auto-login
                    </li>
                  </ul>
                  <p className="text-xs text-default-400">Duration: 30 days</p>
                </div>
              </AccordionItem>

              {/* Analytics Cookies */}
              <AccordionItem
                key="analytics"
                aria-label="Analytics Cookies"
                startContent={
                  <Icon
                    className="w-6 h-6 text-success"
                    icon="solar:chart-linear"
                  />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Analytics Cookies</span>
                    <Switch
                      aria-label="Toggle analytics cookies"
                      isSelected={preferences.analytics}
                      size="sm"
                      onValueChange={(v) =>
                        setPreferences((p) => ({ ...p, analytics: v }))
                      }
                    />
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>
                    Help us improve the platform by analyzing usage patterns.
                  </p>
                  <ul className="space-y-1">
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        page_views
                      </code>
                      : Traffic analysis
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        completion_rate
                      </code>
                      : Success metrics
                    </li>
                  </ul>
                  <p className="text-xs text-default-400">
                    Duration: 1 year • Provider: Vercel Analytics
                  </p>
                </div>
              </AccordionItem>

              {/* Research Tracking */}
              <AccordionItem
                key="research"
                aria-label="Research Tracking"
                startContent={
                  <Icon
                    className="w-6 h-6 text-warning"
                    icon="solar:document-text-linear"
                  />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Research Tracking</span>
                    <Switch
                      aria-label="Toggle research tracking"
                      isSelected={preferences.research}
                      size="sm"
                      onValueChange={(v) =>
                        setPreferences((p) => ({ ...p, research: v }))
                      }
                    />
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>Behavioral data for research validity and publication.</p>
                  <ul className="space-y-1">
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        time_per_sample
                      </code>
                      : Engagement
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        replay_count
                      </code>
                      : Quality indicator
                    </li>
                    <li>
                      •{" "}
                      <code className="text-xs bg-default-100 px-1 rounded">
                        device_info
                      </code>
                      : Technical validation
                    </li>
                  </ul>
                  <p className="text-xs text-default-400">
                    Duration: Study duration (90 days) • Used for: Academic
                    publication only
                  </p>
                </div>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center gap-2 mt-4 text-sm text-default-500">
              <Icon className="w-4 h-4" icon="solar:info-circle-linear" />
              <Link href="/privacy" size="sm">
                Learn more about how we use your data
              </Link>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowCustomize(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSavePreferences}>
              Save Preferences
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
