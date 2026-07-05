# Installation & Setup Guide

## Prerequisites
- Node.js v18+ (v24 recommended)
- MySQL 8.0+
- npm v9+
- DBeaver or MySQL Workbench (optional, for DB management)

---

## Step 1 — Database Setup

1. Open DBeaver and connect to your MySQL server
2. Open a new SQL editor
3. Run the schema file:
   ```
   backend/database/schema.sql
   ```
   This creates the `finance_db` database with all tables and default categories.

---

## Step 2 — Backend Setup

```bash
cd backend

# Copy the environment template
copy .env.example .env    # Windows
# cp .env.example .env   # Mac/Linux

# Edit .env with your MySQL credentials:
#   DB_PASSWORD=your_mysql_password
#   DB_USER=root
#   DB_NAME=finance_db

# Install dependencies
npm install

# Start the development server
npm run dev
```

The API will run on: **http://localhost:5000**

Verify: Open http://localhost:5000/api/health

---

## Step 3 — Frontend Setup

```bash
cd frontend

# Copy the environment template
copy .env.example .env    # Windows

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will run on: **http://localhost:3000**

---

## Environment Variables

### backend/.env
| Variable              | Description                    | Default         |
|-----------------------|--------------------------------|-----------------|
| PORT                  | API server port                | 5000            |
| DB_HOST               | MySQL host                     | localhost       |
| DB_PORT               | MySQL port                     | 3306            |
| DB_USER               | MySQL username                 | root            |
| DB_PASSWORD           | MySQL password                 | root            |
| DB_NAME               | Database name                  | finance_db      |
| JWT_SECRET            | JWT signing secret             | (change this!)  |
| JWT_EXPIRES_IN        | Access token expiry            | 15m             |
| JWT_REFRESH_SECRET    | Refresh token secret           | (change this!)  |
| JWT_REFRESH_EXPIRES_IN| Refresh token expiry           | 7d              |
| FRONTEND_URL          | Allowed CORS origin            | http://localhost:3000 |

### frontend/.env
| Variable    | Description            | Default                      |
|-------------|------------------------|------------------------------|
| API_BASE_URL| Backend API base URL   | http://localhost:5000/api    |

---

## Production Deployment

### Backend
```bash
cd backend
NODE_ENV=production node app.js
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
# OR deploy .output/ to your hosting
```

---

## Project Structure

```
pr/
├── backend/
│   ├── app.js              ← Express entry point
│   ├── config/
│   │   ├── database.js     ← MySQL pool
│   │   └── jwt.js          ← JWT helpers
│   ├── controllers/        ← Request handlers
│   ├── middlewares/        ← Auth, upload, rate-limit
│   ├── routes/             ← API route definitions
│   ├── services/           ← Business logic
│   ├── utils/              ← Logger, helpers
│   ├── uploads/
│   │   ├── slips/          ← Payment slip images
│   │   └── avatars/        ← User avatar images
│   └── database/
│       └── schema.sql      ← Database schema + seed data
│
└── frontend/
    ├── pages/              ← App routes (Nuxt file-based routing)
    ├── components/         ← Reusable Vue components
    ├── layouts/            ← Default & auth layouts
    ├── stores/             ← Pinia state management
    ├── composables/        ← Shared logic (useApi, useFormatters)
    ├── middleware/         ← Route guards
    ├── plugins/            ← Toast, dayjs plugins
    ├── assets/styles/      ← Global SCSS
    └── public/             ← Static files
```

---

## Default Test Credentials
After registering, you can use any email/password combination you create.
No pre-seeded users (register on the Register page).

---

## Troubleshooting

**"Database connection failed"**
- Check your DB_PASSWORD in backend/.env
- Ensure MySQL is running on the correct port
- Verify the `finance_db` database exists (run schema.sql again)

**"CORS error"**
- Ensure FRONTEND_URL in backend/.env matches your frontend URL exactly

**"401 Unauthorized"**
- Token may have expired — the frontend auto-refreshes tokens, but check if the refresh token is still valid (7 days by default)

**Frontend build fails**
- Delete `node_modules/` and `frontend/.nuxt/` then run `npm install` again
