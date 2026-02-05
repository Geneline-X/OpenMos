"use client";

import { useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";
import { useCookieConsent, CookieConsent } from "@/lib/contexts/cookie-consent";

export function CookieConsentBanner() {
  const { showBanner, acceptAll, rejectAll, savePreferences, setShowBanner } = useCookieConsent();
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
                  icon="solar:shield-check-bold-duotone" 
                  className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" 
                />
                <div>
                  <h3 className="font-semibold text-base">We value your privacy</h3>
                  <p className="text-sm text-default-500 mt-1">
                    This research platform uses cookies to:
                  </p>
                  <ul className="text-sm text-default-500 mt-2 space-y-1">
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success" />
                      Save your progress
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success" />
                      Analyze platform performance
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-linear" className="w-4 h-4 text-success" />
                      Ensure data quality
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button color="primary" onPress={acceptAll} className="w-full">
                  Accept All
                </Button>
                <div className="flex gap-2">
                  <Button variant="bordered" onPress={rejectAll} className="flex-1">
                    Reject All
                  </Button>
                  <Button variant="light" onPress={() => setShowCustomize(true)} className="flex-1">
                    Customize
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Icon 
                  icon="solar:shield-check-bold-duotone" 
                  className="w-8 h-8 text-primary flex-shrink-0" 
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">We use cookies</span> to improve your experience and ensure research data quality.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="light" 
                  size="sm" 
                  onPress={() => setShowCustomize(true)}
                >
                  Customize
                </Button>
                <Button 
                  variant="bordered" 
                  size="sm" 
                  onPress={rejectAll}
                >
                  Essential Only
                </Button>
                <Button 
                  color="primary" 
                  size="sm" 
                  onPress={acceptAll}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </CardBody>
          <CardFooter className="pt-0 justify-center">
            <Link 
              href="/privacy" 
              size="sm" 
              className="text-default-500 flex items-center gap-1"
            >
              <Icon icon="solar:document-text-linear" className="w-4 h-4" />
              Read our Privacy Policy
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Customization Modal */}
      <Modal 
        isOpen={showCustomize} 
        onClose={() => setShowCustomize(false)}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Icon icon="solar:settings-bold-duotone" className="w-6 h-6 text-primary" />
            Cookie Preferences
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-4">
              Manage your cookie preferences below. Essential cookies are always active as they are required for basic functionality.
            </p>
            
            <Accordion variant="bordered" selectionMode="multiple">
              {/* Essential Cookies */}
              <AccordionItem
                key="essential"
                aria-label="Essential Cookies"
                startContent={
                  <Icon icon="solar:shield-check-bold-duotone" className="w-6 h-6 text-default-500" />
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
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">session_id</code>: Evaluation progress</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">csrf_token</code>: Security</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">language</code>: Selected language</li>
                  </ul>
                  <p className="text-xs text-default-400">Duration: Session only</p>
                </div>
              </AccordionItem>

              {/* Functional Cookies */}
              <AccordionItem
                key="functional"
                aria-label="Functional Cookies"
                startContent={
                  <Icon icon="solar:settings-linear" className="w-6 h-6 text-primary" />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Functional Cookies</span>
                    <Switch
                      size="sm"
                      isSelected={preferences.functional}
                      onValueChange={(v) => setPreferences(p => ({ ...p, functional: v }))}
                      aria-label="Toggle functional cookies"
                    />
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>Remember your preferences for a better experience.</p>
                  <ul className="space-y-1">
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">audio_volume</code>: Playback preference</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">theme</code>: UI appearance</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">remember_me</code>: Auto-login</li>
                  </ul>
                  <p className="text-xs text-default-400">Duration: 30 days</p>
                </div>
              </AccordionItem>

              {/* Analytics Cookies */}
              <AccordionItem
                key="analytics"
                aria-label="Analytics Cookies"
                startContent={
                  <Icon icon="solar:chart-linear" className="w-6 h-6 text-success" />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Analytics Cookies</span>
                    <Switch
                      size="sm"
                      isSelected={preferences.analytics}
                      onValueChange={(v) => setPreferences(p => ({ ...p, analytics: v }))}
                      aria-label="Toggle analytics cookies"
                    />
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>Help us improve the platform by analyzing usage patterns.</p>
                  <ul className="space-y-1">
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">page_views</code>: Traffic analysis</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">completion_rate</code>: Success metrics</li>
                  </ul>
                  <p className="text-xs text-default-400">Duration: 1 year • Provider: Vercel Analytics</p>
                </div>
              </AccordionItem>

              {/* Research Tracking */}
              <AccordionItem
                key="research"
                aria-label="Research Tracking"
                startContent={
                  <Icon icon="solar:document-text-linear" className="w-6 h-6 text-warning" />
                }
                title={
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">Research Tracking</span>
                    <Switch
                      size="sm"
                      isSelected={preferences.research}
                      onValueChange={(v) => setPreferences(p => ({ ...p, research: v }))}
                      aria-label="Toggle research tracking"
                    />
                  </div>
                }
              >
                <div className="text-sm text-default-500 space-y-2 pb-2">
                  <p>Behavioral data for research validity and publication.</p>
                  <ul className="space-y-1">
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">time_per_sample</code>: Engagement</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">replay_count</code>: Quality indicator</li>
                    <li>• <code className="text-xs bg-default-100 px-1 rounded">device_info</code>: Technical validation</li>
                  </ul>
                  <p className="text-xs text-default-400">Duration: Study duration (90 days) • Used for: Academic publication only</p>
                </div>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center gap-2 mt-4 text-sm text-default-500">
              <Icon icon="solar:info-circle-linear" className="w-4 h-4" />
              <Link href="/privacy" size="sm">Learn more about how we use your data</Link>
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
