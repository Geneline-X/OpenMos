import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { Icon } from "@iconify/react";

export const metadata = {
  title: "About",
  description: "Learn about the OpenMOS research platform and our mission",
};

export default function AboutPage() {
  return (
    <section className="py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Icon
          className="w-10 h-10 text-primary"
          icon="solar:info-circle-bold-duotone"
        />
        <div>
          <h1 className="text-3xl font-bold">About OpenMOS</h1>
          <p className="text-default-500">
            Mean Opinion Score Evaluation Platform
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Mission */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-primary"
                icon="solar:target-bold-duotone"
              />
              Our Mission
            </h2>
            <p className="text-default-600 leading-relaxed">
              OpenMOS is a research platform dedicated to improving AI voice
              technology for underrepresented languages. By collecting Mean
              Opinion Score (MOS) evaluations from native speakers, we help
              researchers understand how natural AI-generated speech sounds
              compared to human recordings.
            </p>
          </CardBody>
        </Card>

        {/* What is MOS */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-warning"
                icon="solar:star-bold-duotone"
              />
              What is MOS?
            </h2>
            <p className="text-default-600 leading-relaxed">
              Mean Opinion Score (MOS) is a standardized measure used in
              telecommunications and speech synthesis research. It rates audio
              quality on a scale of 1 to 5, where 5 represents
              &quot;excellent&quot; (sounds completely human) and 1 represents
              &quot;bad&quot; (unintelligible). MOS evaluations are conducted
              following ITU-T recommendation standards.
            </p>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[
                { score: 5, color: "success", label: "Excellent" },
                { score: 4, color: "success", label: "Good" },
                { score: 3, color: "warning", label: "Fair" },
                { score: 2, color: "danger", label: "Poor" },
                { score: 1, color: "danger", label: "Bad" },
              ].map((item) => (
                <div
                  key={item.score}
                  className="text-center p-2 bg-default-50 rounded-lg"
                >
                  <p className={`text-lg font-bold text-${item.color}`}>
                    {item.score}
                  </p>
                  <p className="text-xs text-default-500">{item.label}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Languages */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-success"
                icon="solar:global-bold-duotone"
              />
              Supported Languages
            </h2>
            <p className="text-default-600 leading-relaxed">
              We are currently focused on evaluating text-to-speech systems for
              African languages that are underrepresented in AI research:
            </p>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2 px-4 py-3 bg-default-50 rounded-lg">
                <span className="text-2xl">🇺🇬</span>
                <div>
                  <p className="font-medium">Luganda</p>
                  <p className="text-sm text-default-500">Uganda</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-default-50 rounded-lg">
                <span className="text-2xl">🇸🇱</span>
                <div>
                  <p className="font-medium">Krio</p>
                  <p className="text-sm text-default-500">Sierra Leone</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Research Use */}
        <Card shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-primary"
                icon="solar:document-text-bold-duotone"
              />
              Research Applications
            </h2>
            <p className="text-default-600 leading-relaxed">
              Your evaluations help us:
            </p>
            <ul className="space-y-2 mt-2">
              <li className="flex items-start gap-2 text-default-600">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-bold"
                />
                Compare different text-to-speech models (Orpheus, NeMo, etc.)
              </li>
              <li className="flex items-start gap-2 text-default-600">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-bold"
                />
                Identify areas where AI speech needs improvement
              </li>
              <li className="flex items-start gap-2 text-default-600">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-bold"
                />
                Publish research that advances voice technology for African
                languages
              </li>
              <li className="flex items-start gap-2 text-default-600">
                <Icon
                  className="w-5 h-5 text-success mt-0.5"
                  icon="solar:check-circle-bold"
                />
                Develop accessible technology for native speakers
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Contact */}
        <Card className="bg-primary/5 border border-primary/20" shadow="sm">
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon
                className="w-6 h-6 text-primary"
                icon="solar:letter-bold-duotone"
              />
              Contact Us
            </h2>
            <p className="text-default-600">
              Have questions about the research or want to get involved? Reach
              out to our team:
            </p>
            <Link
              className="flex items-center gap-2"
              href="mailto:research@openmos.org"
            >
              <Icon className="w-5 h-5" icon="solar:letter-linear" />
              research@openmos.org
            </Link>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
