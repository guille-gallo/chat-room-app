import { AppHeader } from "./components/AppHeader";
import { AuthScreen } from "./components/AuthScreen";
import { ChatRoom } from "./components/ChatRoom";
import { LoadingScreen } from "./components/LoadingScreen";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { session, username, isLoading, authError, signInWithGoogle, signOut } =
    useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!session) {
    return <AuthScreen error={authError} onSignIn={signInWithGoogle} />;
  }

  return (
    <main className="shell">
      <AppHeader
        email={session.user.email ?? username}
        onSignOut={signOut}
      />
      {authError && <p className="error-text">{authError}</p>}
      <ChatRoom username={username} />
    </main>
  );
}
