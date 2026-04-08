# Member 2: Transactions + Validation

What I added in this change (files follow the existing project structure):

- src/models/Transaction.js — Mongoose model for transactions (user ref, type, amount, category, date, notes)
- src/controllers/transactionController.js — CRUD controller, filtering, sorting, pagination, and summary total
- src/routes/transactionRoutes.js — REST routes registered under `/api/transactions`
- src/middlewares/validationMiddleware.js — reusable `validateBody`, `validateQuery`, `validateParams` middleware
- src/validations/transactionValidation.js — Joi schemas for create, update, query, and id param
- src/utils/paginationHelper.js — pagination helpers
- src/utils/filterHelper.js — helpers to build transaction filters
- src/utils/paginationHelper.js — pagination helpers
- src/utils/filterHelper.js — helpers to build transaction filters

Additionally updated:

- app.js — registered the transactions routes: `app.use('/api/transactions', transactionRoutes)`

Notes and assumptions:

- Authentication: all transaction endpoints require authentication via the existing `authenticate` middleware (Member 1).
- Category validation: controller attempts to `require('../models/Category')` and, if present, verifies the category exists and that its `type` matches the transaction `type`. Member 3 should provide a `Category` model with a `type` field for full validation.
- Validation: Joi is used across the project; middleware strips unknown fields and returns structured errors identical in style to existing validators.
- Pagination & filtering: implemented `page`, `limit`, `type`, `category`, `startDate`, `endDate`, `sortBy`, `sortOrder` query parameters.

How to use:

1. Start the server as usual (e.g., `npm run dev`).
2. Use the new endpoints under `/api/transactions`:

```
POST   /api/transactions
GET    /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/summary/total
```

If you'd like, I can add tests, seed data, or a minimal `Category` model to enable category-type validation end-to-end.
