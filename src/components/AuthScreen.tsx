interface AuthScreenProps {
  error: string | null;
  onSignIn: () => void;
}

export function AuthScreen({ error, onSignIn }: AuthScreenProps) {
  return (
    <main className="shell center">
      <section className="card auth-card">
        <h1>Chat Room</h1>
        <p>Sign in with Google to access the chat application.</p>
        <button type="button" className="primary-btn" onClick={onSignIn}>
          Continue with Google
        </button>
        {error && <p className="error-text">{error}</p>}
      </section>
    </main>
  );
}
