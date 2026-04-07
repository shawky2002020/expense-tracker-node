# 📊 Personal Finance API - Backend System

> A modular REST API for personal finance management with JWT authentication, budget alerts, recurring transactions, and analytics.

---

## 🏗️ System Overview

| Module | Owner | Core Responsibility |
|--------|-------|---------------------|
| **Auth & Security** | Shawky Ahmad Shawky | JWT authentication, role-based access (admin/user) |
| **Transactions** | Member 2 | CRUD operations, filtering, pagination, validation schemas |
| **Categories & Goals** | Member 3 | Category management, savings goals with progress tracking |
| **Budget & Recurring** | Member 4 | Budget alerts, cron jobs for recurring transactions |
| **Analytics** | Member 5 | Spending aggregation, trends, CSV/PDF export |

---

## 🚀 Key API Endpoints

```bash
# Auth
POST   /api/auth/register
POST   /api/auth/login

# Transactions
GET    /api/transactions?type=expense&startDate=&page=
POST   /api/transactions

# Budgets
GET    /api/budgets/check-alerts
POST   /api/budgets

# Analytics
GET    /api/analytics/monthly-spending?year=&month=
GET    /api/analytics/summary
GET    /api/analytics/export/csv

# Categories (admin only)
POST   /api/categories

# Goals
GET    /api/goals/progress/:id
PATCH  /api/goals/:id
```

---

## 📁 Project Structure (MVC)

```
├── models/          # User, Transaction, Category, Goal, Budget
├── controllers/     # Business logic per module
├── routes/          # API endpoints
├── middlewares/     # Auth, role, validation, ownership
├── validations/     # Joi/Zod schemas 
├── services/        # Alert, recurring, analytics logic
├── utils/           # Pagination, filters, date helpers
└── jobs/            # Cron job for recurring transactions
```

---

## ✅ Success Criteria

- [x] All routes protected by JWT
- [x] Admin-only user & category management
- [x] Users access only their own data
- [x] Budget alerts trigger on exceeded limits
- [x] Recurring transactions auto-create daily
- [x] Analytics return accurate aggregations

---

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Joi/Zod (validation)
- node-cron (recurring jobs)

---

## 👥 Team

| Member | Module | Deliverables |
|--------|--------|--------------|
| Shawky Ahmad Shawky | Auth & Security | JWT, user management, role middleware |
| 2 | Transactions | CRUD, pagination, validation schemas |
| 3 | Categories & Goals | Category CRUD, goal progress tracking |
| 4 | Budget & Recurring | Budget alerts, cron jobs |
| 5 | Analytics | Aggregations, trends, CSV export |
