import type { TwoFactorCodeProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Alert } from "../../components/Alert";

export function TwoFactorCode({
  userName,
  code,
  expiresInMinutes,
  appUrl,
}: TwoFactorCodeProps) {
  return (
    <Layout previewText={`Your OpenMOS verification code is ${code}`}>
      <Header appUrl={appUrl} subtitle="Two-Factor Authentication" />
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
          Verify Your Login
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Hi {userName}, please use the following verification code to complete
          your login.
        </Text>

        <Section
          className="bg-gray-50 border-gray-200"
          style={{
            padding: "24px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
            margin: "32px 0",
          }}
        >
          <Text
            className="text-gray-900"
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: 700,
              letterSpacing: "6px",
              fontFamily: "monospace",
            }}
          >
            {code}
          </Text>
        </Section>

        <Alert variant="warning">
          <strong>Never share this code.</strong> OpenMOS staff will never ask
          you for this code. This code expires in {expiresInMinutes} minutes.
        </Alert>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default TwoFactorCode;
