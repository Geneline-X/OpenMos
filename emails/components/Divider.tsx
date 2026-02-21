import { Hr } from "@react-email/components";
import * as React from "react";

interface DividerProps {
  margin?: string;
}

export function Divider({ margin = "32px 0" }: DividerProps) {
  return (
    <Hr
      style={{
        borderColor: "#e5e7eb",
        borderWidth: "1px",
        borderStyle: "solid",
        margin,
      }}
    />
  );
}

export default Divider;
