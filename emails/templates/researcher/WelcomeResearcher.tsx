import type { WelcomeResearcherProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";

export function WelcomeResearcher({
  userName,
  role,
  dashboardUrl,
  docsUrl,
  appUrl,
}: WelcomeResearcherProps) {
  return (
    <Layout previewText="Welcome to the OpenMOS Research Platform">
      <Header appUrl={appUrl} />
      <Section
        style={{
          padding: "32px 24px",
        }}
      >
        <Text
          className="text-gray-900"
          style={{
            margin: "0 0 16px 0",
            fontSize: "24px",
            fontWeight: 700,
            lineHeight: "1.25",
          }}
        >
          Welcome to OpenMOS! 🎉
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Hi {userName}, we&apos;re thrilled to have you join as a{" "}
          <strong>{role}</strong>. OpenMOS is a collaborative platform for
          speech research, helping build robust AI models for African languages.
        </Text>

        <Text
          className="text-gray-900"
          style={{
            margin: "32px 0 16px 0",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          Quick Start Guide
        </Text>

        <ol
          className="text-gray-700"
          style={{
            margin: "0 0 32px 0",
            padding: "0 0 0 24px",
            fontSize: "16px",
            lineHeight: "1.75",
          }}
        >
          <li>
            <strong>Update your profile</strong>: Ensure your details and
            preferences are current.
          </li>
          <li>
            <strong>Explore studies</strong>: Browse the dashboard to see active
            evaluations.
          </li>
          <li>
            <strong>Review documentation</strong>: Get familiar with our rating
            scales and guidelines.
          </li>
        </ol>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={dashboardUrl}>Go to Dashboard</Button>
        </Section>

        <Section style={{ textAlign: "center", margin: "16px 0" }}>
          <Button href={docsUrl} variant="secondary">
            View Documentation
          </Button>
        </Section>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default WelcomeResearcher;
