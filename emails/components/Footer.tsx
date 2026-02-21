import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";

interface FooterProps {
  appUrl?: string;
}

export function Footer({ appUrl = "https://openmos.app" }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <Section
      className="bg-white px-[24px] pb-[24px]"
      style={{
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingBottom: "24px",
      }}
    >
      <Hr
        className="border-gray-200 my-[24px]"
        style={{ borderColor: "#e5e7eb", margin: "24px 0" }}
      />

      <Text
        className="text-gray-500"
        style={{
          margin: "0",
          fontSize: "14px",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        <Link
          href={appUrl}
          style={{ color: "#1e40af", textDecoration: "none" }}
        >
          OpenMOS Platform
        </Link>
        {" • "}
        <Link
          href={`${appUrl}/help`}
          style={{ color: "#1e40af", textDecoration: "none" }}
        >
          Help Center
        </Link>
        {" • "}
        <Link
          href={`${appUrl}/privacy`}
          style={{ color: "#1e40af", textDecoration: "none" }}
        >
          Privacy Policy
        </Link>
      </Text>

      <Text
        className="text-gray-500"
        style={{
          margin: "16px 0 0",
          fontSize: "12px",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        &copy; {year} OpenMOS. All rights reserved.
      </Text>

      <Text
        className="text-gray-400"
        style={{
          margin: "8px 0 0",
          fontSize: "11px",
          textAlign: "center",
          lineHeight: "1.5",
          color: "#9ca3af",
        }}
      >
        OpenMOS Research Institute • 123 Science Way • Research Park, CA 94000
      </Text>
    </Section>
  );
}

export default Footer;
