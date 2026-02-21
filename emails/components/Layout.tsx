import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export function Layout({ children, previewText }: LayoutProps) {
  return (
    <Html>
      <Tailwind>
        <Head>
          <meta
            content="width=device-width, initial-scale=1.0"
            name="viewport"
          />
          <meta content="light dark" name="color-scheme" />
          <meta content="light dark" name="supported-color-schemes" />
          <style>
            {`
            @media (prefers-color-scheme: dark) {
              .body { background-color: #111827 !important; color: #f9fafb !important; }
              .container { background-color: #1f2937 !important; border-color: #374151 !important; }
              .text-gray-900 { color: #f9fafb !important; }
              .text-gray-700 { color: #d1d5db !important; }
              .text-gray-500 { color: #9ca3af !important; }
              .border-gray-200 { border-color: #374151 !important; }
              .bg-gray-50 { background-color: #111827 !important; }
              .bg-white { background-color: #1f2937 !important; }
            }
            @media (max-width: 600px) {
              .container { width: 100% !important; border-radius: 0 !important; }
              .content { padding: 16px !important; }
            }
          `}
          </style>
        </Head>
        {previewText && <Preview>{previewText}</Preview>}
        <Body
          className="body"
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
            backgroundColor: "#f9fafb",
            margin: 0,
            padding: 0,
          }}
        >
          <Container
            className="container block my-[40px] mx-auto w-[600px] max-w-full bg-white border border-solid border-[#e5e7eb] rounded-[8px] overflow-hidden"
            style={{ width: "600px" }}
          >
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default Layout;
