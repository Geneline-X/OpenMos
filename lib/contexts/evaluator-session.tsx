"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";

interface EvaluatorSession {
  sessionToken: string;
  raterId?: string;
  language?: string;
  currentSampleIndex: number;
  totalSamples: number;
  createdAt: string;
  expiresAt: string;
  status: "active" | "completed" | "expired";
}

interface EvaluatorSessionContextType {
  session: EvaluatorSession | null;
  isLoading: boolean;
  hasActiveSession: boolean;
  startNewSession: () => Promise<EvaluatorSession | null>;
  resumeSession: () => Promise<EvaluatorSession | null>;
  updateProgress: (sampleIndex: number) => void;
  completeSession: () => void;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
}

const EvaluatorSessionContext = createContext<
  EvaluatorSessionContextType | undefined
>(undefined);

const SESSION_COOKIE_NAME = "openmos_session";
const SESSION_STORAGE_KEY = "openmos_session_data";

export function EvaluatorSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<EvaluatorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from cookie/localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionToken = Cookies.get(SESSION_COOKIE_NAME);

        if (sessionToken) {
          // Try to validate session with server
          const response = await fetch("/api/sessions/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionToken }),
          });

          if (response.ok) {
            const data = await response.json();

            setSession(data.session);
            // Backup to localStorage
            localStorage.setItem(
              SESSION_STORAGE_KEY,
              JSON.stringify(data.session),
            );
          } else {
            // Session invalid, clear it
            clearSessionData();
          }
        } else {
          // Try localStorage backup
          const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

          if (storedSession) {
            const parsed = JSON.parse(storedSession) as EvaluatorSession;
            // Validate the stored session
            const response = await fetch("/api/sessions/validate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionToken: parsed.sessionToken }),
            });

            if (response.ok) {
              const data = await response.json();

              setSession(data.session);
              // Restore cookie
              Cookies.set(SESSION_COOKIE_NAME, parsed.sessionToken, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
              });
            } else {
              clearSessionData();
            }
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
        clearSessionData();
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  // Stable reference — safe to use inside any useCallback without re-creating them
  const clearSessionData = useCallback(() => {
    Cookies.remove(SESSION_COOKIE_NAME);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  const startNewSession =
    useCallback(async (): Promise<EvaluatorSession | null> => {
      try {
        const response = await fetch("/api/sessions/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const data = await response.json();
        const newSession: EvaluatorSession = data.session;

        // Set cookie
        Cookies.set(SESSION_COOKIE_NAME, newSession.sessionToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        // Backup to localStorage
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));

        setSession(newSession);

        return newSession;
      } catch (error) {
        console.error("Error creating session:", error);

        return null;
      }
    }, []);

  const resumeSession =
    useCallback(async (): Promise<EvaluatorSession | null> => {
      if (!session) return null;

      try {
        const response = await fetch("/api/sessions/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken: session.sessionToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to resume session");
        }

        const data = await response.json();

        setSession(data.session);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.session));

        return data.session;
      } catch (error) {
        console.error("Error resuming session:", error);

        return null;
      }
    }, [session]);

  const updateProgress = useCallback(
    (sampleIndex: number) => {
      if (!session) return;

      const updatedSession = {
        ...session,
        currentSampleIndex: sampleIndex,
      };

      setSession(updatedSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));

      // Update server in background
      fetch("/api/sessions/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
          currentSampleIndex: sampleIndex,
        }),
      }).catch(console.error);
    },
    [session],
  );

  const completeSession = useCallback(() => {
    if (!session) return;

    const completedSession = {
      ...session,
      status: "completed" as const,
    };

    setSession(completedSession);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(completedSession));

    // Update server
    fetch("/api/sessions/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionToken: session.sessionToken }),
    }).catch(console.error);
  }, [session]);

  const clearSession = clearSessionData;

  const refreshSession = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch("/api/sessions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: session.sessionToken }),
      });

      if (response.ok) {
        const data = await response.json();

        setSession(data.session);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.session));
      } else {
        clearSessionData();
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }, [session]);

  const hasActiveSession = session !== null && session.status === "active";

  return (
    <EvaluatorSessionContext.Provider
      value={{
        session,
        isLoading,
        hasActiveSession,
        startNewSession,
        resumeSession,
        updateProgress,
        completeSession,
        clearSession,
        refreshSession,
      }}
    >
      {children}
    </EvaluatorSessionContext.Provider>
  );
}

export function useEvaluatorSession() {
  const context = useContext(EvaluatorSessionContext);

  if (context === undefined) {
    // Return safe defaults for SSR
    return {
      session: null,
      isLoading: true,
      hasActiveSession: false,
      startNewSession: async () => null,
      resumeSession: async () => null,
      updateProgress: () => {},
      completeSession: () => {},
      clearSession: () => {},
      refreshSession: async () => {},
    };
  }

  return context;
}
