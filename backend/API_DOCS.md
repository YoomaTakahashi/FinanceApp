# FinanceApp REST API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <accessToken>` header.

---

## Authentication

| Method | Endpoint              | Description           | Auth |
|--------|-----------------------|-----------------------|------|
| POST   | /auth/register        | Register new user     | No   |
| POST   | /auth/login           | Login                 | No   |
| POST   | /auth/refresh         | Refresh access token  | No   |
| POST   | /auth/logout          | Logout                | Yes  |
| POST   | /auth/logout-all      | Logout all devices    | Yes  |
| GET    | /auth/me              | Get current user      | Yes  |
| PUT    | /auth/profile         | Update profile        | Yes  |
| PUT    | /auth/change-password | Change password       | Yes  |

### POST /auth/register
```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }
```

### POST /auth/login
```json
{ "email": "john@example.com", "password": "password123", "rememberMe": false }
```
Response: `{ data: { user, accessToken, refreshToken } }`

### POST /auth/refresh
```json
{ "refreshToken": "..." }
```

---

## Transactions

| Method | Endpoint                    | Description              | Auth |
|--------|-----------------------------|--------------------------|------|
| GET    | /transactions               | List (paginated/filtered)| Yes  |
| GET    | /transactions/:id           | Get single               | Yes  |
| POST   | /transactions               | Create                   | Yes  |
| PUT    | /transactions/:id           | Update                   | Yes  |
| DELETE | /transactions/:id           | Soft delete              | Yes  |
| POST   | /transactions/:id/restore   | Restore deleted          | Yes  |
| POST   | /transactions/:id/duplicate | Duplicate                | Yes  |
| POST   | /transactions/:id/slip      | Upload receipt           | Yes  |
| DELETE | /transactions/:id/slip      | Remove receipt           | Yes  |

### Query params for GET /transactions
- `page`, `limit` — pagination
- `type` — `income` | `expense`
- `category_id` — filter by category
- `status` — `completed` | `pending` | `cancelled`
- `search` — search title/description/note
- `date_from`, `date_to` — date range
- `sort` — `transaction_date` | `amount` | `created_at` | `title`
- `order` — `ASC` | `DESC`

### Transaction Body
```json
{
  "title": "Grocery Shopping",
  "description": "Weekly groceries",
  "amount": 150.50,
  "type": "expense",
  "category_id": 7,
  "transaction_date": "2025-07-05",
  "transaction_time": "14:30:00",
  "payment_method": "card",
  "note": "Paid at Walmart",
  "status": "completed"
}
```
For slip upload, use `multipart/form-data` with `slip` file field.

---

## Categories

| Method | Endpoint          | Description   | Auth |
|--------|-------------------|---------------|------|
| GET    | /categories       | List all      | Yes  |
| GET    | /categories/:id   | Get single    | Yes  |
| POST   | /categories       | Create custom | Yes  |
| PUT    | /categories/:id   | Update custom | Yes  |
| DELETE | /categories/:id   | Delete custom | Yes  |

### Category Body
```json
{ "name": "Gym", "type": "expense", "icon": "mdi-dumbbell", "color": "#4CAF50" }
```

---

## Dashboard

| Method | Endpoint                          | Description          | Auth |
|--------|-----------------------------------|----------------------|------|
| GET    | /dashboard/summary                | Balance & totals     | Yes  |
| GET    | /dashboard/chart/monthly?year=... | Monthly chart data   | Yes  |
| GET    | /dashboard/chart/weekly           | Weekly chart data    | Yes  |
| GET    | /dashboard/top-categories         | Top spending cats    | Yes  |
| GET    | /dashboard/recent-transactions    | Last N transactions  | Yes  |

---

## Notifications

| Method | Endpoint                       | Description       | Auth |
|--------|--------------------------------|-------------------|------|
| GET    | /notifications                 | List              | Yes  |
| GET    | /notifications/unread-count    | Unread count      | Yes  |
| PUT    | /notifications/:id/read        | Mark single read  | Yes  |
| PUT    | /notifications/mark-all-read   | Mark all read     | Yes  |
| DELETE | /notifications/:id             | Delete            | Yes  |

---

## Reports

| Method | Endpoint                         | Description    | Auth |
|--------|----------------------------------|----------------|------|
| GET    | /reports/weekly?date=YYYY-MM-DD  | Weekly report  | Yes  |
| GET    | /reports/monthly?year=&month=    | Monthly report | Yes  |
| GET    | /reports/yearly?year=            | Yearly report  | Yes  |

---

## Settings

| Method | Endpoint   | Description      | Auth |
|--------|------------|------------------|------|
| GET    | /settings  | Get settings     | Yes  |
| PUT    | /settings  | Update settings  | Yes  |

---

## Response Format

### Success
```json
{ "success": true, "data": { ... } }
```

### Paginated
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 150, "page": 1, "limit": 20, "totalPages": 8, "hasNext": true, "hasPrev": false }
}
```

### Error
```json
{ "success": false, "message": "Error description" }
```

## HTTP Status Codes
- `200` — Success
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `409` — Conflict (duplicate)
- `422` — Validation Error
- `429` — Rate Limited
- `500` — Server Error
