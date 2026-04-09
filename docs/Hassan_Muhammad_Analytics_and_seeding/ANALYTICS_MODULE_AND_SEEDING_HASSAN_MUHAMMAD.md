# Analytics Module and Seeding - Hassan Muhammad

This document summarizes the Analytics module implementation and the data seeding utility added for testing.

## Implemented Features

### Analytics Module
- Monthly spending endpoint with day-level expense aggregation.
- Summary endpoint with:
  - total income,
  - total expense,
  - balance,
  - income and expense transaction counts,
  - expense breakdown by category,
  - monthly trend over a configurable number of months.
- CSV export endpoint for authenticated user transactions with optional filters.

### Data Seeding Utility
- Reusable script to insert analytics demo data (income and expense records across multiple months).
- Supports passing bearer token as CLI argument or environment variable.

---

## Files Added or Updated

### Analytics Core
- `src/controllers/analyticsController.js`
  - `getMonthlySpending`
  - `getSummary`
  - `exportTransactionsCsv`
- `src/routes/analyticsRoutes.js`
- `src/validations/analyticsValidation.js`
- `app.js` (registered `/api/analytics` routes)

### Seeding
- `scripts/seedAnalyticsData.js`
- `package.json` (added `seed:analytics` npm script)

---

## API Endpoints

### 1) Monthly Spending
- `GET /api/analytics/monthly-spending?year=&month=`
- Auth: Bearer token required
- Purpose: Return total expense and daily breakdown for the selected month, plus previous month comparison.

### 2) Analytics Summary
- `GET /api/analytics/summary?trendMonths=6`
- Auth: Bearer token required
- Purpose: Return overall financial summary and trends.

### 3) CSV Export
- `GET /api/analytics/export/csv`
- Query params (optional):
  - `startDate`
  - `endDate`
  - `type` (`income` or `expense`)
- Auth: Bearer token required
- Purpose: Download user transactions as CSV.

---

## Data Seeding Script

### Command
```bash
npm run seed:analytics -- "YOUR_BEARER_TOKEN"
```

Alternative:
```bash
node scripts/seedAnalyticsData.js "YOUR_BEARER_TOKEN"
```

### Behavior
- Inserts 12 demo transactions.
- Covers Jan-Apr 2026.
- Mixes income and expense data to test aggregations and trends.

---

## Notes
- The seed script intentionally does not require category IDs to avoid category validation blockers.
- CSV export automatically marks missing categories as `Uncategorized`.
- All analytics queries are scoped to the authenticated user only.
