import { Button as ReactEmailButton } from "@react-email/components";
import * as React from "react";

type ButtonVariant = "primary" | "secondary" | "success" | "danger";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
}

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  let backgroundColor = "#1e40af"; // primary blue
  let color = "#ffffff";
  let border = "none";

  switch (variant) {
    case "success":
      backgroundColor = "#10b981";
      break;
    case "danger":
      backgroundColor = "#ef4444";
      break;
    case "secondary":
      backgroundColor = "#ffffff";
      color = "#1e40af";
      border = "1px solid #1e40af";
      break;
  }

  return (
    <ReactEmailButton
      href={href}
      style={{
        backgroundColor,
        color,
        border,
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: 600,
        textDecoration: "none",
        textAlign: "center",
        display: "inline-block",
        padding: "12px 24px",
        lineHeight: "1",
        minHeight: "20px",
      }}
    >
      {children}
    </ReactEmailButton>
  );
}

export default Button;
