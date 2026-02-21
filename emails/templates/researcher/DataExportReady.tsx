import type { DataExportReadyProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Stats } from "../../components/Stats";
import { Alert } from "../../components/Alert";

export function DataExportReady({
  researcherName,
  exportType,
  downloadUrl,
  recordCount,
  fileSize,
  expiresInDays,
  appUrl,
}: DataExportReadyProps) {
  return (
    <Layout previewText="Your OpenMOS data export is ready to download">
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
          Your Export is Ready
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Hello {researcherName}, the data export you requested has been
          successfully generated and is ready for download.
        </Text>

        <Stats
          items={[
            { label: "Format", value: exportType, icon: "📄" },
            {
              label: "Records",
              value: recordCount.toLocaleString(),
              icon: "📊",
            },
            { label: "Size", value: fileSize, icon: "💾" },
          ]}
        />

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button href={downloadUrl} variant="success">
            Download Export
          </Button>
        </Section>

        <Alert variant="warning">
          <strong>Security Notice:</strong> This download link will expire in{" "}
          {expiresInDays} days. Please do not share this link, as the export may
          contain sensitive research data.
        </Alert>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default DataExportReady;
