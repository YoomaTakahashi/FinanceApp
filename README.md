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
