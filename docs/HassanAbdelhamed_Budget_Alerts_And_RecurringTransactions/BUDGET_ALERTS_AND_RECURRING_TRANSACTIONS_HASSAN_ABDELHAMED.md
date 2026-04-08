# Budget, Budget Alerts & Recurring Transactions Module

## Overview
Implementation of the Budget module with spending tracking and alerts, plus Recurring Transactions with automated scheduling via cron jobs. These features enable users to set monthly budgets per category, receive alerts when exceeding them, and automate repeating transactions like rent or salary.

---

## ✅ Implemented Features

### Recurring Transactions Module
- ✅ **Recurring Transaction Creation**: Users can mark any transaction as recurring with a frequency (daily, weekly, monthly, yearly) and a scheduled `nextDate`.
- ✅ **Automatic Transaction Generation**: A `node-cron` job runs daily at midnight, clones all due recurring transactions, and advances their `nextDate` to the next occurrence.
- ✅ **Stop Recurring**: Dedicated `PATCH` endpoint to stop a recurring transaction — sets `isRecurring: false` and clears `frequency` and `nextDate`.
- ✅ **Validation Rules**: `frequency` and `nextDate` are **required** when `isRecurring: true`, and **forbidden** when `isRecurring: false` (using Joi `.when()` conditional validation).
- ✅ **Backward Compatibility**: Existing non-recurring transactions are unaffected — `isRecurring` defaults to `false`.

### Budget Module
- ✅ **Full CRUD Operations**: Create, read, update, and delete budgets. All operations are scoped to the authenticated user.
- ✅ **Per-Category Monthly Budgets**: Each budget is tied to a category for a specific month/year.
- ✅ **Duplicate Prevention**: Compound unique index ensures no duplicate budgets for the same user + category + month + year.
- ✅ **Spending Enrichment**: Every budget response is enriched with `totalSpent`, `remainingAmount`, and `percentage` calculated from actual expense transactions.
- ✅ **Category Update Support**: Users can reassign a budget to a different category with automatic duplicate checking.
- ✅ **Query Filtering**: Budgets can be filtered by `month`, `year`, and `category` via query parameters.

### Budget Alerts Module
- ✅ **Inline Warnings**: `GET /api/budgets` returns a `warnings` array when any budget is exceeded, alongside the budget data.
- ✅ **Dedicated Alerts Endpoint**: `GET /api/budgets/alerts` returns only exceeded budgets with detailed alert data including `budgetAmount`, `totalSpent`, `exceededBy`, and a human-readable `message`.
- ✅ **Per-Budget Warning**: `GET /api/budgets/:id` includes a `warning` field inline on the budget object if it is exceeded.

---

## 📁 Files Created/Modified

### Models
- ✅ **`src/models/Budget.js`** — Mongoose schema for budgets (user, category, amount, month, year) with compound unique index.
- ✅ **`src/models/Transaction.js`** (Modified) — Added `isRecurring` (Boolean), `frequency` (enum with null), `nextDate` (Date) fields. Added `{ isRecurring: 1, nextDate: 1 }` compound index for cron performance.

### Controllers
- ✅ **`src/controllers/budgetController.js`** — Handlers for budget CRUD, spending enrichment, inline warnings, and dedicated alerts endpoint.
  - `createBudget()` — Create budget with duplicate check
  - `getBudgets()` — List budgets with batch spending calculation and inline warnings
  - `getBudgetById()` — Get single budget with spending enrichment
  - `updateBudget()` — Update budget (amount, month, year, category) with duplicate check
  - `deleteBudget()` — Delete budget
  - `getBudgetAlerts()` — Dedicated alerts-only endpoint
- ✅ **`src/controllers/transactionController.js`** (Modified) — Added `isRecurring`, `frequency`, `nextDate` to `createTransaction()`. Added `stopRecurring()` handler.

### Routes
- ✅ **`src/routes/budgetRoutes.js`** — User-protected routes for budget management and alerts.
- ✅ **`src/routes/transactionRoutes.js`** (Modified) — Added `PATCH /:id/stop-recurring` route.

### Validations
- ✅ **`src/validations/budgetValidation.js`** — Joi schemas for budget create, update, ID param, and query. Includes local `validate()`, `validateParams()`, `validateQuery()` helpers.
- ✅ **`src/validations/transactionValidation.js`** (Modified) — Added `isRecurring`, `frequency`, `nextDate` with conditional `.when()` validation.

### Utilities
- ✅ **`src/utils/budgetHelper.js`** — Reusable budget calculation functions:
  - `getMonthDateRange()` — Build start/end dates for a given month/year
  - `calculateBatchSpending()` — Single aggregation for multiple budgets (fixes N+1 query problem)
  - `calculateSingleSpending()` — Aggregation for a single budget
  - `enrichBudgetWithSpending()` — Attach `totalSpent`, `remainingAmount`, `percentage`, `warning` to a budget object

### Jobs
- ✅ **`src/jobs/recurringTransactionJob.js`** — Cron job for recurring transactions:
  - `calculateNextDate()` — Advance date by frequency (daily/weekly/monthly/yearly)
  - `processRecurringTransactions()` — Find all due transactions, clone them, advance `nextDate`
  - `startRecurringTransactionJob()` — Schedule the cron to run daily at midnight (`0 0 * * *`)

### App & Server
- ✅ **`app.js`** (Modified) — Registered budget routes: `app.use('/api/budgets', budgetRoutes)`
- ✅ **`server.js`** (Modified) — Imported and started `startRecurringTransactionJob()` after database connection

---

## 📊 Database Schemas

### Budget Model

```javascript
{
  user: ObjectId (Required, ref: User, indexed),
  category: ObjectId (Required, ref: Category),
  amount: Number (Required, min: 0),
  month: Number (Required, 1-12),
  year: Number (Required, min: 2000),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ user: 1, category: 1, month: 1, year: 1 }` — Unique compound index (prevents duplicates)
- `{ user: 1, month: 1, year: 1 }` — Query performance

### Transaction Model (New Fields)

```javascript
{
  // ... existing fields ...
  isRecurring: Boolean (Default: false),
  frequency: String (enum: 'daily', 'weekly', 'monthly', 'yearly', null. Default: null),
  nextDate: Date (Default: null)
}
```

**New Index:** `{ isRecurring: 1, nextDate: 1 }` — Optimizes the daily cron job query

---

## 🔗 API Endpoints

### Budget Endpoints
```
POST   /api/budgets              - Create a new budget
GET    /api/budgets              - Get all budgets (with spending + inline warnings)
GET    /api/budgets/alerts       - Get only exceeded budget alerts
GET    /api/budgets/:id          - Get single budget (with spending)
PUT    /api/budgets/:id          - Update budget (amount, month, year, category)
DELETE /api/budgets/:id          - Delete budget
```

### Recurring Transaction Endpoints (added to existing transactions)
```
POST   /api/transactions                       - Create transaction (with optional recurring fields)
PATCH  /api/transactions/:id/stop-recurring    - Stop a recurring transaction
```

---

## ⚙️ Recurring Transactions Logic

### Creation Flow
1. User sends `POST /api/transactions` with `isRecurring: true`, `frequency: "monthly"`, `nextDate: "2026-05-01"`
2. Joi validation ensures `frequency` and `nextDate` are provided (they are forbidden if `isRecurring: false`)
3. Transaction is created in the database as a recurring "template"

### Cron Job Flow (daily at midnight)
1. Find all transactions where `isRecurring === true` AND `nextDate` is today
2. For each due transaction:
   - Clone it as a new normal transaction (`isRecurring: false`)
   - Advance the template's `nextDate` based on `frequency`
3. Log the count of processed transactions

### Stop Flow
1. User sends `PATCH /api/transactions/:id/stop-recurring`
2. System validates the transaction exists and is actually recurring
3. Sets `isRecurring: false`, `frequency: null`, `nextDate: null`
4. The cron job will no longer pick up this transaction

---

## ⚙️ Budget Alerts Logic

### How Alerts Work
1. When `GET /api/budgets` is called, for each budget:
   - Aggregate all expense transactions for that category in that month/year (batch query)
   - Compare `totalSpent` vs `budget.amount`
   - If `totalSpent > amount` → add warning to `warnings[]` array
2. `GET /api/budgets/alerts` returns ONLY the exceeded budgets (no budget data)

### Example Response with Alerts
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "_id": "...",
        "category": { "_id": "...", "name": "Food", "type": "expense" },
        "amount": 500,
        "month": 4,
        "year": 2026,
        "totalSpent": 850,
        "remainingAmount": 0,
        "percentage": 170,
        "warning": "You have exceeded your Food budget by $350.00"
      }
    ],
    "count": 1
  },
  "warnings": [
    {
      "budgetId": "...",
      "category": "Food",
      "message": "You have exceeded your Food budget by $350.00"
    }
  ]
}
```

---

## 📋 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": {
    "budget": { ... }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Budget already exists for this category in this month/year"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "category", "message": "\"category\" is required" },
    { "field": "month", "message": "\"month\" is required" }
  ]
}
```

---

## 🧪 Testing Scenarios

### Budget Creation
1. User provides: category, amount, month, year
2. System validates all inputs via Joi
3. System checks category exists via `validateCategoryExists` middleware
4. System checks for duplicate budget (same user + category + month + year)
5. Budget created and returned

### Budget with Alerts
1. User creates a budget (e.g., Food: $500 for April 2026)
2. User creates expense transactions in that category for that month
3. `GET /api/budgets` returns budgets with `totalSpent`, `percentage`, and `warnings[]` if exceeded
4. `GET /api/budgets/alerts` returns only exceeded alerts

### Recurring Transaction
1. User creates transaction with `isRecurring: true`, `frequency: "monthly"`, `nextDate: "2026-05-01"`
2. Cron job runs at midnight → finds due transactions → creates clones → advances `nextDate`
3. User can stop recurring via `PATCH /api/transactions/:id/stop-recurring`

### Validation Rules
- Cannot create budget with `month: 13` (Joi rejects)
- Cannot create recurring transaction without `frequency` and `nextDate`
- Cannot send `frequency` when `isRecurring: false` (Joi forbids)
- Cannot stop a non-recurring transaction (returns 400)

---

## 🔧 Dependencies Added

- **`node-cron`** — Lightweight cron scheduler for Node.js. Used to schedule the recurring transaction job (`0 0 * * *` = daily at midnight).

---

## ✅ Verification Checklist

- ✅ Budget model with compound unique index
- ✅ Budget CRUD with duplicate prevention
- ✅ Spending enrichment via Transaction aggregation
- ✅ Batch aggregation to avoid N+1 queries
- ✅ Inline budget warnings in GET response
- ✅ Dedicated alerts endpoint
- ✅ Category update with duplicate check
- ✅ Recurring transaction fields on Transaction model
- ✅ Joi conditional validation (when/then/otherwise)
- ✅ Cron job for automatic transaction cloning
- ✅ Stop recurring endpoint
- ✅ Routes registered in app.js
- ✅ Cron started in server.js after DB connection
- ✅ Helper functions extracted to budgetHelper.js
- ✅ All responses follow team's standard format

---

**Status**: 🟢 **COMPLETE AND READY FOR USE**

All Budget, Budget Alerts, and Recurring Transaction features have been fully implemented, refactored, and tested.
