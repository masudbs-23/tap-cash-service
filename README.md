# TapCash - Mobile Financial Service (mFS) Backend API

A production-ready backend API for mobile financial services built with Node.js, Express, PostgreSQL, and Sequelize ORM.

## Features

- **User Authentication**
  - Signup with phone and PIN
  - OTP verification
  - JWT-based authentication
  - Forgot password with OTP reset
  - PIN reset functionality

- **Wallet System**
  - Automatic wallet creation on signup
  - Initial balance (50) welcome bonus
  - Referral bonus system (20)
  - Send money with transaction
  - Transaction history
  - Balance and reserved balance tracking

- **Security**
  - Helmet for HTTP headers security
  - Rate limiting
  - JWT authentication
  - bcrypt for password hashing
  - Input validation with express-validator
  - SQL injection protection via Sequelize ORM
  - Centralized error handling

- **Architecture**
  - Clean architecture with separation of concerns
  - Schema files for model definitions only
  - Model files for business logic
  - Controller files for request handling
  - Middleware for authentication, validation, and error handling
  - Helper functions for reusability

## Tech Stack

- **Runtime**: Node.js (Latest LTS)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **File Upload**: multer
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan
- **UUID**: uuid

## Project Structure

```
src
 ├── config          # Configuration files
 ├── database         # Database setup and models
 ├── middleware      # Custom middleware
 ├── utils           # Utility functions
 ├── routes          # API routes
 ├── controllers     # Request handlers
 ├── models          # Business logic
 ├── schemas         # Sequelize model definitions
 ├── constants       #常量
 ├── helpers         # Helper functions
 ├── uploads         # File upload directory
 ├── app.js          # Express app setup
 └── server.js       # Server entry point
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=tapcash
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

UPLOAD_DIR=src/uploads
MAX_FILE_SIZE=5242880

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Setup PostgreSQL database:
```bash
createdb tapcash
```

5. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "phone": "1234567890",
  "pin": "1234",
  "referral_code": "REFABC123" // optional
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "1234567890",
  "otp": "1234"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "1234567890",
  "pin": "1234"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "phone": "1234567890"
}
```

#### Verify Forgot OTP
```http
POST /api/auth/verify-forgot-otp
Content-Type: application/json

{
  "phone": "1234567890",
  "otp": "1234"
}
```

#### Reset PIN
```http
POST /api/auth/reset-pin
Content-Type: application/json

{
  "phone": "1234567890",
  "otp": "1234",
  "new_pin": "1234",
  "confirm_pin": "1234"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "John Doe"
}
// profile_image: file (optional)
```

### Wallet

#### Send Money
```http
POST /api/wallet/send-money
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver_phone": "0987654321",
  "amount": 100,
  "pin": "1234"
}
```

#### Get Transaction History
```http
GET /api/wallet/transactions?limit=20&offset=0
Authorization: Bearer <token>
```

#### Get Transaction by ID
```http
GET /api/wallet/transactions/:trxId
Authorization: Bearer <token>
```

### Health Check
```http
GET /api/health
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Database Schema

### Users Table
- id (UUID, Primary Key)
- phone (String, Unique)
- pin (String, Hashed)
- name (String)
- profile_image (String)
- referral_code (String, Unique)
- referred_by (String)
- is_verified (Boolean)
- otp (String)
- otp_expiry (Date)
- created_at (Timestamp)
- updated_at (Timestamp)

### Wallets Table
- id (Integer, Primary Key)
- user_id (UUID, Foreign Key)
- balance (Decimal)
- reserved_balance (Decimal)
- created_at (Timestamp)
- updated_at (Timestamp)

### Wallet Transactions Table
- id (Integer, Primary Key)
- trx_id (String, Unique)
- sender_wallet (Integer, Foreign Key)
- receiver_wallet (Integer, Foreign Key)
- amount (Decimal)
- fee (Decimal)
- status (Enum: PENDING, RESERVED, SUCCESS, FAILED)
- type (Enum: SEND_MONEY, REFERRAL_BONUS, WELCOME_BONUS)
- created_at (Timestamp)

## Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Prevents abuse by limiting request rate
- **JWT**: Secure token-based authentication
- **bcrypt**: Secure password hashing
- **Input Validation**: Validates all incoming requests
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection
- **Environment Variables**: Sensitive data stored in environment variables

## Transaction Flow (Send Money)

1. Verify sender PIN
2. Verify receiver exists
3. Check sender and receiver are not the same
4. Validate amount is positive
5. Check available balance (balance - reserved_balance)
6. Begin PostgreSQL transaction
7. Reserve sender amount (increment reserved_balance)
8. Create transaction with status RESERVED
9. Deduct from sender balance
10. Release reserved balance
11. Add to receiver balance
12. Update transaction status to SUCCESS
13. Commit transaction
14. If any step fails, rollback entire transaction

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Sync
The application automatically syncs the database schema on startup. To force recreate tables:
- Set `force: true` in `src/server.js` in the `syncDatabase()` call

## License

ISC
