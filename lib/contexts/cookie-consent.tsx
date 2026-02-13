"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";

export type CookieConsent = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  research: boolean;
};

type CookieConsentContextType = {
  consent: CookieConsent | null;
  hasConsented: boolean;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookieConsent) => void;
  withdrawConsent: () => void;
};

const defaultConsent: CookieConsent = {
  essential: true, // Always true
  functional: false,
  analytics: false,
  research: false,
};

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined);

const COOKIE_NAME = "openmos_consent";
const COOKIE_EXPIRY = 365; // days

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load consent from cookie on mount
  useEffect(() => {
    setMounted(true);
    const savedConsent = Cookies.get(COOKIE_NAME);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsent;

        setConsent({ ...parsed, essential: true }); // Essential always true
        setShowBanner(false);
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = useCallback((newConsent: CookieConsent) => {
    const consentToSave = { ...newConsent, essential: true };

    Cookies.set(COOKIE_NAME, JSON.stringify(consentToSave), {
      expires: COOKIE_EXPIRY,
      sameSite: "strict",
    });
    // Also save to localStorage for redundancy
    localStorage.setItem(COOKIE_NAME, JSON.stringify(consentToSave));
    setConsent(consentToSave);
    setShowBanner(false);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      research: true,
    });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      research: false,
    });
  }, [saveConsent]);

  const savePreferences = useCallback(
    (preferences: CookieConsent) => {
      saveConsent(preferences);
    },
    [saveConsent],
  );

  const withdrawConsent = useCallback(() => {
    Cookies.remove(COOKIE_NAME);
    localStorage.removeItem(COOKIE_NAME);
    setConsent(null);
    setShowBanner(true);
  }, []);

  const hasConsented = consent !== null;

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented,
        showBanner,
        setShowBanner,
        acceptAll,
        rejectAll,
        savePreferences,
        withdrawConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  // During SSR or if used outside provider, return safe defaults
  if (context === undefined) {
    return {
      consent: null,
      hasConsented: false,
      showBanner: false,
      setShowBanner: () => {},
      acceptAll: () => {},
      rejectAll: () => {},
      savePreferences: () => {},
      withdrawConsent: () => {},
    };
  }

  return context;
}
