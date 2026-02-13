import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Begin your evaluation journey - help improve AI voice technology",
};

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
