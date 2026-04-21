# Digital Heroes Platform

Digital Heroes is a premium, full-stack subscription platform built for the modern web. It features a robust automated lottery draw system, intelligent Match-3/4/5 scoring mechanics with probabilistic weighting, Match-5 jackpot rollovers, user score management, and full Charity Directory CRUD integration. 

## 🚀 Tech Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Components, Server Actions)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom UI with Glassmorphism)
*   **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security)
*   **Payments:** [Stripe](https://stripe.com/) Checkout & Webhooks (Dual Tier: Monthly/Yearly)
*   **Validation:** [Zod](https://zod.dev/)

## ⚡ Core Features

### 1. Advanced Subscription Management
Users can purchase Monthly (£9.99/mo) or Yearly (£99/yr) plans processed entirely through Stripe Checkout. A secure cryptographic webhook ensures their database `sub_status` automatically switches to `active` upon payment success.

### 2. Algorithmic Draw Engine & Jackpots
The Admin Dashboard features a highly sophisticated Draw Simulator capable of two modes:
*   **True Random:** Cryptographically random generation (1-45).
*   **Algorithmic Weighting:** Automatically scans the entire database of user scores over the past 30 days to heavily weigh the top 3 most frequently played numbers, padding the final 2 with random numbers. 
*   **Jackpot Rollover:** If zero users hit a Match-5 in the previous month's draw, the system mathematically calculates and rolls 40% of the previous month's prize pool directly into the current month.

### 3. Charity Integration
Admins have full CRUD control over the Charity Directory. Users select a charity during onboarding and dictate the exact percentage (10% - 100%) of their subscription fee that gets donated directly to that cause.

### 4. Interactive User Dashboard
Active users have a beautifully designed dark-mode dashboard allowing them to:
*   Enter and manage their 5 unique rolling scores.
*   Review historical win records and Match metrics.
*   Submit validation proof for Match-4 and Match-5 claims directly to the Admin.

## 🛠 Local Setup

1.  **Clone the repository**
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:** Create a `.env.local` file at the root.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

    STRIPE_SECRET_KEY=your-stripe-secret-key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key
    STRIPE_WEBHOOK_SECRET=your-webhook-secret
    
    STRIPE_MONTHLY_PRICE_ID=your-monthly-price-id
    STRIPE_YEARLY_PRICE_ID=your-yearly-price-id
    
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🔒 Security
All API Routes and Server Actions are strictly protected using `supabase.auth.getUser()`, ensuring complete data privacy and unauthorized access prevention. The Next.js 14 Server Actions are type-checked rigorously using Zod validation schemas.
