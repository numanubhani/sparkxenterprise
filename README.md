# SPARK X Technology — MERN website

Enterprise AI infrastructure sourcing site (GPUs, servers, networking, data center).

| Part | Stack | Folder | Deploy to |
| --- | --- | --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS + React Router | `frontend/` | Vercel (project #1) |
| Backend | Node.js + Express + Mongoose | `backend/` | Vercel serverless (project #2) |
| Database | MongoDB Atlas | — | MongoDB Atlas (free tier) |

## Run locally

Requirements: Node.js 18+ and a MongoDB connection string (MongoDB Atlas free cluster or local MongoDB).

```bash
# 1. Backend  (terminal 1)
cd backend
cp .env.example .env        # then edit MONGODB_URI (and SMTP_* if you want emails)
npm install
npm run seed                # optional: inserts starter products
npm run dev                 # -> http://localhost:5000/api/health

# 2. Frontend (terminal 2)
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # -> http://localhost:5173
```

On Windows PowerShell use `copy .env.example .env` instead of `cp`.

All pages work without the backend. Submitting the forms (quote cart, inquiry, request a call) needs the backend running.

## Pages

| URL | Page |
| --- | --- |
| `/` | Home |
| `/products`, `/products/:slug` | Catalog (filters, grid/list, search) and product detail |
| `/quote` | Quote cart and request form |
| `/account` | Saved products and cart summary (stored on the device) |
| `/solutions/*` | AI & ML, HPC, GPU Servers, Data Center, Networking & Storage, Custom Sourcing |
| `/company/*` | About, Global Sourcing & Trade, Compliance & KYB, Contact (inquiry + request/schedule a call) |
| `/resources/*` | How It Works, How to Order, Lead Times, Export & Import, KYB Verification, FAQ |

| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | Customer authentication |
| `/account/*` | Dashboard, My Requests, My Quotes (approve online), Saved Products, Company Profile, KYB & Compliance, Account Settings |
| `/admin/*` | Admin dashboard: overview, requests (status, supplier cost, internal notes, lead times, quote builder, send quote), users & KYB review |

## Accounts & admin

- Set `JWT_SECRET`, `APP_URL` and `ADMIN_EMAILS` in `backend/.env` (see `.env.example`).
- Anyone who registers with an email listed in `ADMIN_EMAILS` becomes an admin. To promote an existing user: `npm run make-admin -- someone@company.com`.
- Without SMTP settings, emails (verification links, password resets, quotes) are printed in the backend terminal so you can still click the links while developing.
- Guest requests are linked to an account automatically once the customer verifies an email address that matches.
- Supplier costs, supplier references, internal notes and staff names are never sent to customers.

- Product catalog data: `frontend/src/data/products.js` (also used by `npm run seed` in the backend)
- Text for the Solutions/Company/Resources pages: `frontend/src/data/pages.js`

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/inquiries` | Quote request / general inquiry / callback request. Returns `{ requestId }` and emails the admin |
| GET | `/api/products` | Product list (`?category=`, `?featured=true`) |
| GET | `/api/products/:slug` | Single product |

## Deploy to Vercel

Create **two Vercel projects** from the same Git repo:

1. **Backend**: set Root Directory to `backend`. Add env vars from `backend/.env.example`
   (`MONGODB_URI`, `CORS_ORIGINS`, `ADMIN_NOTIFY_EMAIL`, `SMTP_*`). `vercel.json` routes every request to `api/index.js`.
   In MongoDB Atlas → Network Access, allow `0.0.0.0/0`, because Vercel has no fixed IPs.
2. **Frontend**: set Root Directory to `frontend`. Vercel picks the Vite preset automatically. Add env var
   `VITE_API_URL=https://<your-backend>.vercel.app`, or `https://api.yourdomain.com` once you add a domain.

### Custom domain

- Frontend project → Settings → Domains → add `yourdomain.com` and `www.yourdomain.com`.
- Backend project → Settings → Domains → add `api.yourdomain.com`.
- Add the DNS records Vercel shows you (A / CNAME) at your domain registrar.
- Update `CORS_ORIGINS` on the backend and `VITE_API_URL` on the frontend, then redeploy both.

## Project structure

```
backend/
  api/index.js          Vercel entry
  src/app.js            Express app (CORS, helmet, rate limit, routes)
  src/server.js         Local dev server
  src/config/db.js      Cached Mongo connection (serverless-safe)
  src/models/           Inquiry, Product
  src/routes/           inquiries, products
  src/utils/mailer.js   Admin + customer email notifications
frontend/
  public/images/        Images cropped from the approved mockups
  src/components/layout TopBar, Header (dropdown menus), Footer
  src/components/home   Home page sections
  src/pages/            Home, Quote, ComingSoon (placeholder for pages not built yet)
  src/data/nav.js       Menu + footer links (URLs from the navigation spec)
```
