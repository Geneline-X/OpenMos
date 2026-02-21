import { Section, Text } from "@react-email/components";
import * as React from "react";

type AlertVariant = "info" | "warning" | "error" | "success";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
}

export function Alert({ variant = "info", children }: AlertProps) {
  let backgroundColor = "#eff6ff"; // info (blue)
  let borderColor = "#3b82f6";
  let textColor = "#1d4ed8";
  let icon = "ℹ️";

  switch (variant) {
    case "warning":
      backgroundColor = "#fffbeb";
      borderColor = "#f59e0b";
      textColor = "#b45309";
      icon = "⚠️";
      break;
    case "error":
      backgroundColor = "#fef2f2";
      borderColor = "#ef4444";
      textColor = "#b91c1c";
      icon = "🚨";
      break;
    case "success":
      backgroundColor = "#f0fdf4";
      borderColor = "#10b981";
      textColor = "#047857";
      icon = "✅";
      break;
  }

  return (
    <Section
      style={{
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: "4px",
        padding: "16px",
        margin: "24px 0",
      }}
    >
      <Text
        style={{
          margin: 0,
          color: textColor,
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        <span style={{ marginRight: "8px" }}>{icon}</span>
        {children}
      </Text>
    </Section>
  );
}

export default Alert;
