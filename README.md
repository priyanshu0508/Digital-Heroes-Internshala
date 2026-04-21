# 🦸 Digital Heroes — Monthly Prize Draw Platform

A full-stack subscription web application where users subscribe, submit scores, and enter a monthly prize draw — with a portion of all subscriptions going to charity.

**Live Demo:** [digital-heroes-internshala.vercel.app](https://digital-heroes-internshala.vercel.app)

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Overview](#project-overview)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [User Guide](#user-guide)
- [Admin Guide](#admin-guide)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Next.js Server Actions |
| **Database** | Supabase (PostgreSQL + Auth) |
| **Payments** | Stripe (Subscriptions + Webhooks) |
| **Deployment** | Vercel |

---

## 📌 Project Overview

Digital Heroes is a monthly subscription lottery platform. Here is how it works end-to-end:

1. **Users sign up** and choose a subscription plan (Monthly £9.99 / Yearly £99.99).
2. **Stripe processes the payment** and a webhook marks the user as `active` in the database.
3. **Users visit their Dashboard** to submit golf scores (1–45) and choose a charity to donate to.
4. **Every month, the Admin** runs the Draw Engine to generate winning numbers and publish the draw.
5. **Winners are determined** by matching 3, 4, or 5 of their submitted scores against the winning numbers.
6. **Winners submit proof** and the Admin approves payouts directly from the dashboard.
7. **A portion of all subscriptions** goes to the user's chosen charity.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Stripe account (test mode)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/priyanshu0508/Digital-Heroes-Internshala.git
cd Digital-Heroes-Internshala

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env.local file in the root (see section below)

# 4. Run the development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Setting Up the Database
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Open **SQL Editor**
3. Paste and run the entire contents of `supabase/schema.sql`
4. This will create all tables, RLS policies, and seed the initial charities

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env.local` to GitHub.** It is already listed in `.gitignore`.

---

## 👤 User Guide

### 1. Sign Up
- Go to `/auth/signup`
- Enter your name, email, password, choose a charity, and set your donation percentage (10%–100%)

### 2. Subscribe
- After signing up you will be redirected to the Pricing page
- Choose **Monthly (£9.99/mo)** or **Yearly (£99.99/yr)**
- Complete checkout via Stripe (use test card `4242 4242 4242 4242` for testing)
- Your account becomes **Active** automatically once payment is confirmed

### 3. Dashboard
- Once active, visit `/dashboard`
- Submit your golf score for the month (a number between 1–45)
- View your current scores and which numbers you have entered
- See the current month's draw status

### 4. Winning
- If 3, 4, or 5 of your submitted scores match the monthly winning numbers, you win!
- You will be shown in the **Winners section** of your dashboard
- Upload your proof and submit a claim
- The Admin will approve your payout

### 5. Forgot Password
- Click "Forgot Password" on the login page
- Enter your email address
- Check your inbox for a reset link
- Set your new password (must include uppercase, lowercase, number, and special character)

---

## 🛡️ Admin Guide

### Accessing the Admin Dashboard
- Log in with the Admin account
- The **Admin** link will appear in the top navigation bar
- Go to `/admin`

> Only accounts with `is_admin = true` in the `profiles` table can access this page.

### 1. Running the Draw Engine
- In the **Draw Engine Interface** card, select a strategy:
  - **True Random** — Picks 5 completely random numbers (1–45)
  - **Algorithmic** — Biases the draw toward numbers that appear most frequently in user scores
- Click **Run Draw Simulation**
- A preview of the simulation results will appear (projected winners, prize pool, winning numbers)
- Click **Confirm & Publish Draw** to make it official
- The draw will appear in the **Recent Draws** table and winners will be recorded

> ℹ️ Only one draw can be published per month. Once published, the button shows "Current Month Draw Published!"

### 2. Charity Management (Full CRUD)
- **Add a charity**: Fill in the name and mission in the "Add New Charity" form, then click **Create Charity**
- **Delete a charity**: Click the **(X)** icon on any charity card
- Changes reflect immediately across the entire site (signup page, user dashboard dropdown)

### 3. Real-Time Analytics (Top Stats)
| Stat | What it shows |
|---|---|
| Active Subscribers | Users with `sub_status = active` |
| Supported Charities | Total charities in the database |
| Est. Prize Pool | 50% of (active subscribers × £9.99) |
| Current Draw Period | The current YYYY-MM month |

### 4. User Monitoring
- The **Recent User Signups** table at the bottom shows all registered users
- Columns: Name, Email, Plan, Donation %, Status, Joined Date

### 5. Pending Claims (Payout Approval)
- When a winner submits their prize proof from the dashboard, it appears under **Pending Claims**
- Click **Approve** to mark as paid (triggers a notification email)
- Click **Reject** if the proof is invalid

### Setting a User as Admin
To grant admin access to a user:
1. Go to your Supabase Dashboard → Table Editor → `profiles`
2. Find the user's row
3. Set `is_admin` to `true`
4. Save — they will see the Admin link immediately on next page load

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extended user data (subscription, charity, admin flag) |
| `charities` | Supported charities (managed by Admin) |
| `scores` | User-submitted golf scores (max 5 rolling per user) |
| `draws` | Published monthly draws with winning numbers |
| `winners` | Users who matched 3+ numbers in a draw |

Full schema is in `supabase/schema.sql`.

---

## ☁️ Deployment

This project is deployed on **Vercel** and connected to the GitHub repository. Every push to `main` triggers an automatic redeployment.

### To deploy your own instance:
1. Fork this repository
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your forked GitHub repository
4. Add all environment variables in Vercel → Project Settings → Environment Variables
5. Set up a Stripe Webhook pointing to `https://your-domain.vercel.app/api/stripe/webhook`
6. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

---

## 📄 License

MIT License — See `LICENSE` file for details.

---

*Built for the Digital Heroes Internshala Internship Challenge.*
