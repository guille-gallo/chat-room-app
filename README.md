# Chat Room App

Real-time chat rooms with Google sign-in, online presence, and ephemeral messages — built with React, Supabase Realtime, and Vite.

## Tech Stack

- **React 19** + **TypeScript** — presentational components, custom hooks
- **Supabase** — Auth (Google OAuth), Realtime (broadcast + presence)
- **Vite** — dev server and build
- **Vercel** — hosting via GitHub Actions CI/CD

## Getting Started

```bash
cp .env.example .env   # fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

You'll need a [Supabase](https://supabase.com) project with **Google OAuth** enabled under Authentication → Providers.

## Project Structure

```
src/
├── components/   # Presentational components (ChatRoom, AuthScreen, AppHeader, …)
├── hooks/        # useAuth, useChatRoom, useMessageInput
├── lib/          # Supabase client, utilities
├── App.tsx       # Root composition
└── main.tsx      # Entry point
```

## Deployment

Deployed to [Vercel](https://vercel.com) via its GitHub integration — pushes to `main` trigger automatic deploys. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Vercel project settings.

## License

MIT
