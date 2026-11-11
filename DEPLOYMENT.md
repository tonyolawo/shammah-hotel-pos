# Deployment Guide — Shammah Hotel POS (Vercel)

Follow these steps to deploy the app for online testing with live PostgreSQL and authentication:

---

### Step 1: Create a Free Hosted PostgreSQL Database
You can get a free, instant serverless PostgreSQL connection string from either:
- **[Neon.tech](https://neon.tech)** (Recommended — 30-second setup, generous free tier)
- **[Supabase](https://supabase.com)**

1. Sign up on **Neon.tech** or **Supabase**.
2. Create a new project called `shammah-pos`.
3. Copy the pooled PostgreSQL connection string:
   ```
   postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Import & Deploy on Vercel
1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..." > "Project"**.
3. Select your repository: **`tonyolawo/shammah-hotel-pos`**.
4. In the **Configure Project** screen:
   * **Root Directory:** Click "Edit" and choose **`codebase`**.
   * **Framework Preset:** Next.js (detected automatically).
5. Open the **Environment Variables** section and add:
   * `DATABASE_URL`: *(Paste your PostgreSQL connection string from Step 1)*
   * `JWT_SECRET`: `shammah-hotel-pos-secure-jwt-key-2026`
   * `NEXT_PUBLIC_APP_URL`: *(Your Vercel URL, or leave blank to use the auto-generated one)*
6. Click **Deploy**.

---

### Step 3: Seed Initial Demo Users into the Cloud DB
Once the database is connected, push the schema and seed the initial users (`cashier@shammah.co.ke` and `finance@shammah.co.ke`):

In your local project terminal:
```bash
# Set your cloud database URL in codebase/.env, then run:
cd codebase
npx prisma db push
npx tsx prisma/seed.ts
```

Your app will be live with a shareable URL (e.g. `https://shammah-hotel-pos.vercel.app`)!
