# 📊 Personal Finance API - Backend System

> A modular REST API for personal finance management with JWT authentication, budget alerts, recurring transactions, and analytics.

---

## 🏗️ System Overview

| Module | Owner | Core Responsibility |
|--------|-------|---------------------|
| **Auth & Security** | Shawky Ahmad Shawky | JWT authentication, role-based access (admin/user) |
| **Transactions** | Moamen Alaa Soltan | CRUD operations, filtering, pagination, validation schemas |
| **Categories & Goals** | Mazen Raafat Abdelhameed | Category management, savings goals with progress tracking |
| **Budget & Recurring** | Hassan Abdelhamed Hassan | Budget alerts, cron jobs for recurring transactions |
| **Analytics** | Hassan Muhammad | Spending aggregation, trends, CSV export |
| **Documentation & Logs** | Global | Swagger API documentation, Winston audit logging, pagination utilities |

---

## 🚀 Key API Endpoints

```bash
# Auth
POST   /api/auth/register
POST   /api/auth/login

# Transactions
GET    /api/transactions?type=expense&startDate=&page=
POST   /api/transactions

# Users (admin only)
GET    /api/users?page=&limit=

# Budgets
GET    /api/budgets/alerts
POST   /api/budgets

# Analytics
GET    /api/analytics/monthly-spending?year=&month=
GET    /api/analytics/summary
GET    /api/analytics/export/csv

# Categories
GET    /api/categories?page=&limit=
POST   /api/categories (admin only)

# Goals
GET    /api/goals?page=&limit=
GET    /api/goals/progress/:id
PATCH  /api/goals/:id
# API Documentation
GET    /api-docs   # Swagger documentation interface
```

---

## 📚 API Documentation

This project uses comprehensive **Swagger OpenAPI v3** documentation. 
Once the server gets started, navigate to `/api-docs` to access a fully interactive web dashboard. It lists all components, request schemas, and responses. **Bearer Authentication** is fully supported out of the box directly in the dashboard UI!

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
- [x] **Rate Limiting** prevents abuse and API spamming
- [x] **Audit Logging** with Winston traces major feature modifications inside `logs/audit.log`
- [x] **Global Pagination** applied across standard GET queries

---

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Joi/Zod (validation)
- node-cron (recurring jobs)
- winston (Audit Logging)
- swagger-ui-express & yamljs (API Documentation)
- express-rate-limit (Security)

---

## 👥 Team

| Member | Module | Deliverables |
|--------|--------|--------------|
| Shawky Ahmad Shawky | Auth & Security | JWT, user management, role middleware |
| Moamen Alaa Soltan | Transactions |Transactions CRUD, validation schemas , Postman collection |
| Mazen Raafat Abdelhameed | Categories & Goals | Category CRUD, goal progress tracking |
| Hassan Abdelhamed Hassan | Budget & Recurring | Budget alerts, cron jobs |
| Hassan Muhammad | Analytics | Aggregations, trends, CSV export |
