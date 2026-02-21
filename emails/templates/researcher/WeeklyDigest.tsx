import type { WeeklyDigestProps } from "../../lib/types";

import { Section, Text, Hr } from "@react-email/components";
import * as React from "react";

import { Layout } from "../../components/Layout";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/Button";
import { Stats } from "../../components/Stats";

export function WeeklyDigest({
  researcherName,
  weekStart,
  weekEnd,
  newRatings,
  completionRate,
  activeStudies,
  topInsights,
  dashboardUrl,
  appUrl,
}: WeeklyDigestProps) {
  return (
    <Layout
      previewText={`Your OpenMOS Weekly Summary (${weekStart} - ${weekEnd})`}
    >
      <Header
        appUrl={appUrl}
        subtitle={`Weekly Summary: ${weekStart} - ${weekEnd}`}
      />
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
          Here's a quick look at your study progress over the past week across
          the OpenMOS platform.
        </Text>

        <Stats
          items={[
            {
              label: "New Ratings",
              value: newRatings.toLocaleString(),
              icon: "📈",
              color: "#1e40af",
            },
            {
              label: "Completion",
              value: `${Math.round(completionRate)}%`,
              icon: "🎯",
              color: "#10b981",
            },
            {
              label: "Active Studies",
              value: activeStudies,
              icon: "🔬",
              color: "#6b7280",
            },
          ]}
        />

        {topInsights && topInsights.length > 0 && (
          <Section
            className="bg-gray-50 border-gray-200"
            style={{
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              margin: "32px 0 24px 0",
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
              Top Insights
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
              {topInsights.map((insight, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: index === topInsights.length - 1 ? 0 : "8px",
                  }}
                >
                  {insight}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Hr style={{ borderColor: "#e5e7eb", margin: "32px 0" }} />

        <Section style={{ textAlign: "center", margin: "16px 0 32px 0" }}>
          <Button href={dashboardUrl}>View Full Dashboard</Button>
        </Section>
      </Section>
      <Footer appUrl={appUrl} />
    </Layout>
  );
}

export default WeeklyDigest;
