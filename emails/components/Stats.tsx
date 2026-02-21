import { Column, Row, Section, Text } from "@react-email/components";
import * as React from "react";

export interface StatItem {
  label: string;
  value: string | number;
  icon?: string; // emoji or short text
  color?: string; // hex color
}

interface StatsProps {
  items: StatItem[];
}

export function Stats({ items }: StatsProps) {
  // Mobile stacks, desktop shows side-by-side using table columns
  return (
    <Section
      style={{
        width: "100%",
        padding: "16px 0",
      }}
    >
      <Row>
        {items.map((item, index) => {
          // Calculate width percentage based on number of items (max 3 usually)
          const widthPct = `${Math.floor(100 / items.length)}%`;

          return (
            <Column
              key={index}
              style={{
                width: widthPct,
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                textAlign: "center",
                display: "inline-block", // Helps with mobile stacking in some clients
                boxSizing: "border-box",
                verticalAlign: "top",
              }}
            >
              <Text
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                }}
              >
                {item.icon || "📊"}
              </Text>
              <Text
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: item.color || "#111827",
                  lineHeight: "1.2",
                }}
              >
                {item.value}
              </Text>
              <Text
                style={{
                  margin: "0",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                }}
              >
                {item.label}
              </Text>
            </Column>
          );
        })}
      </Row>
    </Section>
  );
}

export default Stats;
