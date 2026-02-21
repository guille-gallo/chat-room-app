import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

function getOAuthErrorMessage(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();

  if (
    lower.includes("unsupported provider") ||
    lower.includes("provider is not enabled") ||
    lower.includes("validation_failed")
  ) {
    return "Google sign-in is not enabled in Supabase yet. Go to Authentication → Providers, enable Google, add client credentials, and save.";
  }

  return rawMessage;
}

function getDisplayName(user: User): string {
  const metadata = user.user_metadata ?? {};
  const named =
    metadata.full_name ?? metadata.name ?? metadata.preferred_username;

  if (typeof named === "string" && named.trim()) {
    return named.trim();
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    return user.email.split("@")[0];
  }

  return user.id.slice(0, 8);
}

function extractUrlAuthError(): string | null {
  const url = new URL(window.location.href);
  const errorDescription =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error");

  if (!errorDescription) return null;

  url.searchParams.delete("error_description");
  url.searchParams.delete("error");
  window.history.replaceState({}, document.title, url.toString());

  return errorDescription;
}

export interface UseAuthReturn {
  session: Session | null;
  username: string;
  isLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const urlError = extractUrlAuthError();
    if (urlError) {
      setAuthError(urlError);
    }

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setAuthError(error.message);
      }

      setSession(data.session ?? null);
      setIsLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
      setAuthError(null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const username = useMemo(
    () => (session?.user ? getDisplayName(session.user) : ""),
    [session]
  );

  const signInWithGoogle = async () => {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(getOAuthErrorMessage(error.message));
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
  };

  return {
    session,
    username,
    isLoading,
    authError,
    signInWithGoogle,
    signOut,
  };
}
