# Chat Room App

Standalone SPA for authenticated real-time chat using Supabase Realtime.

## Setup

1. Copy env file and fill values:
   - `cp .env.example .env`
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Install and run:
   - `npm install`
   - `npm run dev`

## Supabase Auth (Google OAuth)

In your Supabase project dashboard:

1. Open **Authentication → Providers → Google**.
2. In Google Cloud (**Google Auth Platform → Clients**), create an OAuth Client ID of type **Web application**.
3. In that Google client:
   - Add Authorized JavaScript origins: `http://localhost:5173` and `http://127.0.0.1:5173`
   - Add Authorized redirect URI: copy the **Callback URL** shown in your Supabase Google provider tab for this exact project.
4. Back in Supabase, enable Google provider, enter Google OAuth **Client ID** and **Client Secret**, then save.
5. In **Authentication → URL Configuration** set:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: include `http://localhost:5173` and `http://127.0.0.1:5173`

If sign-in returns `Unsupported provider: provider is not enabled`, Google is still disabled or credentials were not saved in Supabase.

If sign-in fails after enabling Google, verify `.env` points to the same Supabase project where you configured the provider.

## Notes

- Chat access requires authentication.
- Messages are ephemeral and are not persisted in database tables.
- Open multiple tabs or browsers to test realtime presence and broadcasts.

## GitHub Actions → Vercel deployment

This repo includes a workflow at `.github/workflows/deploy-vercel.yml` that deploys to Vercel on every push to `main`.

### 1) Create required GitHub secrets

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

How to get these values:

- `VERCEL_TOKEN`: Vercel dashboard → **Settings → Tokens**
- `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`:
   1. Run `npx vercel link` from the project root and complete prompts.
   2. Open `.vercel/project.json` and copy `orgId` and `projectId`.

### 2) Configure Vercel environment variables

In Vercel project settings, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Set them for the **Production** environment.

### 3) Push to `main`

After secrets are configured, any push to `main` triggers deployment automatically.
