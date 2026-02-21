import type { VerifyEmailProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";

export function VerifyEmail({
  userName,
  verificationUrl,
  appUrl,
}: VerifyEmailProps) {
  return (
    <Layout previewText="Verify your email address for OpenMOS">
      <Header appUrl={appUrl} subtitle="Admin Portal" />
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
          Welcome, {userName}
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Thanks for signing up for OpenMOS. To complete your registration and
          access the admin portal, please verify your email address.
        </Text>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={verificationUrl}>Verify Email Address</Button>
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
          {verificationUrl}
        </Text>

        <Alert variant="info">
          <strong>This link expires in 1 hour.</strong> If you didn't create an
          account, you can safely ignore this email.
        </Alert>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default VerifyEmail;
