import type { ReactElement } from "react";

import { render } from "@react-email/render";

/**
 * Render a React Email component to HTML + plain text.
 */
export async function renderEmail(
  component: ReactElement,
): Promise<{ html: string; text: string }> {
  const html = await render(component);
  const text = await render(component, { plainText: true });

  return { html, text };
}
