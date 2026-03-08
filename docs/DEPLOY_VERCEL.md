# Deploy KS Booking to Vercel

Follow these steps to deploy your choir booking app so it can reach Supabase and work end-to-end.

---

## 1. Push your code to GitHub

If the project isn’t in a Git repo yet:

```bash
cd choir-site
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [GitHub](https://github.com/new) (e.g. `ks-booking`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ks-booking.git
git branch -M main
git push -u origin main
```

If the repo already exists, just make sure your latest code is pushed:

```bash
git add .
git commit -m "Prepare for deploy"
git push
```

---

## 2. Create a Vercel account and import the project

1. Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub” so Vercel can see your repos).
2. Click **Add New…** → **Project**.
3. Find your repo (e.g. `ks-booking`) and click **Import**.
4. **Root Directory:** If the Next.js app is inside a folder (e.g. `choir-site`), set **Root Directory** to `choir-site` and click **Edit** to confirm. If the app is at the repo root, leave it blank.
5. Do **not** click Deploy yet—add environment variables first.

---

## 3. Add environment variables

Before the first deploy, add the same variables you use in `.env` locally.

1. In the import screen, expand **Environment Variables**.
2. Add each variable (name and value). Use **Production**, **Preview**, and **Development** so all environments work.

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | Your Supabase connection string | Use the **Transaction** pooler URL ending with `?sslmode=require&pgbouncer=true` |
| `ADMIN_EMAIL` | Your admin login email | e.g. `koroseraphim@gmail.com` |
| `ADMIN_PASSWORD` | Your admin login password | Strong password; only you need to know it |
| `DATABASE_SSL` | `true` | Optional; use if you see SSL errors |

If you use PayMongo or Stripe, add:

| Name | Value |
|------|--------|
| `PAYMONGO_SECRET_KEY` | Your PayMongo secret key (e.g. `sk_test_...` or `sk_live_...`) |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (if using Stripe) |

**Important:** Use the **exact** `DATABASE_URL` from Supabase (Transaction mode, with your real password). No spaces or quotes around the value.

---

## 4. Deploy

1. Click **Deploy**.
2. Wait for the build to finish (usually 1–2 minutes). If the build fails, check the build log for errors.
3. When it’s done, Vercel shows a **Visit** link (e.g. `https://ks-booking-xxx.vercel.app`).

---

## 5. Ensure the database is ready

Your Supabase database must have the app tables.

- If you already ran **`prisma/migrations/manual-supabase-apply.sql`** in the Supabase SQL Editor, you’re set.
- If not, open [Supabase](https://supabase.com) → your project → **SQL Editor**, paste the contents of **`prisma/migrations/manual-supabase-apply.sql`**, and run it once.

No need to run `prisma migrate deploy` from your machine for the first deploy if you used the manual SQL.

---

## 6. Test the deployed app

1. Open the **Visit** URL from Vercel.
2. **Booking:** Go to `/book`, pick a date, fill the form, and submit (e.g. “Pay later”). You should get a success page and see the booking in Supabase **Table Editor**.
3. **Admin:** Go to `https://your-app.vercel.app/admin` (or `/admin/login`). Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The first successful login creates the admin user in Supabase.

If anything fails, check **Vercel → Project → Logs** and **Supabase → Logs** for errors.

---

## 7. (Optional) Custom domain

In Vercel: **Project → Settings → Domains**, add your domain and follow the DNS instructions.

---

## Summary checklist

| Step | Action |
|------|--------|
| 1 | Push code to GitHub |
| 2 | Vercel → Add New → Project → Import repo, set root to `choir-site` if needed |
| 3 | Add `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (and optional `DATABASE_SSL`, PayMongo/Stripe keys) |
| 4 | Click Deploy |
| 5 | Run `manual-supabase-apply.sql` in Supabase if you haven’t already |
| 6 | Test booking and admin login on the Vercel URL |
