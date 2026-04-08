# API Testing Guide - Budget, Alerts & Recurring Transactions

## 1. Setup

Get your authentication token first:

### Login
**POST** `http://localhost:3000/api/auth/login`
```json
{
  "identifier": "your@email.com",
  "password": "YourPassword123"
}
```

### Create Expense Category (if needed)
**POST** `http://localhost:3000/api/categories`
Authorization: Bearer ADMIN_TOKEN
```json
{
  "name": "Food",
  "type": "expense",
  "description": "Food and groceries"
}
```

---

## 2. Recurring Transaction Endpoints

### Create Recurring Transaction (Monthly)
**POST** `http://localhost:3000/api/transactions`
Authorization: Bearer TOKEN
```json
{
  "type": "expense",
  "amount": 1200,
  "description": "Monthly Rent",
  "date": "2026-04-01",
  "category": "CATEGORY_ID",
  "isRecurring": true,
  "frequency": "monthly",
  "nextDate": "2026-05-01"
}
```

### Create Recurring Transaction (Daily)
**POST** `http://localhost:3000/api/transactions`
Authorization: Bearer TOKEN
```json
{
  "type": "expense",
  "amount": 5.50,
  "description": "Daily Coffee",
  "date": "2026-04-08",
  "category": "CATEGORY_ID",
  "isRecurring": true,
  "frequency": "daily",
  "nextDate": "2026-04-09"
}
```

### Create Normal Transaction (non-recurring)
**POST** `http://localhost:3000/api/transactions`
Authorization: Bearer TOKEN
```json
{
  "type": "expense",
  "amount": 650,
  "description": "Grocery Shopping",
  "date": "2026-04-08",
  "category": "CATEGORY_ID"
}
```

### FAIL - Recurring Without Frequency
**POST** `http://localhost:3000/api/transactions`
Authorization: Bearer TOKEN
```json
{
  "type": "expense",
  "amount": 100,
  "description": "Should fail",
  "date": "2026-04-08",
  "isRecurring": true
}
```
Expected: `400` — frequency and nextDate are required when isRecurring is true.

### FAIL - Non-Recurring With Frequency
**POST** `http://localhost:3000/api/transactions`
Authorization: Bearer TOKEN
```json
{
  "type": "expense",
  "amount": 100,
  "description": "Should fail",
  "date": "2026-04-08",
  "isRecurring": false,
  "frequency": "weekly"
}
```
Expected: `400` — frequency is forbidden when isRecurring is false.

### Stop Recurring Transaction
**PATCH** `http://localhost:3000/api/transactions/RECURRING_ID/stop-recurring`
Authorization: Bearer TOKEN

Expected: `200` — isRecurring becomes false, frequency and nextDate become null.

### FAIL - Stop Non-Recurring Transaction
**PATCH** `http://localhost:3000/api/transactions/NORMAL_ID/stop-recurring`
Authorization: Bearer TOKEN

Expected: `400` — "Transaction is not recurring"

### Get All Transactions (verify recurring fields)
**GET** `http://localhost:3000/api/transactions`
Authorization: Bearer TOKEN

### Get Single Transaction
**GET** `http://localhost:3000/api/transactions/ID`
Authorization: Bearer TOKEN

### Delete Transaction
**DELETE** `http://localhost:3000/api/transactions/ID`
Authorization: Bearer TOKEN

---

## 3. Budget Endpoints

### Create Budget
**POST** `http://localhost:3000/api/budgets`
Authorization: Bearer TOKEN
```json
{
  "category": "CATEGORY_ID",
  "amount": 500,
  "month": 4,
  "year": 2026
}
```

### FAIL - Duplicate Budget
**POST** `http://localhost:3000/api/budgets`
Authorization: Bearer TOKEN
```json
{
  "category": "CATEGORY_ID",
  "amount": 999,
  "month": 4,
  "year": 2026
}
```
Expected: `400` — "Budget already exists for this category in this month/year"

### FAIL - Missing Required Fields
**POST** `http://localhost:3000/api/budgets`
Authorization: Bearer TOKEN
```json
{
  "amount": 500
}
```
Expected: `400` — Validation failed (category, month, year required)

### FAIL - Invalid Month
**POST** `http://localhost:3000/api/budgets`
Authorization: Bearer TOKEN
```json
{
  "category": "CATEGORY_ID",
  "amount": 500,
  "month": 13,
  "year": 2026
}
```
Expected: `400` — month must be between 1 and 12

### Get All Budgets (with spending + warnings)
**GET** `http://localhost:3000/api/budgets`
Authorization: Bearer TOKEN

### Get Budgets Filtered
**GET** `http://localhost:3000/api/budgets?month=4&year=2026`
Authorization: Bearer TOKEN

### Get Single Budget
**GET** `http://localhost:3000/api/budgets/BUDGET_ID`
Authorization: Bearer TOKEN

### Update Budget (change amount)
**PUT** `http://localhost:3000/api/budgets/BUDGET_ID`
Authorization: Bearer TOKEN
```json
{
  "amount": 300
}
```

### Update Budget (change category)
**PUT** `http://localhost:3000/api/budgets/BUDGET_ID`
Authorization: Bearer TOKEN
```json
{
  "category": "NEW_CATEGORY_ID"
}
```

### FAIL - Update to Non-Existent Budget
**PUT** `http://localhost:3000/api/budgets/aaaaaaaaaaaaaaaaaaaaaaaa`
Authorization: Bearer TOKEN
```json
{
  "amount": 999
}
```
Expected: `404` — "Budget not found"

### Delete Budget
**DELETE** `http://localhost:3000/api/budgets/BUDGET_ID`
Authorization: Bearer TOKEN

### FAIL - Delete Already Deleted Budget
**DELETE** `http://localhost:3000/api/budgets/BUDGET_ID`
Authorization: Bearer TOKEN

Expected: `404` — "Budget not found"

---

## 4. Budget Alerts Endpoints

### Get Budget Alerts (exceeded budgets only)
**GET** `http://localhost:3000/api/budgets/alerts?month=4&year=2026`
Authorization: Bearer TOKEN

### Get All Alerts (no filter)
**GET** `http://localhost:3000/api/budgets/alerts`
Authorization: Bearer TOKEN

### Get Alerts for Future Month (should be empty)
**GET** `http://localhost:3000/api/budgets/alerts?month=12&year=2026`
Authorization: Bearer TOKEN

Expected: Empty alerts array
