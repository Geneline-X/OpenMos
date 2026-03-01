import { Card, CardBody } from "@heroui/card";
import { Icon } from "@iconify/react";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how OpenMOS collects, uses, and protects your data",
};

export default function PrivacyPage() {
  return (
    <section className="py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Icon
          className="w-10 h-10 text-primary"
          icon="solar:shield-check-bold-duotone"
        />
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-default-500">Last updated: February 2026</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold">Introduction</h2>
            <p className="text-default-600 leading-relaxed">
              OpenMOS (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you participate in our Mean Opinion Score evaluation research.
            </p>
          </CardBody>
        </Card>

        {/* Data We Collect */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-primary"
                icon="solar:database-bold-duotone"
              />
              Data We Collect
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">
                  Demographic Information (Optional)
                </h3>
                <ul className="text-default-600 text-sm space-y-1 ml-4">
                  <li>• Age range</li>
                  <li>• Gender (optional)</li>
                  <li>• Native language</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Evaluation Data</h3>
                <ul className="text-default-600 text-sm space-y-1 ml-4">
                  <li>• Your ratings (1-5 scores) for each audio sample</li>
                  <li>• Time spent on each evaluation</li>
                  <li>• Number of times audio was replayed</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  Technical Data (with consent)
                </h3>
                <ul className="text-default-600 text-sm space-y-1 ml-4">
                  <li>• Device type and browser (for quality analysis)</li>
                  <li>• Session duration</li>
                  <li>• Anonymous session identifiers</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* How We Use Data */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-success"
                icon="solar:chart-bold-duotone"
              />
              How We Use Your Data
            </h2>
            <ul className="text-default-600 space-y-2">
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-linear"
                />
                <span>To analyze and compare text-to-speech model quality</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-linear"
                />
                <span>To publish academic research on speech synthesis</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-linear"
                />
                <span>
                  To improve AI voice technology for African languages
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-linear"
                />
                <span>To ensure evaluation data quality and reliability</span>
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Cookies */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-warning"
                icon="solar:settings-bold-duotone"
              />
              Cookies &amp; Tracking
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-default-50 rounded-lg">
                <h3 className="font-medium text-success mb-2">
                  Essential Cookies (Always Active)
                </h3>
                <p className="text-sm text-default-600">
                  Required for basic functionality: session management, progress
                  tracking, language preference. Cannot be disabled.
                </p>
              </div>

              <div className="p-4 bg-default-50 rounded-lg">
                <h3 className="font-medium text-primary mb-2">
                  Functional Cookies (Opt-in)
                </h3>
                <p className="text-sm text-default-600">
                  Remember your preferences: audio volume, theme settings,
                  auto-login. Duration: 30 days.
                </p>
              </div>

              <div className="p-4 bg-default-50 rounded-lg">
                <h3 className="font-medium text-warning mb-2">
                  Analytics Cookies (Opt-in)
                </h3>
                <p className="text-sm text-default-600">
                  Help us understand platform usage: page views, completion
                  rates, performance metrics. Duration: 1 year.
                </p>
              </div>

              <div className="p-4 bg-default-50 rounded-lg">
                <h3 className="font-medium text-danger mb-2">
                  Research Tracking (Opt-in)
                </h3>
                <p className="text-sm text-default-600">
                  Behavioral data for research validity: time per sample, replay
                  count, device info. Duration: 90 days (study period).
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Protection */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-primary"
                icon="solar:lock-password-bold-duotone"
              />
              Data Protection
            </h2>
            <ul className="text-default-600 space-y-2">
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:shield-check-linear"
                />
                <span>
                  All data is anonymized - we don&apos;t collect names, emails,
                  or identifying information
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:shield-check-linear"
                />
                <span>Data is encrypted in transit and at rest</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:shield-check-linear"
                />
                <span>
                  Access is restricted to authorized research team members
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:shield-check-linear"
                />
                <span>
                  Data will never be sold or shared for commercial purposes
                </span>
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Your Rights */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-success"
                icon="solar:user-check-bold-duotone"
              />
              Your Rights
            </h2>
            <p className="text-default-600 mb-4">
              Under GDPR and similar regulations, you have the right to:
            </p>
            <ul className="text-default-600 space-y-2">
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-primary mt-0.5"
                  icon="solar:document-text-linear"
                />
                <span>
                  <strong>Access:</strong> Download your evaluation data at any
                  time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-primary mt-0.5"
                  icon="solar:pen-linear"
                />
                <span>
                  <strong>Correction:</strong> Request correction of inaccurate
                  data
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-primary mt-0.5"
                  icon="solar:trash-bin-minimalistic-linear"
                />
                <span>
                  <strong>Deletion:</strong> Request deletion of your data
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-primary mt-0.5"
                  icon="solar:export-linear"
                />
                <span>
                  <strong>Portability:</strong> Receive your data in a standard
                  format
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Icon
                  className="w-5 h-5 text-primary mt-0.5"
                  icon="solar:close-circle-linear"
                />
                <span>
                  <strong>Withdraw Consent:</strong> Change cookie preferences
                  anytime
                </span>
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Contact */}
        <Card className="bg-primary/5 border border-primary/20" shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold">Contact Us</h2>
            <p className="text-default-600">
              For privacy-related questions or to exercise your rights, contact
              us at:
            </p>
            <a
              className="font-medium text-primary"
              href="mailto:info@geneline-x.net"
            >
              info@geneline-x.net
            </a>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
