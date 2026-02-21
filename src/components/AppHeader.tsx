interface AppHeaderProps {
  email: string;
  onSignOut: () => void;
}

export function AppHeader({ email, onSignOut }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <h1>Chat Room</h1>
        <p>Signed in as {email}</p>
      </div>
      <button type="button" className="secondary-btn" onClick={onSignOut}>
        Sign out
      </button>
    </header>
  );
}
