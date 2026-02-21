import type { ErrorAlertProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";

export function ErrorAlert({
  errorType,
  errorMessage,
  occurredAt,
  affectedService,
  dashboardUrl,
  appUrl,
}: ErrorAlertProps) {
  return (
    <Layout previewText={`🚨 System Error: ${errorType} in ${affectedService}`}>
      <Header appUrl={appUrl} subtitle="System Alert" />
      <Section
        style={{
          padding: "32px 24px",
        }}
      >
        <Text
          style={{
            margin: "0 0 16px 0",
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "1.25",
            color: "#b91c1c", // red-700
          }}
        >
          System Error Detected
        </Text>

        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          An automated monitor has detected an error in the OpenMOS platform
          that requires administrative attention.
        </Text>

        <Alert variant="error">
          <strong>{errorType}</strong>: {errorMessage}
        </Alert>

        <Section
          className="bg-gray-50 border-gray-200"
          style={{
            padding: "16px",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            margin: "24px 0",
          }}
        >
          <Text
            className="text-gray-700"
            style={{ margin: "0 0 8px 0", fontSize: "14px" }}
          >
            <strong>Service:</strong> {affectedService}
          </Text>
          <Text
            className="text-gray-700"
            style={{ margin: "0", fontSize: "14px" }}
          >
            <strong>Time:</strong> {occurredAt}
          </Text>
        </Section>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={dashboardUrl} variant="primary">
            View Error Logs
          </Button>
        </Section>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default ErrorAlert;
