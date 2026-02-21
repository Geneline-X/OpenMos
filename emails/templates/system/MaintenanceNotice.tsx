import type { MaintenanceNoticeProps } from "../../lib/types";

import { Section, Text } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Alert } from "../../components/Alert";

export function MaintenanceNotice({
  maintenanceStart,
  maintenanceEnd,
  duration,
  affectedServices,
  reason,
  appUrl,
}: MaintenanceNoticeProps) {
  return (
    <Layout previewText="Scheduled Maintenance Notice for OpenMOS">
      <Header appUrl={appUrl} subtitle="System Notice" />
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
          Scheduled Maintenance
        </Text>
        <Text
          className="text-gray-700"
          style={{
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          We are writing to inform you of an upcoming scheduled maintenance
          window for the OpenMOS platform. During this time, the platform may be
          temporarily unavailable.
        </Text>

        <Alert variant="info">
          <strong>Reason for maintenance:</strong> {reason}
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
            style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 600 }}
          >
            Maintenance Schedule
          </Text>
          <Text
            className="text-gray-700"
            style={{ margin: "0 0 8px 0", fontSize: "14px" }}
          >
            <strong>Start:</strong> {maintenanceStart}
          </Text>
          <Text
            className="text-gray-700"
            style={{ margin: "0 0 8px 0", fontSize: "14px" }}
          >
            <strong>End:</strong> {maintenanceEnd}
          </Text>
          <Text
            className="text-gray-700"
            style={{ margin: "0", fontSize: "14px" }}
          >
            <strong>Expected Duration:</strong> {duration}
          </Text>
        </Section>

        {affectedServices && affectedServices.length > 0 && (
          <>
            <Text
              className="text-gray-900"
              style={{
                margin: "32px 0 16px 0",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Affected Services
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
              {affectedServices.map((service, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom:
                      index === affectedServices.length - 1 ? 0 : "8px",
                  }}
                >
                  {service}
                </li>
              ))}
            </ul>
          </>
        )}

        <Text
          className="text-gray-500"
          style={{
            margin: "32px 0 0 0",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          We apologize for any inconvenience this may cause and appreciate your
          patience as we work to improve the platform.
        </Text>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default MaintenanceNotice;
