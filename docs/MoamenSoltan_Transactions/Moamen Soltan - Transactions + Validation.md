# Moamen Soltan: Transactions + Validation

What I added in this change :

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

Additionally Added :
Postman collection , to test all transactions APIs + auth -> exported as JSON

Notes :


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