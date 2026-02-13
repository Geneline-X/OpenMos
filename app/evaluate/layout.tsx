import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evaluation",
  description: "Rate audio samples for the OpenMOS research study",
};

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-default-50">
      <main className="container mx-auto max-w-lg px-4 py-4">{children}</main>
    </div>
  );
}
