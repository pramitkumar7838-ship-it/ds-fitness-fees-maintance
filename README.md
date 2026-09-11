# DS FITNESS FEES MAINTANCE

A gym member and fee management dashboard for **DS FITNESS**, built for admin **PRAMIT KUMAR**.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind CSS** on the frontend, **Supabase** (Postgres + Auth + Row Level Security) as the backend. Deploys to **Vercel** (frontend) + **Supabase** (database/auth), for free on small usage tiers.

Everything in this app is real and persistent: no mock data survives only in memory. Members, attendance, payments and settings are all stored in Postgres and protected by database-level security rules, not just app-level checks.

---

## 1. What's included

- OTP (SMS one-time-password) admin login via Supabase Auth phone sign-in — no passwords, no hardcoded codes.
- Full member CRUD: add, edit, search/filter, and a safe "move to Left Gym" flow that never silently deletes financial history. A separate, explicitly-confirmed "Delete Permanently" action exists only for members already marked Left Gym.
- Attendance / daily entry system with a one-tap "Mark Entry" flow, today's view, full history, and per-member attendance tabs.
- Fee tracking: monthly fee record by month/year, automatic Paid / Due Soon / Overdue classification, payment history that is never overwritten (every payment is its own permanent row).
- Dashboard with live stats, reminders, and recent payments.
- WhatsApp reminder button that opens `wa.me` with a pre-filled message — nothing is auto-sent.
- Reports page with CSV export and a print-friendly view.
- Settings page for gym name, admin name, currency, default fee, due day, and reminder window.
- Mobile-first responsive UI: bottom nav + cards on phones, sidebar + tables on desktop.
- Row Level Security on every table — only phone numbers listed in the `admins` table can read or write anything.

---

## 2. Prerequisites

- Node.js 18.18+ and npm
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)
- An SMS provider account for OTP delivery — Supabase's built-in phone auth needs one configured. **Twilio** is the most common choice and is what these instructions use. (Supabase does not send SMS itself; you must connect a provider.)

---

## 3. Database setup (Supabase)

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a name (e.g. `ds-fitness-fees`), a strong database password, and a region close to your gym.
2. Once the project is ready, open **SQL Editor** in the left sidebar.
3. Open `supabase/schema.sql` from this repo, copy its entire contents, paste into the SQL editor, and click **Run**. This creates all tables (`admins`, `settings`, `members`, `attendance`, `payments`), indexes, triggers, and Row Level Security policies.
4. (Optional, development only) Run `supabase/demo_data.sql` the same way to add a few clearly-labelled `(DEMO)` members so you can click around. **Do not run this against your production project** — start production with an empty database.
5. Add yourself as the only admin who can log in. Still in the SQL editor, run (replacing the phone number with the real one, in `+countrycode...` format, no spaces):

   ```sql
   insert into admins (phone, full_name)
   values ('+91XXXXXXXXXX', 'PRAMIT KUMAR');
   ```

   You can add more admins the same way later if the gym gets a second staff login.

6. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

   You'll need both for the `.env.local` file in step 5.

---

## 4. OTP / phone authentication setup (Supabase + Twilio)

Supabase Auth supports phone OTP out of the box, but it needs an SMS provider connected — this is required configuration, not something the app can fake.

1. Create a free [Twilio](https://www.twilio.com/try-twilio) account (or use Twilio Verify, or another Supabase-supported provider — MessageBird and Vonage are also supported).
2. In Twilio, get a phone number capable of sending SMS, and note your **Account SID**, **Auth Token**, and the **Messaging Service SID** (or the phone number, depending on which flow you use).
3. In Supabase: **Authentication → Providers → Phone**. Toggle it **on**.
4. Choose **Twilio** as the SMS provider and paste in your Account SID, Auth Token, and Messaging Service SID / sender number.
5. Save. Supabase will now send a real OTP SMS whenever `signInWithOtp({ phone })` is called from the app.
6. Test it: on the deployed or local app's login page, enter the admin's mobile number (the same one you added to the `admins` table) and confirm an SMS arrives.

**Important:** only phone numbers present in the `admins` table can actually see gym data — anyone else can request an OTP and log in to Supabase Auth, but Row Level Security will return zero rows for every table, and the app itself redirects them straight back to the login page. If you want to lock down OTP requests themselves (not just data access) to known numbers only, you can additionally restrict sign-ups in **Authentication → Settings**.

---

## 5. Local development

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` with the values from step 3.6:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
NEXT_PUBLIC_GYM_NAME="DS FITNESS"
```

Then run:

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login`. Log in with the admin phone number you added to `admins`.

---

## 6. Deployment

### Frontend — Vercel

1. Push this project to a GitHub repository.
2. In Vercel: **New Project → Import** your repo.
3. Framework preset should auto-detect as **Next.js**.
4. Add the same three environment variables from `.env.local` under **Settings → Environment Variables** (for Production, and Preview if you want preview deployments to work too).
5. Deploy. Vercel gives you a `*.vercel.app` URL immediately.

### Backend — already deployed

Supabase is already a hosted service — there's nothing extra to deploy. Just make sure the schema (step 3) has been run against your **production** Supabase project (use a separate project from any dev/test project if you seeded demo data).

### Custom domain

1. In Vercel: **Project → Settings → Domains**, add your domain (e.g. `app.dsfitness.in`).
2. Follow Vercel's instructions to add the CNAME/A record at your domain registrar.
3. No Supabase-side changes are needed for a custom domain, but if you tighten CORS/redirect settings later, add the new domain under **Supabase → Authentication → URL Configuration → Redirect URLs**.

---

## 7. Project structure

```
src/
  app/
    login/                  Public OTP login page
    (dashboard)/            Protected route group (server-checks auth + admin)
      dashboard/            Main dashboard
      members/              Member list + [id] profile page
      attendance/           Daily entry system
      fees/                 Monthly fee record
      reminders/            Due soon / overdue reminders
      reports/              Monthly reports + CSV export
      settings/             Gym & admin settings
  components/
    ui/                     Button, Card, Modal, Field, StatusBadge, EmptyState, Toast, ConfirmDialog
    layout/                 Sidebar (desktop), BottomNav (mobile), Footer, TopBar
    members/                MemberCard, MemberForm
    attendance/             AttendanceList, MarkEntryModal
    fees/                   FeeTable, RecordPaymentModal
    dashboard/              StatsCard, ReminderList, RecentPayments
  hooks/                    useMembers, useAttendance, usePayments, useSettings (all talk to Supabase)
  lib/
    supabase/               Browser + server Supabase clients
    feeLogic.ts             Due-date math, fee status classification, formatting
    whatsapp.ts             wa.me reminder link builder
    csv.ts                  CSV export helper
    types.ts                Shared TypeScript types
  middleware.ts             Route protection + session refresh
supabase/
  schema.sql                Tables, indexes, triggers, RLS policies
  demo_data.sql             Optional, clearly-labelled dev-only seed data
```

---

## 8. Security notes

- The Supabase **anon** key is safe to expose in the frontend by design — it has no power on its own. All actual access control happens via **Row Level Security** policies in `schema.sql`, which check the authenticated user's phone number against the `admins` table on every single query.
- No database credentials, service-role keys, or SMS provider secrets ever appear in frontend code. The service-role key is never used by this app at all.
- Destructive actions require explicit confirmation (`ConfirmDialog`), and removing a member defaults to a safe "Left Gym" status rather than deletion, preserving attendance/payment history. A true permanent delete is a second, separate confirmation only available for members already marked "Left Gym".
- `middleware.ts` redirects unauthenticated requests away from every route except `/login`, and the dashboard layout re-checks admin status server-side before rendering anything.

---

## 9. Manual test checklist

Run through this after setup and after any changes:

1. Log in with OTP (real SMS arrives, verifies, lands on dashboard).
2. Add a new member — appears in Members list and on Dashboard stats.
3. Edit that member's fee/due date — updates everywhere it's shown.
4. Mark a gym entry for the member — appears in Today's Entries and their profile's Attendance tab.
5. Record a fee payment — appears in Payments/Fee History, dashboard "Recent Payments", and the member drops out of due/overdue reminders with a new due date.
6. Check Due Soon / Overdue badges update correctly relative to today's date.
7. Search for the member by name, phone, and member ID — all three should find them.
8. Use "Remove" on a member — confirm dialog appears, member moves to Left Gym, history remains visible on their profile.
9. Log out, log back in — all data (members, payments, attendance) is exactly as left.
10. Resize the browser / open on a phone — bottom nav appears on mobile, sidebar on desktop, no horizontal scrolling.
11. Export a CSV from Reports and open it in a spreadsheet app to confirm the data matches.

---

## 10. Support / next steps

If you add a second gym location or a second admin, just insert another row into the `admins` table — everything else works unchanged. If SMS OTP costs become a concern at scale, Supabase also supports email OTP as an alternative sign-in method with a small code change to the login page.

© All Rights Reserved by Pramit Kumar
