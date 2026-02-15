import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { ChatRoom } from "./components/ChatRoom";
import { supabase } from "./lib/supabase";

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

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const url = new URL(window.location.href);
    const errorDescription =
      url.searchParams.get("error_description") ??
      url.searchParams.get("error");

    if (errorDescription) {
      setAuthError(errorDescription);
      url.searchParams.delete("error_description");
      url.searchParams.delete("error");
      window.history.replaceState({}, document.title, url.toString());
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

  const handleGoogleSignIn = async () => {
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

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
  };

  if (isLoading) {
    return (
      <main className="shell center">
        <section className="card">
          <h1>Loading chat…</h1>
          <p>Checking your session and completing sign in.</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="shell center">
        <section className="card auth-card">
          <h1>Chat Room</h1>
          <p>Sign in with Google to access the chat application.</p>
          <button type="button" className="primary-btn" onClick={handleGoogleSignIn}>
            Continue with Google
          </button>
          {authError && <p className="error-text">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1>Chat Room</h1>
          <p>Signed in as {session.user.email ?? username}</p>
        </div>
        <button type="button" className="secondary-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      {authError && <p className="error-text">{authError}</p>}

      <ChatRoom username={username} />
    </main>
  );
}
