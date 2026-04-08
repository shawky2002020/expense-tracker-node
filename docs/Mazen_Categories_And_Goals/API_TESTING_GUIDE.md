# API Testing Guide - Categories and Goals

## 1. Setup

Get your authentication tokens first:

### Admin Token
**POST** `http://localhost:3000/api/auth/login`
```json
{
  "identifier": "superadmin@example.com",
  "password": "Password123!"
}
```

### User Token
**POST** `http://localhost:3000/api/auth/login`
```json
{
  "identifier": "user@example.com",
  "password": "Password123!"
}
```

---

## 2. Category Endpoints (Admin)

### Create Income Category
**POST** `http://localhost:3000/api/categories`
Authorization: Bearer ADMIN_TOKEN
```json
{
  "name": "Salary",
  "type": "income",
  "description": "Monthly wages"
}
```

### Create Expense Category
**POST** `http://localhost:3000/api/categories`
Authorization: Bearer ADMIN_TOKEN
```json
{
  "name": "Groceries",
  "type": "expense",
  "description": "Food and supplies"
}
```

### Get All Categories
**GET** `http://localhost:3000/api/categories`
Authorization: Bearer ANY_TOKEN

### Get Categories By Type
**GET** `http://localhost:3000/api/categories/type/expense`
Authorization: Bearer ANY_TOKEN

### Update Category
**PUT** `http://localhost:3000/api/categories/ID`
Authorization: Bearer ADMIN_TOKEN
```json
{
  "description": "Updated description"
}
```

### Delete Category
**DELETE** `http://localhost:3000/api/categories/ID`
Authorization: Bearer ADMIN_TOKEN

---

## 3. Goal Endpoints (User)

### Create Goal
**POST** `http://localhost:3000/api/goals`
Authorization: Bearer USER_TOKEN
```json
{
  "name": "Vacation",
  "targetAmount": 5000,
  "deadline": "2026-12-31T00:00:00Z"
}
```

### Get All Goals
**GET** `http://localhost:3000/api/goals`
Authorization: Bearer USER_TOKEN

### Get Single Goal
**GET** `http://localhost:3000/api/goals/ID`
Authorization: Bearer USER_TOKEN

### Update Goal
**PATCH** `http://localhost:3000/api/goals/ID`
Authorization: Bearer USER_TOKEN
```json
{
  "savedAmount": 1000
}
```

### Get Goal Dashboard/Progress
**GET** `http://localhost:3000/api/goals/progress/ID`
Authorization: Bearer USER_TOKEN

### Delete Goal
**DELETE** `http://localhost:3000/api/goals/ID`
Authorization: Bearer USER_TOKEN
