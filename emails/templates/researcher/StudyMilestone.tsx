import type { StudyMilestoneProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Stats } from "../../components/Stats";
import { Alert } from "../../components/Alert";

export function StudyMilestone({
  researcherName,
  studyName,
  milestone,
  totalRatings,
  completedSessions,
  completionRate,
  dashboardUrl,
  appUrl,
}: StudyMilestoneProps) {
  return (
    <Layout previewText={`🎉 Milestone reached in ${studyName}: ${milestone}`}>
      <Header appUrl={appUrl} />
      <Section
        style={{
          padding: "32px 24px",
        }}
      >
        <Section style={{ textAlign: "center", marginBottom: "24px" }}>
          <Text
            style={{
              fontSize: "48px",
              margin: "0 0 16px 0",
              lineHeight: "1",
            }}
          >
            🎉
          </Text>
          <Text
            className="text-gray-900"
            style={{
              margin: "0 0 8px 0",
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: "1.25",
            }}
          >
            Study Milestone Reached!
          </Text>
        </Section>

        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Congratulations {researcherName}! Your study{" "}
          <strong>&quot;{studyName}&quot;</strong> just hit a major milestone:{" "}
          <strong>{milestone}</strong>.
        </Text>

        <Stats
          items={[
            {
              label: "Total Ratings",
              value: totalRatings.toLocaleString(),
              icon: "📝",
              color: "#1e40af",
            },
            {
              label: "Sessions",
              value: completedSessions.toLocaleString(),
              icon: "👥",
              color: "#10b981",
            },
            {
              label: "Completion",
              value: `${Math.round(completionRate)}%`,
              icon: "📈",
              color: "#f59e0b",
            },
          ]}
        />

        <Alert variant="success">
          <strong>Thank you for your contribution!</strong> The data gathered in
          this study will help build more inclusive AI models for African
          languages. Keep up the great work!
        </Alert>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={dashboardUrl}>View Study Dashboard</Button>
        </Section>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default StudyMilestone;
