# FinanceApp — Personal Finance Manager

A production-ready full-stack personal finance application with Luxury Black & Gold theme.

## Project Structure

```
pr/
├── frontend/    ← Nuxt.js 3 (Vue 3 + Vuetify)
├── backend/     ← Node.js + Express REST API
└── README.md
```

## Quick Start

### 1. Database Setup
Import `backend/database/schema.sql` into MySQL using DBeaver or CLI:
```sql
source backend/database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
npm run dev
```
API runs on: http://localhost:5000

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App runs on: http://localhost:3000

## Deployment

### Frontend → Vercel
1. In the Vercel project settings, set **Root Directory** to `frontend`.
2. `frontend/vercel.json` pins the build: `npm run generate` with output `.output/public` (static SPA + fallback rewrite). No dashboard build overrides needed.
3. Set the environment variable (Production **and** Preview):
   - `NUXT_PUBLIC_API_BASE=https://<your-backend>.up.railway.app/api`
4. Redeploy after changing env vars — the value is baked in at build time (`ssr: false`).

### Backend → Railway
1. Set the service **Root Directory** to `backend` (start command: `npm start`).
2. Add a MySQL database and set the environment variables:
   - `MYSQL_URL` — reference Railway's MySQL variable (`${{MySQL.MYSQL_URL}}`); takes precedence over the discrete `DB_*` vars
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — strong random values
   - `FRONTEND_URL` — your Vercel URL(s), comma-separated for previews, e.g. `https://your-app.vercel.app`
   - `NODE_ENV=production`
3. Run the schema once against the Railway MySQL instance: `backend/database/schema.sql`.
4. Note: uploaded slips/avatars are stored on the service filesystem, which is ephemeral on Railway — attach a volume mounted at `/app/uploads` to persist them.

## Tech Stack
- **Frontend**: Nuxt.js 3, Vue 3, Vuetify 3, Pinia, Chart.js, Axios
- **Backend**: Node.js, Express.js, MySQL, JWT, bcrypt, Helmet
- **Database**: MySQL 8+ with normalized schema

## Features
- JWT Authentication (access + refresh tokens)
- Income & Expense transactions with receipt upload
- Custom categories with color/icon picker
- Dashboard with animated charts
- Weekly/Monthly/Yearly reports with CSV export
- Notification system
- Profile management with avatar
- Dark/Light theme
- Fully responsive (mobile → desktop)
