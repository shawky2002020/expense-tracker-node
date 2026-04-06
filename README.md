# Expense Tracker API

A Node.js REST API for expense tracking with user authentication and management.

## Features

- User registration and authentication (JWT)
- User profile management
- Role-based access control (User/Admin)
- Secure password hashing
- Input validation and sanitization
- Rate limiting
- CORS support
- Comprehensive error handling
- Logging with Morgan
- Security headers with Helmet
- Compression middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, CORS, Rate Limiting
- **Testing**: Jest, Supertest
- **Linting**: ESLint

## Project Structure

```
project/
├── src/
│   ├── models/          # Database models
│   │   └── User.js
│   ├── controllers/     # Route controllers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/     # Custom middlewares
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── validations/     # Input validation schemas
│   │   ├── authValidation.js
│   │   └── userValidation.js
│   └── utils/           # Utility functions
│       ├── generateToken.js
│       └── hashPassword.js
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── server.js           # Application entry point
├── app.js              # Express app configuration
├── package.json        # Dependencies and scripts
├── jest.config.js      # Jest testing configuration
├── .eslintrc.json      # ESLint configuration
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/logout` | Logout user | Private |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password` | Reset password with token | Public |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users (paginated) | Admin |
| GET | `/:userId` | Get user by ID | Admin/Own |
| PUT | `/:userId` | Update user | Admin/Own |
| DELETE | `/:userId` | Deactivate user | Admin |
| DELETE | `/:userId/permanent` | Permanently delete user | Admin |
| PUT | `/:userId/reactivate` | Reactivate user | Admin |
| GET | `/stats` | Get user statistics | Admin |

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **User**: Can manage their own profile and data
- **Admin**: Can manage all users and system settings

## Validation

All API endpoints use Joi for input validation. Invalid requests will return detailed error messages.

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and error messages.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Security headers with Helmet
- Input validation and sanitization
- SQL injection prevention

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/expense-tracker |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.