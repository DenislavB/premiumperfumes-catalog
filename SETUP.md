# Premium Perfumes — Setup Guide

## 1. Database (Neon — free PostgreSQL for Vercel)

1. Go to [neon.tech](https://neon.tech) → create a free project
2. Copy the connection string (it looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
3. Paste it into `.env.local` as both `DATABASE_URL` and `DIRECT_URL`

## 2. Environment variables (`.env.local`)

```
DATABASE_URL="postgresql://..."       ← from Neon
DIRECT_URL="postgresql://..."         ← same as above

ADMIN_USERNAME="your-username"        ← choose any
ADMIN_PASSWORD="your-strong-password" ← choose any
SESSION_SECRET="at-least-32-random-chars-here"
```

Generate a session secret (run once in terminal):
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Push database schema

```bash
npx prisma db push
```

## 4. Run locally

```bash
npm run dev
```

- **Catalog**: http://localhost:3000  (redirects to /bg by default)
- **Admin panel**: http://localhost:3000/admin

## 5. Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import into [vercel.com](https://vercel.com)
3. Add the same env vars in Vercel → Project → Settings → Environment Variables
4. Deploy — done!

## Admin panel features

- **Products tab**: Add, edit, delete products. Toggle availability on/off.
- **Requests tab**: View purchase requests with customer details. Change status (New → Contacted → Fulfilled).

## Adding products

Each product has:
- Name in English and Bulgarian
- Brand, Volume, Gender (Men/Women/Unisex)
- Price in BGN, optional original price (shows as strikethrough)
- Quantity (shown as available stock)
- Images (paste URLs — you can use Cloudinary, ImgBB, or any image host)
- Featured flag (shows ★ badge and appears first)
- Promotion flag + discount percentage (shows -X% badge and gold offer text)
- Available toggle (hides from catalog without deleting)
