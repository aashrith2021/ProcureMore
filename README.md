# PrimeBoss Abacus Manager

This is a mobile-friendly web app for managing:

- Students
- Classes and student batches
- Attendance
- Fee payments
- Weekly schedules

## Local mode

If you open `index.html` directly, the app works in browser storage mode.

## Cloud database mode with Supabase

1. Create a free Supabase project.
2. Open the SQL editor in Supabase.
3. Run the SQL from `database.sql`.
4. In Supabase, copy:
   - Project URL
   - Anon public key
5. Open `supabase-config.js`.
6. Fill it like this:

```js
window.PRIMEBOSS_SUPABASE_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-KEY"
};
```

7. Refresh the app.

If the connection works, the banner at the top of the Students section will show cloud mode.

## Free hosting options

Recommended simple setup:

1. Supabase for the database.
2. Cloudflare Pages, Netlify, or Vercel for hosting the frontend.

## Simple free hosting flow

1. Put this project in GitHub.
2. Create a Cloudflare Pages, Netlify, or Vercel account.
3. Import the GitHub repo.
4. Set the publish directory to the project root.
5. Deploy.

Because this project is static HTML, CSS, and JS, hosting is straightforward.
