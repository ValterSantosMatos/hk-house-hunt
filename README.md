# House Hunt HK

Discovery Bay property tracker for finding good deals. Rate properties with your partner, compare picks, and track the market.

## Stack

- **Next.js 14** (App Router)
- **Vercel Postgres** (Neon)
- **Tailwind CSS**
- **jose** for JWT auth

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. In Vercel project settings → Storage → Create a **Postgres** database
4. Add these environment variables:
   - `AUTH_PASSWORD` — shared password for you and your partner
   - `JWT_SECRET` — run `openssl rand -base64 32` to generate
5. Deploy, then visit `/login`
6. After logging in, click **Seed Database** to populate properties

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your Vercel Postgres credentials and auth vars
npm run dev
```

## How It Works

- **Login** with your name + shared password
- **Rate** properties: 👍 Like, 👎 Dislike, ⭐ Star
- **Filter** by deal score, status, or your ratings
- See your **partner's ratings** on each card
- **"Both Like"** filter shows properties you both starred/liked
