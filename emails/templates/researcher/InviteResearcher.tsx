import type { InviteResearcherProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Alert } from "../../components/Alert";

export function InviteResearcher({
  inviterName,
  inviteeName,
  role,
  acceptUrl,
  expiresInDays,
  appUrl,
}: InviteResearcherProps) {
  return (
    <Layout
      previewText={`You've been invited to join OpenMOS by ${inviterName}`}
    >
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
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "1.25",
          }}
        >
          Hello {inviteeName},
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          <strong>{inviterName}</strong> has invited you to join the OpenMOS
          platform in the role of <strong>{role}</strong>.
        </Text>

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
            style={{
              margin: "0 0 16px 0",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            As a {role}, you can:
          </Text>
          <ul
            className="text-gray-700"
            style={{
              margin: 0,
              padding: "0 0 0 20px",
              fontSize: "15px",
              lineHeight: "1.5",
            }}
          >
            {role === "Admin" && (
              <>
                <li style={{ marginBottom: "8px" }}>
                  Manage all studies and evaluation sessions
                </li>
                <li style={{ marginBottom: "8px" }}>Invite and manage users</li>
                <li style={{ marginBottom: "8px" }}>
                  Export platform-wide data
                </li>
              </>
            )}
            {role === "Researcher" && (
              <>
                <li style={{ marginBottom: "8px" }}>
                  Create and manage studies
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Review evaluation ratings
                </li>
                <li style={{ marginBottom: "8px" }}>Export study data</li>
              </>
            )}
            {role === "Viewer" && (
              <>
                <li style={{ marginBottom: "8px" }}>
                  View study results and statistics
                </li>
                <li style={{ marginBottom: "8px" }}>
                  Download reports and exports
                </li>
              </>
            )}
          </ul>
        </Section>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={acceptUrl}>Accept Invitation</Button>
        </Section>

        <Alert variant="warning">
          <strong>This invitation expires in {expiresInDays} days.</strong>
        </Alert>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default InviteResearcher;
