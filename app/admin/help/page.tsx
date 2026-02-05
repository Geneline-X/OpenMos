"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Icon } from "@iconify/react";
import { Link } from "@heroui/link";

const faqs = [
  {
    q: "How do I upload audio samples?",
    a: "Go to Audio Samples > Upload Samples. You can drag and drop or select .wav or .mp3 files. Make sure to select the correct model type and language for each file."
  },
  {
    q: "What is MOS (Mean Opinion Score)?",
    a: "MOS is a measure used to evaluate the perceived quality of speech. Raters score audio on a 1-5 scale where 5 is excellent (human-like) and 1 is unintelligible."
  },
  {
    q: "How do I export data for my paper?",
    a: "Go to Export Center and select your preferred format (CSV, JSON, or LaTeX). The LaTeX format generates a publication-ready table with MOS scores, standard deviations, and confidence intervals."
  },
  {
    q: "What does the 95% CI mean?",
    a: "The 95% Confidence Interval indicates the range within which the true MOS value lies with 95% probability. It's calculated using: CI = mean ± 1.96(σ/√n)."
  },
  {
    q: "How many raters do I need?",
    a: "For statistically significant results, we recommend at least 30 raters per language. The platform will warn you if your sample size is below recommended thresholds."
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help & Documentation</h1>
        <p className="text-default-500">Learn how to use OpenMOS effectively</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="solar:question-circle-bold-duotone" className="h-5 w-5 text-primary" />
              <p className="font-semibold">Frequently Asked Questions</p>
            </div>
          </CardHeader>
          <CardBody>
            <Accordion>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} title={faq.q}>
                  <p className="text-default-600">{faq.a}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="solar:book-bold-duotone" className="h-5 w-5 text-success" />
                <p className="font-semibold">Quick Links</p>
              </div>
            </CardHeader>
            <CardBody className="gap-2">
              <Link href="/admin/settings" className="flex items-center gap-2 text-sm">
                <Icon icon="solar:settings-linear" className="h-4 w-4" />
                Platform Settings
              </Link>
              <Link href="/admin/export" className="flex items-center gap-2 text-sm">
                <Icon icon="solar:download-linear" className="h-4 w-4" />
                Export Data
              </Link>
              <Link href="/admin/upload" className="flex items-center gap-2 text-sm">
                <Icon icon="solar:upload-linear" className="h-4 w-4" />
                Upload Samples
              </Link>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="solar:info-circle-bold-duotone" className="h-5 w-5 text-warning" />
                <p className="font-semibold">ITU-T P.800 Scale</p>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-1 text-sm">
                <li><strong>5:</strong> Excellent (Human-like)</li>
                <li><strong>4:</strong> Good (Minor artifacts)</li>
                <li><strong>3:</strong> Fair (Noticeably synthetic)</li>
                <li><strong>2:</strong> Poor (Robotic/Difficult)</li>
                <li><strong>1:</strong> Bad (Unintelligible)</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
