# Using Supabase with KS Booking

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Pick an organization (or create one), choose a **name** and **database password**. Save the password—you’ll need it for the connection string.
4. Choose a **region** and click **Create new project**. Wait until the project is ready.

## 2. Get your connection string

1. In the project dashboard, open **Project Settings** (gear icon in the sidebar).
2. Go to **Database**.
3. Under **Connection string**, choose **URI**.
4. For Next.js (serverless), use **Transaction** mode (recommended):
   - Select the **Transaction** tab.
   - Copy the connection string. It will look like:
     ```text
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with the database password you set when creating the project.

Alternatively, use the **Connect** button on the project home and pick **Transaction** mode, then copy the URI.

**Important:** Do **not** use the "Direct" connection string (`db.xxx.supabase.co:5432`) from the Supabase dashboard—it often fails with "Can't reach database server" on networks without IPv6. Always use the **Transaction** (or **Session**) pooler URL: host `aws-0-REGION.pooler.supabase.com`, port **6543** for Transaction.

1. In the project root, copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set `DATABASE_URL` to the Supabase connection string you copied (with your real password):
   ```env
   DATABASE_URL=postgresql://postgres.PROJECT_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```
   If you see SSL/certificate errors, add:
   ```env
   DATABASE_SSL=true
   ```

## 4. Run migrations

From the project root:

```bash
npx prisma migrate deploy
```

This creates the tables in your Supabase Postgres database.

## 5. Run the app

```bash
npm run dev
```

The app will use your Supabase database. You can inspect and edit data in the Supabase dashboard under **Table Editor**.

---

**Troubleshooting: "Can't reach database server" (P1001)**  
- Use the **Transaction** pooler URL (see above), not the Direct one.  
- Add these query parameters to the end of `DATABASE_URL`: **`?sslmode=require&pgbouncer=true`**  
  Example: `...6543/postgres?sslmode=require&pgbouncer=true`  
- If your password contains special characters, URL-encode them (e.g. `@` → `%40`, `#` → `%23`).  
- Ensure the Supabase project is **not paused** (dashboard → project status).  
- Try disabling VPN or testing from another network (e.g. mobile hotspot).

### When both Transaction and Session mode fail (P1001)

If your network blocks outbound connections to Supabase (e.g. corporate firewall, ISP, or region), you can create the database tables **from inside Supabase** using the SQL Editor (it runs on Supabase’s side, so it doesn’t use your network):

1. In the Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file **`prisma/migrations/manual-supabase-apply.sql`** in your project and copy its full contents.
4. Paste into the SQL Editor and click **Run** (or press Ctrl+Enter).
5. Confirm there are no errors. You should see “Success. No rows returned” or similar. The app tables and Prisma’s migration history will be created.
6. Your app can now use the same `DATABASE_URL` in `.env`; at runtime (e.g. `npm run dev` or Vercel) the connection often works even when the Prisma CLI from your machine cannot reach the DB.

If you already created the tables in a previous run and only need to fix migration history, run only the last part of the script (from `CREATE TABLE IF NOT EXISTS "_prisma_migrations"` to the end).

---

**Summary**

| Step | Action |
|------|--------|
| 1 | Create project at [supabase.com](https://supabase.com), save DB password |
| 2 | **Database** → **Connection string** → **Transaction** → copy URI |
| 3 | Put URI in `.env` as `DATABASE_URL` (replace `[YOUR-PASSWORD]`) |
| 4 | Run `npx prisma migrate deploy` |
| 5 | Run `npm run dev` |
