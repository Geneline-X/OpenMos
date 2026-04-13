import type { DataQualityAlertProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";

export function DataQualityAlert({
  researcherName,
  studyName,
  alertType,
  alertDescription,
  affectedCount,
  reviewUrl,
  appUrl,
}: DataQualityAlertProps) {
  return (
    <Layout previewText={`⚠️ Data quality alert for study: ${studyName}`}>
      <Header appUrl={appUrl} subtitle="Data Quality Alert" />
      <Section
        style={{
          padding: "32px 24px",
        }}
      >
        <Text
          className="text-gray-900"
          style={{
            margin: "0 0 16px 0",
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "1.25",
          }}
        >
          Hello {researcherName},
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Our automated quality checks have flagged potential issues in your
          study <strong>&quot;{studyName}&quot;</strong>.
        </Text>

        <Alert variant="warning">
          <strong>{alertType}</strong>: {alertDescription}
        </Alert>

        <Section
          className="bg-gray-50 border-gray-200"
          style={{
            padding: "24px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            margin: "24px 0",
          }}
        >
          <Text
            className="text-gray-900"
            style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}
          >
            Summary of findings:
          </Text>
          <Text
            className="text-gray-700"
            style={{ margin: "0", fontSize: "15px", lineHeight: "1.5" }}
          >
            <strong style={{ color: "#ef4444" }}>
              {affectedCount} evaluations
            </strong>{" "}
            are currently flagged for review. We recommend investigating these
            records to maintain the validity of your study data.
          </Text>
        </Section>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={reviewUrl} variant="primary">
            Review Flagged Data
          </Button>
        </Section>

        <Text
          className="text-gray-500"
          style={{ margin: "0", fontSize: "14px", lineHeight: "1.5" }}
        >
          If you verify these evaluations are legitimate, you can mark them as
          &quot;Safe&quot; in the review portal to clear this alert.
        </Text>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default DataQualityAlert;
