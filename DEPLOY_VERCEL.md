# Deploying to Vercel

This project was built in Lovable on a Cloudflare Workers preset. To deploy
on Vercel without disturbing the Lovable preview, we ship a parallel SPA build
(`vite.vercel.config.ts` + `index.vercel.html` + `src/main.vercel.tsx`) that
Vercel uses instead of the Cloudflare Worker bundle.

The app talks to Supabase directly from the browser using the publishable key,
so SSR is not required and the SPA build is fully end-to-end functional —
including the submission form and the admin panel.

## Steps

1. **Push to GitHub** — In Lovable, open the chat **+** menu → GitHub →
   Connect project. This creates the repo and auto-syncs.

2. **Import on Vercel** — In Vercel, "Add New… → Project" → pick your repo.
   Vercel will detect `vercel.json` and use:
   - Build: `vite build --config vite.vercel.config.ts`
   - Output: `dist`
   - Install: `bun install`

3. **Set environment variables** in Vercel project settings → Environment
   Variables (Production + Preview):

   | Name                            | Value                                           |
   | ------------------------------- | ----------------------------------------------- |
   | `VITE_SUPABASE_URL`             | `https://ngbiuipsvpmfisxvjpaa.supabase.co`      |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | (copy from `.env` — starts with `eyJ…`)         |
   | `VITE_SUPABASE_PROJECT_ID`      | `ngbiuipsvpmfisxvjpaa`                          |

   These are publishable — safe to expose in the bundle. RLS on the
   `submissions` table is what protects the data.

4. **Deploy.** Vercel will build and serve the SPA. The `vercel.json`
   rewrite sends every URL to `index.html` so client-side routing works on
   refresh and deep-links.

## What's NOT included on Vercel

- Server functions (`createServerFn`) — none exist in this project today.
- Cloudflare Workers SSR — replaced by the static SPA.

If you later add a `createServerFn`, you'll need to either move it to a
Vercel Serverless Function (`api/*.ts`) or keep that work on Lovable's
hosting.

## Continuing to use Lovable

The default `vite.config.ts` is untouched, so the Lovable preview and the
Lovable Publish button keep working exactly as before. You can dual-host:
develop in Lovable, deploy to Vercel from GitHub.
