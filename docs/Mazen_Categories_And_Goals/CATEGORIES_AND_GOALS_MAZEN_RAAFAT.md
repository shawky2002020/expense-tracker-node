# Categories & Goals Module

This document outlines the implementation of the Categories and Savings Goals modules for the Expense Tracker.

## Implemented Features

### Category Module
- Categorization of transactions by type (income or expense).
- Full CRUD operations for categories (restricted to admin users).
- Validation to prevent duplicate categories with the same name and type.
- Soft deletion using an `isActive` flag to disabled categories without removing historical data.
- Utility endpoints to filter active categories based on type.
- Reusable middleware (`validateCategoryExists`, `validateCategoryType`) to ensure valid categories are attached to transactions.

### Savings Goals Module
- Full CRUD operations for savings goals. All operations are scoped to the authenticated user ID.
- Validation ensuring goal deadlines are set in the future.
- Real-time progress calculation. The system tracks savings amounts and automatically calculates a percentage progress against the target.
- Pre-save Mongoose hook that automatically marks a goal as completed (`isCompleted: true`) when the saved amount matches or exceeds the target.
- Dashboard endpoint showing the exact days remaining, required remaining balance, and health status (e.g., on-track, behind).

---

## Files Changed/Created

### Models
- `src/models/Category.js`: Mongoose schema for categories.
- `src/models/Goal.js`: Mongoose schema for goals including virtual fields and pre-save hooks.

### Controllers
- `src/controllers/categoryController.js`: Handlers for category routes.
- `src/controllers/goalController.js`: Handlers for goal routes including progress logic.

### Routes
- `src/routes/categoryRoutes.js`: Admin-protected routes for managing categories, plus public read access.
- `src/routes/goalRoutes.js`: User-protected routes scoped entirely to the requestor's ID.

### Middlewares & Utilities
- `src/middlewares/categoryMiddleware.js`: Safety checks determining valid categorizations.
- `src/utils/goalProgressCalculator.js`: Functions for calculating percentages and remaining time.

### Validations
- `src/validations/categoryValidation.js`: Joi schemas for category requests.
- `src/validations/goalValidation.js`: Joi schemas for goal requests.

---

## Database Schemas

### Category Model
- `name`: String (Required, 1-50 chars)
- `type`: String (Required, enum: 'income', 'expense')
- `description`: String (Optional, max 200 chars)
- `isActive`: Boolean (Default: true)

### Goal Model
- `userId`: ObjectId (Required, ref: User)
- `name`: String (Required, max 100 chars)
- `targetAmount`: Number (Required, min 0)
- `savedAmount`: Number (Default: 0)
- `deadline`: Date (Required, future date)
- `description`: String (Optional, max 500 chars)
- `isCompleted`: Boolean (Default: false)

---

## API Endpoints

### Categories
- `POST /api/categories`: Create category (Admin)
- `GET /api/categories`: List active categories
- `GET /api/categories/type/:type`: List categories matching type
- `PUT /api/categories/:id`: Update category (Admin)
- `DELETE /api/categories/:id`: Soft delete category (Admin)

### Goals
- `POST /api/goals`: Create a goal
- `GET /api/goals`: List all user goals
- `GET /api/goals/progress/:id`: Get a detailed dashboard view of a specific goal
- `GET /api/goals/:id`: Get a specific goal
- `PATCH /api/goals/:id`: Add funds or update goal metrics
- `DELETE /api/goals/:id`: Delete goal
