import { Img, Row, Column, Text } from "@react-email/components";
import * as React from "react";

interface HeaderProps {
  subtitle?: string;
  appUrl?: string; // e.g. "https://openmos.app"
}

export function Header({
  subtitle,
  appUrl = "https://openmos.app",
}: HeaderProps) {
  // Use public URL for the logo, or localhost for local testing.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || appUrl;

  return (
    <Row
      className="bg-white border-b-4 border-solid border-[#1e40af]"
      style={{
        padding: "32px 24px",
      }}
    >
      <Column align="center" style={{ width: "100%" }}>
        <Img
          alt="OpenMOS Logo"
          height="48"
          src={`./logo.png`}
          style={{ margin: "0 auto", display: "block" }}
          width="48"
        />
        <Text
          className="text-gray-900"
          style={{
            margin: "16px 0 0",
            fontSize: "24px",
            fontWeight: 700,
            lineHeight: "1.25",
            textAlign: "center",
          }}
        >
          OpenMOS
        </Text>
        {subtitle && (
          <Text
            className="text-gray-500"
            style={{
              margin: "4px 0 0",
              fontSize: "14px",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            {subtitle}
          </Text>
        )}
      </Column>
    </Row>
  );
}

export default Header;
