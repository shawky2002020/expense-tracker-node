# API Testing Guide - Analytics and Seeding

## 1. Prerequisites
- Backend is running at `http://localhost:3000`.
- You have a valid JWT bearer token.

---

## 2. Seed Demo Data

### Option A: npm script
```bash
npm run seed:analytics -- "YOUR_BEARER_TOKEN"
```

### Option B: node directly
```bash
node scripts/seedAnalyticsData.js "YOUR_BEARER_TOKEN"
```

Expected output includes lines similar to:
- `Inserted 1/12: ...`
- `Seeding completed. Inserted 12 transactions.`

---

## 3. Test Analytics Endpoints

Use the same bearer token in all requests.

### Monthly Spending
**GET** `http://localhost:3000/api/analytics/monthly-spending?year=2026&month=4`

Example response shape:
```json
{
  "success": true,
  "data": {
    "period": { "year": 2026, "month": 4 },
    "totalExpense": 815,
    "dailyBreakdown": [
      { "day": 5, "totalAmount": 550, "transactionCount": 1 },
      { "day": 8, "totalAmount": 265, "transactionCount": 1 }
    ],
    "trend": {
      "previousPeriod": { "year": 2026, "month": 3 },
      "previousMonthExpense": 710,
      "difference": 105,
      "percentageChange": 14.79
    }
  }
}
```

### Summary
**GET** `http://localhost:3000/api/analytics/summary?trendMonths=6`

Example response shape:
```json
{
  "success": true,
  "data": {
    "summary": {
      "income": 13100,
      "expense": 2740,
      "balance": 10360,
      "incomeCount": 4,
      "expenseCount": 8
    },
    "expenseByCategory": [
      {
        "category": "Uncategorized",
        "totalAmount": 2740,
        "transactionCount": 8
      }
    ],
    "trends": {
      "months": 6,
      "monthly": [
        { "period": "2026-01", "income": 3200, "expense": 600, "net": 2600 },
        { "period": "2026-02", "income": 3250, "expense": 615, "net": 2635 },
        { "period": "2026-03", "income": 3300, "expense": 710, "net": 2590 },
        { "period": "2026-04", "income": 3350, "expense": 815, "net": 2535 }
      ]
    }
  }
}
```

### CSV Export
**GET** `http://localhost:3000/api/analytics/export/csv?type=expense`

Expected headers:
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename=transactions-<timestamp>.csv`

First CSV line:
```text
date,type,amount,currency,category,description,notes,isRecurring,frequency
```

---

## 4. Quick PowerShell Validation

```powershell
$token = "YOUR_BEARER_TOKEN"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/analytics/monthly-spending?year=2026&month=4" -Headers $headers
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/analytics/summary?trendMonths=6" -Headers $headers
Invoke-WebRequest -Method Get -Uri "http://localhost:3000/api/analytics/export/csv?type=expense" -Headers $headers
```
