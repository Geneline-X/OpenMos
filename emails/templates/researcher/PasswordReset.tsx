import type { PasswordResetProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";

export function PasswordReset({
  userName,
  resetUrl,
  expiresInMinutes,
  appUrl,
}: PasswordResetProps) {
  return (
    <Layout previewText="Reset your OpenMOS password">
      <Header appUrl={appUrl} subtitle="Security" />
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
          Password Reset Request
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Hi {userName}, we received a request to reset your OpenMOS password.
          Click the button below to create a new, secure password.
        </Text>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={resetUrl}>Reset Password</Button>
        </Section>

        <Text
          className="text-gray-500"
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          Or copy and paste this URL into your browser:
        </Text>
        <Text
          style={{
            margin: "0 0 24px 0",
            fontSize: "14px",
            color: "#1e40af",
            wordBreak: "break-all",
          }}
        >
          {resetUrl}
        </Text>

        <Alert variant="info">
          <strong>This link expires in {expiresInMinutes} minutes.</strong> If
          you didn't request a password reset, you can safely ignore this email.
          Your password will not be changed.
        </Alert>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default PasswordReset;
