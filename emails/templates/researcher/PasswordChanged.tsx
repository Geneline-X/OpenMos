import type { PasswordChangedProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";

export function PasswordChanged({
  userName,
  changedAt,
  ipAddress,
  device,
  supportUrl,
  appUrl,
}: PasswordChangedProps) {
  return (
    <Layout previewText="Your OpenMOS password has been changed">
      <Header appUrl={appUrl} subtitle="Security Alert" />
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
          Password Changed
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Hi {userName}, this is a confirmation that the password for your
          OpenMOS account was changed on <strong>{changedAt}</strong>.
        </Text>

        {(ipAddress || device) && (
          <Section
            className="bg-gray-50 border-gray-200"
            style={{
              padding: "16px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              margin: "24px 0",
            }}
          >
            {device && (
              <Text
                className="text-gray-700"
                style={{ margin: "0 0 8px 0", fontSize: "14px" }}
              >
                <strong>Device:</strong> {device}
              </Text>
            )}
            {ipAddress && (
              <Text
                className="text-gray-700"
                style={{ margin: "0", fontSize: "14px" }}
              >
                <strong>IP Address:</strong> {ipAddress}
              </Text>
            )}
          </Section>
        )}

        <Alert variant="warning">
          <strong>Didn't do this?</strong> If you did not change your password,
          please secure your account immediately by contacting support.
        </Alert>

        <Section style={{ textAlign: "center", margin: "24px 0" }}>
          <Button href={supportUrl} variant="secondary">
            Contact Support
          </Button>
        </Section>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default PasswordChanged;
