# 🧪 API Manual Testing Guide — Recurring Transactions & Budget Module

> **Base URL**: `http://localhost:3000/api`
> **Auth**: All endpoints require `Authorization: Bearer <token>` header

---

## 📋 Table of Contents

1. [Setup (Register & Login)](#0-setup)
2. [Create Category](#1-create-category)
3. [Recurring Transactions](#2-recurring-transactions)
4. [Budget CRUD](#3-budget-crud)
5. [Budget Alerts](#4-budget-alerts)
6. [Cleanup](#5-cleanup)

---

## 0. Setup

### 0.1 Register a User

```
POST /api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "Test123456",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJI..."
  }
}
```

> ⚠️ **Copy the `token` value** — you will use it as `Bearer <token>` in all next requests.

---

### 0.2 Login (if already registered)

```
POST /api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "identifier": "testuser@example.com",
  "password": "Test123456"
}
```

**Expected:** `200 OK` — copy the token.

---

## 1. Create Category

> You need at least one **expense** category before creating budgets or recurring expense transactions.

### 1.1 Create Expense Category

```
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Food",
  "type": "expense",
  "description": "Food and groceries"
}
```

**Expected:** `201 Created`
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "_id": "661234abc...",
      "name": "Food",
      "type": "expense"
    }
  }
}
```

> ⚠️ **Copy the `_id`** — you will use it as `categoryId` in the next tests.

### 1.2 Create a Second Category (for testing budget category update)

```
POST /api/categories
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Transport",
  "type": "expense",
  "description": "Transportation costs"
}
```

> ⚠️ **Copy this `_id`** too — we'll call it `categoryId2`.

---

## 2. Recurring Transactions

### 2.1 ✅ Create a Recurring Transaction (Monthly Rent)

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "expense",
  "amount": 1200,
  "description": "Monthly Rent",
  "date": "2026-04-01",
  "category": "<categoryId>",
  "isRecurring": true,
  "frequency": "monthly",
  "nextDate": "2026-05-01"
}
```

**Expected:** `201 Created`
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "_id": "...",
      "type": "expense",
      "amount": 1200,
      "isRecurring": true,
      "frequency": "monthly",
      "nextDate": "2026-05-01T00:00:00.000Z"
    }
  }
}
```

**✅ Verify:** `isRecurring = true`, `frequency = "monthly"`, `nextDate` is set.

> ⚠️ **Copy the `_id`** — this is your `recurringTransactionId`.

---

### 2.2 ✅ Create a Recurring Transaction (Daily Coffee)

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "expense",
  "amount": 5.50,
  "description": "Daily Coffee",
  "date": "2026-04-08",
  "category": "<categoryId>",
  "isRecurring": true,
  "frequency": "daily",
  "nextDate": "2026-04-09"
}
```

**Expected:** `201 Created` — `frequency = "daily"`

---

### 2.3 ✅ Create a Recurring Income (Weekly Freelance)

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "income",
  "amount": 500,
  "description": "Weekly Freelance Payment",
  "date": "2026-04-07",
  "isRecurring": true,
  "frequency": "weekly",
  "nextDate": "2026-04-14"
}
```

**Expected:** `201 Created` — `type = "income"`, `frequency = "weekly"`

---

### 2.4 ✅ Create a Normal (Non-Recurring) Transaction

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "expense",
  "amount": 650,
  "description": "Grocery Shopping",
  "date": "2026-04-08",
  "category": "<categoryId>"
}
```

**Expected:** `201 Created` — `isRecurring = false`, `frequency = null`, `nextDate = null`

> ⚠️ **Copy the `_id`** — this is your `normalTransactionId`.

---

### 2.5 ❌ FAIL — Recurring Without Frequency (Validation Error)

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "expense",
  "amount": 100,
  "description": "Missing frequency test",
  "date": "2026-04-08",
  "isRecurring": true
}
```

**Expected:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "frequency", "message": "\"frequency\" is required" },
    { "field": "nextDate", "message": "\"nextDate\" is required" }
  ]
}
```

**✅ Verify:** Both `frequency` and `nextDate` are required when `isRecurring = true`.

---

### 2.6 ❌ FAIL — Non-Recurring With Frequency (Forbidden)

```
POST /api/transactions
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "expense",
  "amount": 100,
  "description": "Forbidden frequency test",
  "date": "2026-04-08",
  "isRecurring": false,
  "frequency": "weekly"
}
```

**Expected:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "frequency", "message": "\"frequency\" is not allowed" }
  ]
}
```

**✅ Verify:** `frequency` is forbidden when `isRecurring = false`.

---

### 2.7 ✅ Get All Transactions (verify recurring fields show up)

```
GET /api/transactions
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "...",
        "description": "Monthly Rent",
        "isRecurring": true,
        "frequency": "monthly",
        "nextDate": "2026-05-01T00:00:00.000Z"
      },
      {
        "_id": "...",
        "description": "Grocery Shopping",
        "isRecurring": false,
        "frequency": null,
        "nextDate": null
      }
    ],
    "meta": { "total": 4, "page": 1, "limit": 10, "totalPages": 1 }
  }
}
```

**✅ Verify:** Each transaction has `isRecurring`, `frequency`, `nextDate` fields.

---

### 2.8 ✅ Get Single Recurring Transaction

```
GET /api/transactions/<recurringTransactionId>
Authorization: Bearer <token>
```

**Expected:** `200 OK` — full transaction with recurring fields.

---

### 2.9 ✅ Update Recurring Transaction (change amount)

```
PUT /api/transactions/<recurringTransactionId>
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 1300
}
```

**Expected:** `200 OK` — amount updated, recurring fields unchanged.

---

### 2.10 ✅ Stop Recurring Transaction

```
PATCH /api/transactions/<recurringTransactionId>/stop-recurring
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "message": "Recurring transaction stopped successfully",
  "data": {
    "transaction": {
      "_id": "...",
      "isRecurring": false,
      "frequency": null,
      "nextDate": null
    }
  }
}
```

**✅ Verify:** `isRecurring` is now `false`, `frequency` and `nextDate` are `null`.

---

### 2.11 ❌ FAIL — Stop a Non-Recurring Transaction

```
PATCH /api/transactions/<normalTransactionId>/stop-recurring
Authorization: Bearer <token>
```

**Expected:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Transaction is not recurring"
}
```

---

### 2.12 ❌ FAIL — Stop Non-Existent Transaction

```
PATCH /api/transactions/aaaaaaaaaaaaaaaaaaaaaaaa/stop-recurring
Authorization: Bearer <token>
```

**Expected:** `404 Not Found`
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## 3. Budget CRUD

### 3.1 ✅ Create Budget (Food, April 2026)

```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "<categoryId>",
  "amount": 500,
  "month": 4,
  "year": 2026
}
```

**Expected:** `201 Created`
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "budget": {
      "_id": "...",
      "category": "<categoryId>",
      "amount": 500,
      "month": 4,
      "year": 2026
    }
  }
}
```

> ⚠️ **Copy the `_id`** — this is your `budgetId`.

---

### 3.2 ❌ FAIL — Duplicate Budget (same category + month + year)

```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "<categoryId>",
  "amount": 999,
  "month": 4,
  "year": 2026
}
```

**Expected:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Budget already exists for this category in this month/year"
}
```

---

### 3.3 ❌ FAIL — Missing Required Fields

```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 500
}
```

**Expected:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "category", "message": "\"category\" is required" },
    { "field": "month", "message": "\"month\" is required" },
    { "field": "year", "message": "\"year\" is required" }
  ]
}
```

---

### 3.4 ❌ FAIL — Invalid Month (13)

```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "<categoryId>",
  "amount": 500,
  "month": 13,
  "year": 2026
}
```

**Expected:** `400 Bad Request` — month must be between 1 and 12.

---

### 3.5 ❌ FAIL — Invalid Category ID

```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "invalidid",
  "amount": 500,
  "month": 5,
  "year": 2026
}
```

**Expected:** `400 Bad Request` — validation error on category pattern.

---

### 3.6 ❌ FAIL — Non-Existent Category

```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "aaaaaaaaaaaaaaaaaaaaaaaa",
  "amount": 500,
  "month": 5,
  "year": 2026
}
```

**Expected:** `404 Not Found` — "Category not found"

---

### 3.7 ✅ Get All Budgets (with spending enrichment)

```
GET /api/budgets
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "_id": "...",
        "category": { "_id": "...", "name": "Food" },
        "amount": 500,
        "month": 4,
        "year": 2026,
        "totalSpent": 1855.50,
        "remainingAmount": 0,
        "percentage": 100
      }
    ],
    "count": 1
  },
  "warnings": [
    {
      "budgetId": "...",
      "category": "Food",
      "message": "You have exceeded your Food budget by $1355.50"
    }
  ]
}
```

**✅ Verify:**
- Each budget has `totalSpent`, `remainingAmount`, `percentage`
- `warnings` array appears if any budget is exceeded

---

### 3.8 ✅ Get Budgets Filtered by Month/Year

```
GET /api/budgets?month=4&year=2026
Authorization: Bearer <token>
```

**Expected:** `200 OK` — only budgets for April 2026.

---

### 3.9 ✅ Get Budgets Filtered by Category

```
GET /api/budgets?category=<categoryId>
Authorization: Bearer <token>
```

**Expected:** `200 OK` — only budgets for the specified category.

---

### 3.10 ✅ Get Single Budget by ID

```
GET /api/budgets/<budgetId>
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "budget": {
      "_id": "...",
      "category": { "_id": "...", "name": "Food" },
      "amount": 500,
      "month": 4,
      "year": 2026,
      "totalSpent": 1855.50,
      "remainingAmount": 0,
      "percentage": 100,
      "warning": "You have exceeded your Food budget by $1355.50"
    }
  }
}
```

**✅ Verify:** `warning` field appears inline if budget is exceeded.

---

### 3.11 ❌ FAIL — Get Non-Existent Budget

```
GET /api/budgets/aaaaaaaaaaaaaaaaaaaaaaaa
Authorization: Bearer <token>
```

**Expected:** `404 Not Found` — "Budget not found"

---

### 3.12 ✅ Update Budget — Change Amount

```
PUT /api/budgets/<budgetId>
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 2000
}
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "budget": {
      "amount": 2000
    }
  }
}
```

---

### 3.13 ✅ Update Budget — Change Category

```
PUT /api/budgets/<budgetId>
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "<categoryId2>"
}
```

**Expected:** `200 OK` — budget now tied to the Transport category.

---

### 3.14 ❌ FAIL — Update Budget to Duplicate (same category + month + year as another budget)

First, create a second budget:
```
POST /api/budgets
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "<categoryId>",
  "amount": 300,
  "month": 4,
  "year": 2026
}
```

Then try to update `budgetId` to use `categoryId` (which now conflicts):

```
PUT /api/budgets/<budgetId>
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "category": "<categoryId>"
}
```

**Expected:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Budget already exists for this category in this month/year"
}
```

---

### 3.15 ❌ FAIL — Update Non-Existent Budget

```
PUT /api/budgets/aaaaaaaaaaaaaaaaaaaaaaaa
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 999
}
```

**Expected:** `404 Not Found`

---

### 3.16 ✅ Delete Budget

```
DELETE /api/budgets/<budgetId>
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "message": "Budget deleted successfully",
  "data": {}
}
```

---

### 3.17 ❌ FAIL — Delete Already Deleted Budget

```
DELETE /api/budgets/<budgetId>
Authorization: Bearer <token>
```

**Expected:** `404 Not Found` — "Budget not found"

---

## 4. Budget Alerts

### 4.1 ✅ Get Budget Alerts (Exceeded Budgets Only)

> Make sure you have at least one budget with spending that exceeds the budget amount.

```
GET /api/budgets/alerts?month=4&year=2026
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "budgetId": "...",
        "category": "Food",
        "budgetAmount": 300,
        "totalSpent": 1855.50,
        "exceededBy": 1555.50,
        "month": 4,
        "year": 2026,
        "message": "You have exceeded your Food budget by $1555.50"
      }
    ],
    "count": 1
  }
}
```

**✅ Verify:**
- `budgetAmount` — the budget limit
- `totalSpent` — actual expense transactions total
- `exceededBy` — how much over budget
- `message` — human-readable warning

---

### 4.2 ✅ Get Budget Alerts (No Alerts — Future Month)

```
GET /api/budgets/alerts?month=12&year=2026
Authorization: Bearer <token>
```

**Expected:** `200 OK`
```json
{
  "success": true,
  "data": {
    "alerts": [],
    "count": 0
  }
}
```

**✅ Verify:** Empty alerts array when no budgets exist or no budgets are exceeded.

---

### 4.3 ✅ Get All Alerts (No Filters)

```
GET /api/budgets/alerts
Authorization: Bearer <token>
```

**Expected:** `200 OK` — returns alerts across ALL months/years.

---

## 5. Cleanup

### 5.1 Delete Transactions

```
DELETE /api/transactions/<recurringTransactionId>
Authorization: Bearer <token>
```

```
DELETE /api/transactions/<normalTransactionId>
Authorization: Bearer <token>
```

**Expected:** `200 OK` for each.

---

## 📊 Complete Endpoints Reference

### Recurring Transactions

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | `POST` | `/api/transactions` | Create transaction (`isRecurring`, `frequency`, `nextDate` optional) |
| 2 | `GET` | `/api/transactions` | Get all transactions (recurring fields included) |
| 3 | `GET` | `/api/transactions/:id` | Get single transaction |
| 4 | `PUT` | `/api/transactions/:id` | Update transaction |
| 5 | `PATCH` | `/api/transactions/:id/stop-recurring` | Stop a recurring transaction |
| 6 | `DELETE` | `/api/transactions/:id` | Delete transaction |
| 7 | `GET` | `/api/transactions/summary/total` | Get income/expense summary |

### Budget Module

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | `POST` | `/api/budgets` | Create a budget |
| 2 | `GET` | `/api/budgets` | Get all budgets (with spending + inline warnings) |
| 3 | `GET` | `/api/budgets/alerts` | Get only exceeded budget alerts |
| 4 | `GET` | `/api/budgets/:id` | Get single budget (with spending) |
| 5 | `PUT` | `/api/budgets/:id` | Update budget (amount, month, year, category) |
| 6 | `DELETE` | `/api/budgets/:id` | Delete budget |

### Query Parameters

| Endpoint | Parameter | Type | Description |
|----------|-----------|------|-------------|
| `GET /api/budgets` | `month` | Number (1-12) | Filter by month |
| `GET /api/budgets` | `year` | Number | Filter by year |
| `GET /api/budgets` | `category` | ObjectId | Filter by category |
| `GET /api/budgets/alerts` | `month` | Number (1-12) | Filter alerts by month |
| `GET /api/budgets/alerts` | `year` | Number | Filter alerts by year |
| `GET /api/transactions` | `type` | `income/expense` | Filter by type |
| `GET /api/transactions` | `category` | ObjectId | Filter by category |
| `GET /api/transactions` | `startDate` | Date | Filter from date |
| `GET /api/transactions` | `endDate` | Date | Filter to date |
| `GET /api/transactions` | `page` | Number | Page number (default: 1) |
| `GET /api/transactions` | `limit` | Number | Items per page (default: 10) |
| `GET /api/transactions` | `sortBy` | `date/amount/createdAt` | Sort field |
| `GET /api/transactions` | `sortOrder` | `asc/desc` | Sort direction |
