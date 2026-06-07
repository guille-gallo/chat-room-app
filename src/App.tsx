import { AuthGate, useAuth } from "@guille-gallo/auth-kit";
import { AppHeader } from "./components/AppHeader";
import { ChatRoom } from "./components/ChatRoom";
import { LoadingScreen } from "./components/LoadingScreen";

function MainApp() {
  const { session, displayName, signOut, authError } = useAuth();

  return (
    <main className="shell">
      <AppHeader
        email={session?.user.email ?? displayName}
        onSignOut={signOut}
      />
      {authError && <p className="error-text">{authError}</p>}
      <ChatRoom username={displayName} />
    </main>
  );
}

export default function App() {
  return (
    <AuthGate loader={<LoadingScreen />}>
      <MainApp />
    </AuthGate>
  );
}
