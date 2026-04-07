# API Testing Guide - Quick Reference

## Setup Requirements

### Environment Variables (.env file)
```
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Start Server
```bash
npm install
npm run dev
```

---

## 1. Authentication Endpoints

### 1.1 Register User
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-04-06T10:00:00Z",
      "updatedAt": "2024-04-06T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Login User
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecurePass123"
}
```

**Alternative with username:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "john_doe",
  "password": "SecurePass123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "lastLogin": "2024-04-06T10:05:00Z",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Get Current User Profile
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true,
      "preferences": {
        "currency": "USD",
        "language": "en",
        "theme": "light"
      }
    }
  }
}
```

### 1.4 Update User Profile
```http
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "preferences": {
    "currency": "EUR",
    "language": "es",
    "theme": "dark"
  }
}
```

### 1.5 Change Password
```http
PUT http://localhost:3000/api/auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

### 1.6 Logout
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1.7 Forgot Password
```http
POST http://localhost:3000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 1.8 Reset Password
```http
PUT http://localhost:3000/api/auth/reset-password
Content-Type: application/json

{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

---

## 2. User Management Endpoints (Admin Only)

### 2.1 List All Users
```http
GET http://localhost:3000/api/users?page=1&limit=10&role=user&sortBy=createdAt&sortOrder=desc
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `role` (user | admin)
- `sortBy` (createdAt | username | email | firstName | lastName)
- `sortOrder` (asc | desc)
- `search` (searches username, email, firstName, lastName)
- `isActive` (true | false)

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "isActive": true,
        "lastLogin": "2024-04-06T10:05:00Z",
        "createdAt": "2024-04-06T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 48,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2.2 Get Single User
```http
GET http://localhost:3000/api/users/507f1f77bcf86cd799439011
Authorization: Bearer ADMIN_JWT_TOKEN
```

### 2.3 Update User (Admin)
```http
PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "role": "admin",
  "isActive": true,
  "firstName": "Jonathan",
  "lastName": "Smith"
}
```

### 2.4 Soft Delete User (Admin)
```http
DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011
Authorization: Bearer ADMIN_JWT_TOKEN
```
**Note:** This deactivates the user account (soft delete)

### 2.5 Permanent Delete User (Admin)
```http
DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439011/permanent
Authorization: Bearer ADMIN_JWT_TOKEN
```
**Note:** This permanently removes the user from the database

### 2.6 Reactivate User (Admin)
```http
PUT http://localhost:3000/api/users/507f1f77bcf86cd799439011/reactivate
Authorization: Bearer ADMIN_JWT_TOKEN
```

### 2.7 Get User Statistics (Admin)
```http
GET http://localhost:3000/api/users/stats
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 50,
    "activeUsers": 48,
    "inactiveUsers": 2,
    "adminUsers": 3,
    "regularUsers": 47,
    "recentRegistrations": 5
  }
}
```

---

## 3. Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "User role 'user' is not authorized to access this resource."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Duplicate Error (400)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 4. Authentication Header Format

All protected endpoints require the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxMjM5NTIwMCwiZXhwIjoxNzEzMDAwMDAwfQ.SIGNATURE
```

---

## 5. Testing with Postman/Insomnia

1. **Set up environment variables:**
   - Create environment with `{{base_url}}` = http://localhost:3000
   - Create variable `{{token}}` to store JWT

2. **In register/login request:**
   - Use `Tests` tab to automatically save token:
   ```javascript
   var jsonData = pm.response.json();
   pm.environment.set("token", jsonData.data.token);
   ```

3. **In protected endpoints:**
   - Use Authorization header: `Bearer {{token}}`

---

## 6. Common Test Scenarios

### Scenario 1: New User Onboarding
1. Register new user
2. Login with credentials
3. Verify token is returned
4. Get user profile (/api/auth/me)
5. Update profile preferences

### Scenario 2: Admin User Management
1. Create admin account
2. Login as admin
3. List all users with pagination
4. Search for specific user
5. Update user role to admin
6. Get user statistics
7. Deactivate inactive user

### Scenario 3: Authorization Testing
1. Register regular user
2. Try to access /api/users (should fail - not admin)
3. Try to update another user (should fail - not owner)
4. Update own profile (should succeed)
5. Try to delete user (should fail - not admin)

### Scenario 4: Token Validation
1. Login and get token
2. Use token with Authorization header
3. Try with invalid token (should fail)
4. Try with expired token (should fail)
5. Try without token (should fail)

---

## 7. Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers returned:**
  - `RateLimit-Limit: 100`
  - `RateLimit-Remaining: 99`
  - `RateLimit-Reset: 1712395500`

---

## 8. CORS Configuration

- **Allowed Origin:** http://localhost:3000 (configurable via CORS_ORIGIN env var)
- **Credentials:** true
- **Allowed Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Allowed Headers:** Content-Type, Authorization

---

## 9. Health Check

```http
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-04-06T10:00:00.000Z",
  "uptime": 3600
}
```

---

## 10. Password Requirements

**Current Implementation:**
- Minimum 6 characters
- Can be increased via validation schemas

**Recommended Strength (validated but not enforced):**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

---
