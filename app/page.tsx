import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";
import { LANGUAGES } from "@/config/languages";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center max-w-2xl">
        {/* Hero Icon */}
        <div className="mb-6 icon-pulse">
          <Icon 
            icon="solar:soundwave-circle-bold-duotone" 
            className="w-16 h-16 md:w-20 md:h-20 text-primary" 
          />
        </div>

        {/* Headlines */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          OpenMOS Evaluation Platform
        </h1>
        <p className="text-lg md:text-xl text-default-600 mb-8 max-w-xl">
          Help improve AI voice technology for African languages by rating audio samples
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
          <Card className="bg-default-50 border border-default-200" shadow="none">
            <CardBody className="flex flex-row md:flex-col items-center gap-3 p-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <Icon icon="solar:headphones-round-bold-duotone" className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left md:text-center">
                <p className="font-medium">Listen</p>
                <p className="text-sm text-default-500">20 audio samples</p>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-default-50 border border-default-200" shadow="none">
            <CardBody className="flex flex-row md:flex-col items-center gap-3 p-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10">
                <Icon icon="solar:star-bold-duotone" className="w-6 h-6 text-warning" />
              </div>
              <div className="text-left md:text-center">
                <p className="font-medium">Rate</p>
                <p className="text-sm text-default-500">How natural they sound</p>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-default-50 border border-default-200" shadow="none">
            <CardBody className="flex flex-row md:flex-col items-center gap-3 p-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10">
                <Icon icon="solar:chart-bold-duotone" className="w-6 h-6 text-success" />
              </div>
              <div className="text-left md:text-center">
                <p className="font-medium">Contribute</p>
                <p className="text-sm text-default-500">To academic research</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* CTA Button */}
        <Button 
          as={Link}
          href="/start"
          color="primary" 
          size="lg"
          className="w-full max-w-xs font-semibold text-lg h-14"
          startContent={<Icon icon="solar:play-circle-bold-duotone" className="w-6 h-6" />}
          endContent={<Icon icon="solar:alt-arrow-right-linear" className="w-5 h-5" />}
        >
          Start Evaluation
        </Button>

        {/* Time estimate */}
        <div className="flex items-center gap-2 mt-4 text-default-500 text-sm">
          <Icon icon="solar:clock-circle-linear" className="w-5 h-5" />
          <span>Takes 10-15 minutes</span>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-default-200 w-full max-w-xl">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-default-500 text-sm">
            <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-success" />
            <span>Anonymous & Secure</span>
          </div>
          <div className="flex items-center gap-2 text-default-500 text-sm">
            <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5 text-primary" />
            <span>Academic Research</span>
          </div>
          <div className="flex items-center gap-2 text-default-500 text-sm">
            <Icon icon="solar:smartphone-bold-duotone" className="w-5 h-5 text-warning" />
            <span>Mobile Friendly</span>
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <Card className="w-full max-w-xl bg-primary/5 border border-primary/20" shadow="none">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon icon="solar:global-bold-duotone" className="w-6 h-6 text-primary" />
            <h2 className="font-semibold">Native Speakers Wanted</h2>
          </div>
          <p className="text-sm text-default-600 mb-4">
            We&apos;re looking for native speakers of these languages to help evaluate AI-generated speech:
          </p>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <div 
                key={lang.code}
                className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-default-200"
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
