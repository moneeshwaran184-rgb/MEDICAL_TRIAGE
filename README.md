<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/13a18274-2883-498f-89ac-702295213e42

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (Supabase)

The app works out of the box in local demo mode. To enable real accounts,
appointments, doctor dashboards and notifications:

1. Create a project at <https://supabase.com>.
2. Run the full [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.
3. Add your project credentials to `.env.local`:

   ```env
   VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
   VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   ```

4. Restart `npm run dev`.

Full instructions, demo doctor credentials and optional Twilio SMS setup are in
[`supabase/README.md`](supabase/README.md).

