# Continue in `chat-room-app`

Use this checklist to continue work in a new VS Code window focused on the new standalone chat app.

## 1) Open the new app folder

From terminal at repo root:

```bash
code /home/guille/Dev/react-app/chat-room-app
```

Or in VS Code: **File → Open Folder...** and select `chat-room-app`.

## 2) Configure environment variables

In `chat-room-app`:

```bash
cp .env.example .env
```

Then edit `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 3) Verify Supabase Google OAuth

In Supabase Dashboard:

1. Open **Authentication → Providers → Google**.
2. In Google Cloud (**Google Auth Platform → Clients**), create a **Web application** OAuth client.
3. In that Google client:
   - Authorized JavaScript origins: `http://localhost:5173` and `http://127.0.0.1:5173`
   - Authorized redirect URI: copy the **Callback URL** shown in your Supabase Google provider page (project-specific).
4. Back in Supabase, enable Google provider, paste Google Client ID/Secret, and save.
5. In **Authentication → URL Configuration** set:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: include `http://localhost:5173` and `http://127.0.0.1:5173`

If you see `Unsupported provider: provider is not enabled`, provider setup is incomplete (usually Google still disabled or missing credentials).

If login still fails, verify `.env` uses the same Supabase project URL where Google provider is configured.

## 4) Run the app

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## 5) What to test

- Unauthenticated users should only see the Google sign-in screen.
- After Google sign-in, chat room loads.
- Sign out returns to auth screen.
- Open 2 tabs to verify realtime presence and messages.

## 6) Key files in this app

- `src/App.tsx` (auth gate + session flow)
- `src/components/ChatRoom.tsx` (chat UI)
- `src/hooks/useChatRoom.ts` (realtime messaging + presence)
- `src/lib/supabase.ts` (Supabase client)
- `.env.example` (required env vars)
