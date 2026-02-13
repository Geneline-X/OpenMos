"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { CookieConsentProvider } from "@/lib/contexts/cookie-consent";
import { EvaluatorSessionProvider } from "@/lib/contexts/evaluator-session";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <SessionProvider>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <CookieConsentProvider>
            <EvaluatorSessionProvider>
              <Toaster richColors position="top-right" />
              {children}
            </EvaluatorSessionProvider>
          </CookieConsentProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </SessionProvider>
  );
}
