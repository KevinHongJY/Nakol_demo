# Nakol-Style Website (Vercel + Supabase)

This is a Next.js landing page with a user capture form.
Form submissions call a Vercel-hosted API endpoint (`/api/users`) that inserts records into Supabase.

## 1) Install and run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 2) Create the Supabase table

In Supabase SQL Editor, run:

`/Users/hongjiayang/Documents/New project/supabase/schema.sql`

## 3) Environment variables

Set these in `.env.local` and in Vercel Project Settings:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Use the **Service Role** key only in server-side environment variables. Do not expose it in browser code.

## 4) Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Add the two environment variables above.
4. Deploy.

## 5) Attach your domain in Vercel

1. Open your Vercel project.
2. Go to **Settings → Domains**.
3. Add your domain and follow DNS records shown by Vercel.
4. Wait for verification to finish, then your site is live on that domain.

## API Contract

### `POST /api/users`

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

Success response:

```json
{
  "ok": true
}
```
