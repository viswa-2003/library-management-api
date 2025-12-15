# 📚 Library Management API

A comprehensive RESTful API for managing library operations including **books, members, borrowing transactions, and fines**, with **finite state machine (FSM)** implementation for resource lifecycle management.

This project demonstrates **real-world backend design**, **business rule enforcement**, and **robust state handling** using Node.js, Express, and PostgreSQL.

---

## 📋 Features

### 📘 Book Management
- Full CRUD operations
- Book status tracking using FSM:
  - `available`
  - `borrowed`
  - `reserved`
  - `maintenance`

### 👤 Member Management
- Member registration and updates
- Member status:
  - `active`
  - `suspended`

### 🔄 Borrowing System
- Borrow & return workflow
- Automatic due date calculation (14 days)
- Prevents invalid borrow actions

### 💰 Fine System
- Automatic overdue fine calculation
- $0.50 per day penalty
- Fine payment handling

### 🎮 State Machine
- Prevents invalid book state transitions
- Centralized FSM logic for consistency

### ⚖️ Business Rules Enforcement
- Max **3 books per member**
- **14-day** loan period
- **$0.50/day** overdue fine
- Borrowing blocked if unpaid fines exist
- Member suspended after **3 overdue books**

---

## 🏗️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **State Management:** Custom Finite State Machine
- **Testing:** curl / Postman
- **Environment:** dotenv

---

## 📁 Project Structure

library-management-api/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── models/
│   │   ├── Book.js              # Book model definition
│   │   ├── Member.js            # Member model definition
│   │   ├── Transaction.js       # Transaction model definition
│   │   ├── Fine.js              # Fine model definition
│   │   └── index.js             # Model associations
│   ├── controllers/
│   │   ├── book.controller.js   # Book route controllers
│   │   ├── member.controller.js # Member route controllers
│   │   ├── transaction.controller.js # Transaction controllers
│   │   └── fine.controller.js   # Fine route controllers
│   ├── services/
│   │   ├── book.service.js      # Book business logic
│   │   ├── member.service.js    # Member business logic
│   │   ├── transaction.service.js # Transaction logic
│   │   ├── fine.service.js      # Fine calculation logic
│   │   └── stateMachine.service.js # State machine implementation
│   ├── routes/
│   │   ├── book.routes.js       # Book API routes
│   │   ├── member.routes.js     # Member API routes
│   │   ├── transaction.routes.js # Transaction routes
│   │   └── fine.routes.js       # Fine API routes
│   ├── utils/
│   │   ├── date.util.js         # Date calculation utilities
│   │   └── error.util.js        # Error handling utilities
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── postman/
│   └── library-api.postman_collection.json  # Postman collection
├── tests/                       # Test scripts
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # This documentation

⚙️ Prerequisites
Node.js (v14 or higher)

PostgreSQL (v12 or higher)

npm or yarn package manager

🚀 Installation & Setup
1. Clone the Repository

git clone <your-repository-url>
cd library-management-api
2. Install Dependencies

npm install
3. Database Setup
Create PostgreSQL Database:

-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE library_management;

-- Verify database creation
\l
4. Environment Configuration
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use any text editor
.env Configuration:

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_management
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_DIALECT=postgres

# Library Business Rules
FINE_PER_DAY=0.50
LOAN_PERIOD_DAYS=14
MAX_BOOKS_PER_MEMBER=3
MAX_OVERDUE_FOR_SUSPENSION=3
5. Initialize Database

# Sync database models (creates tables)
npm run db:setup

# Alternative: Run directly
node setup-db.js
6. Start the Server

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
7. Verify Installation

# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"...","message":"Library Management API is running"}
📊 Database Schema
Books Table

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn VARCHAR(13) UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  author VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('available', 'borrowed', 'reserved', 'maintenance')),
  total_copies INTEGER NOT NULL CHECK (total_copies >= 1),
  available_copies INTEGER NOT NULL CHECK (available_copies >= 0 AND available_copies <= total_copies),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
Members Table

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  membership_number VARCHAR UNIQUE NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE RESTRICT,
  member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
  borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'returned', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
Fines Table
CREATE TABLE fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE RESTRICT,
  member_id UUID REFERENCES members(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
🌐 API Documentation
Base URL
Download
http://localhost:3000
Authentication
No authentication required for this implementation.

Response Format
All responses follow this format:
{
  "success": boolean,
  "data": object | array,
  "error": string,  // only present when success is false
  "pagination": {   // only for list endpoints
    "total": number,
    "page": number,
    "pages": number
  }
}
Endpoints
Health Check
GET /health

Response (200):
{
  "status": "OK",
  "timestamp": "2025-12-15T15:10:41.330Z",
  "message": "Library Management API is running"
}
📚 Books Endpoints
Create a Book
POST /api/books

Request:
{
  "isbn": "9781234567890",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": "Classic",
  "total_copies": 5,
  "available_copies": 5,  // optional, defaults to total_copies
  "status": "available"   // optional, defaults to "available"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "d4b3c9ae-4534-4c62-a93a-aefa08f72ca8",
    "isbn": "9781234567890",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "category": "Classic",
    "status": "available",
    "total_copies": 5,
    "available_copies": 5,
    "createdAt": "2025-12-15T15:10:41.330Z",
    "updatedAt": "2025-12-15T15:10:41.330Z"
  }
}
Get All Books
GET /api/books
Query Parameters:

page (optional): Page number, default: 1

limit (optional): Items per page, default: 10

Response (200):
{
  "success": true,
  "books": [
    {
      "id": "d4b3c9ae-4534-4c62-a93a-aefa08f72ca8",
      "isbn": "9781234567890",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "category": "Classic",
      "status": "available",
      "total_copies": 5,
      "available_copies": 5,
      "createdAt": "2025-12-15T15:10:41.330Z",
      "updatedAt": "2025-12-15T15:10:41.330Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
Get Available Books
GET /api/books/available

Response (200):
{
  "success": true,
  "books": [...],
  "pagination": {...}
}
Get Book by ID
GET /api/books/:id

Response (200):
{
  "success": true,
  "data": {
    "id": "d4b3c9ae-4534-4c62-a93a-aefa08f72ca8",
    "isbn": "9781234567890",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "category": "Classic",
    "status": "available",
    "total_copies": 5,
    "available_copies": 5,
    "createdAt": "2025-12-15T15:10:41.330Z",
    "updatedAt": "2025-12-15T15:10:41.330Z",
    "transactions": [...]
  }
}
Update Book
PUT /api/books/:id

Request:
{
  "title": "The Great Gatsby - Updated Edition",
  "category": "Classic Literature"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "d4b3c9ae-4534-4c62-a93a-aefa08f72ca8",
    "title": "The Great Gatsby - Updated Edition",
    "category": "Classic Literature",
    ...
  }
}
Delete Book
DELETE /api/books/:id

Response (200):
{
  "success": true,
  "message": "Book deleted successfully"
}
Update Book Status
PATCH /api/books/:id/status

Request:
{
  "status": "maintenance"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "d4b3c9ae-4534-4c62-a93a-aefa08f72ca8",
    "status": "maintenance",
    ...
  }
}
👤 Members Endpoints
Create a Member
POST /api/members


Request:
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "1623e81a-25d9-4ebb-9989-673c9c44e164",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "membership_number": "M1765811442237",
    "status": "active",
    "createdAt": "2025-12-15T15:10:42.238Z",
    "updatedAt": "2025-12-15T15:10:42.238Z"
  }
}
Get All Members
GET /api/members

Response (200):
{
  "success": true,
  "members": [...],
  "pagination": {...}
}
Get Member by ID
GET /api/members/:id

Response (200):
{
  "success": true,
  "data": {
    "id": "1623e81a-25d9-4ebb-9989-673c9c44e164",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "membership_number": "M1765811442237",
    "status": "active",
    "createdAt": "2025-12-15T15:10:42.238Z",
    "updatedAt": "2025-12-15T15:10:42.238Z",
    "transactions": [...],
    "fines": [...]
  }
}
Update Member
PUT /api/members/:id

Request:
{
  "name": "John Smith",
  "status": "active"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "1623e81a-25d9-4ebb-9989-673c9c44e164",
    "name": "John Smith",
    "status": "active",
    ...
  }
}
Delete Member
DELETE /api/members/:id

Response (200):
{
  "success": true,
  "message": "Member deleted successfully"
}
Get Member's Borrowed Books
GET /api/members/:id/borrowed

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "f8800643-51e0-41b0-a765-92e021c4c4b5",
      "status": "active",
      "borrowed_at": "2025-12-15T15:10:43.959Z",
      "due_date": "2025-12-29T15:10:43.959Z",
      "book": {
        "id": "613e7121-bfd5-48c6-aff0-20f0bfb986b2",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald"
      }
    }
  ]
}
Get Member's Fines
GET /api/members/:id/fines

Response (200):
{
  "success": true,
  "fines": [...],
  "total": 15.50
}
🔄 Transactions Endpoints
Borrow a Book
POST /api/transactions/borrow

Request:
{
  "book_id": "613e7121-bfd5-48c6-aff0-20f0bfb986b2",
  "member_id": "051d90a7-3751-4b96-9744-0c79bd785f91"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "f8800643-51e0-41b0-a765-92e021c4c4b5",
    "status": "active",
    "book_id": "613e7121-bfd5-48c6-aff0-20f0bfb986b2",
    "member_id": "051d90a7-3751-4b96-9744-0c79bd785f91",
    "borrowed_at": "2025-12-15T15:10:43.959Z",
    "due_date": "2025-12-29T15:10:43.959Z",
    "returned_at": null,
    "createdAt": "2025-12-15T15:10:43.960Z",
    "updatedAt": "2025-12-15T15:10:43.960Z"
  }
}
Return a Book
POST /api/transactions/:id/return

Response (200):
{
  "success": true,
  "data": {
    "id": "f8800643-51e0-41b0-a765-92e021c4c4b5",
    "status": "returned",
    "returned_at": "2025-12-15T15:11:00.000Z",
    "updatedAt": "2025-12-15T15:11:00.000Z"
  }
}
Get All Transactions
GET /api/transactions
Query Parameters:

page, limit: Pagination

status: Filter by status (active, returned, overdue)

member_id: Filter by member

book_id: Filter by book

Response (200):
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
Get Overdue Transactions
GET /api/transactions/overdue

Response (200):
{
  "success": true,
  "transactions": [...],
  "pagination": {...}
}
Get Transaction by ID
GET /api/transactions/:id

Response (200):
{
  "success": true,
  "data": {
    "id": "f8800643-51e0-41b0-a765-92e021c4c4b5",
    "status": "returned",
    "book_id": "613e7121-bfd5-48c6-aff0-20f0bfb986b2",
    "member_id": "051d90a7-3751-4b96-9744-0c79bd785f91",
    "borrowed_at": "2025-12-15T15:10:43.959Z",
    "due_date": "2025-12-29T15:10:43.959Z",
    "returned_at": "2025-12-15T15:11:00.000Z",
    "createdAt": "2025-12-15T15:10:43.960Z",
    "updatedAt": "2025-12-15T15:11:00.000Z",
    "book": {...},
    "member": {...},
    "fine": {...}
  }
}
Get Member's Transactions
GET /api/members/:memberId/transactions

Response (200):
{
  "success": true,
  "data": [...]
}
💰 Fines Endpoints
Get All Fines
GET /api/fines
Query Parameters:

page, limit: Pagination

paid: Filter by payment status (true/false)

member_id: Filter by member

Response (200):
{
  "success": true,
  "fines": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "amount": 5.50,
      "paid_at": null,
      "createdAt": "2025-12-15T15:20:00.000Z",
      "member": {
        "id": "051d90a7-3751-4b96-9744-0c79bd785f91",
        "name": "John Doe"
      },
      "transaction": {
        "id": "f8800643-51e0-41b0-a765-92e021c4c4b5",
        "due_date": "2025-12-29T15:10:43.959Z"
      }
    }
  ],
  "total_unpaid": 5.50,
  "pagination": {...}
}
Get Fine by ID
GET /api/fines/:id

Response (200):
{
  "success": true,
  "data": {...}
}
Pay Fine
POST /api/fines/:id/pay

Response (200):
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "amount": 5.50,
    "paid_at": "2025-12-15T15:25:00.000Z",
    "updatedAt": "2025-12-15T15:25:00.000Z"
  },
  "message": "Fine paid successfully"
}
Calculate Member's Fines
GET /api/members/:memberId/fines/calculate

Response (200):
{
  "success": true,
  "fines": 2,
  "total_amount": 15.50,
  "details": [...]
}
🎮 State Machine Implementation
Book Status State Machine
States:
available - Book can be borrowed

borrowed - Book is currently borrowed

reserved - Book is reserved for a member

maintenance - Book is under maintenance

Valid Transitions:
available → borrowed    (When book is borrowed)
borrowed → available    (When book is returned)
available → reserved    (When book is reserved)
reserved → available    (When reservation is cancelled)
any state → maintenance (When book needs maintenance)
maintenance → available (When maintenance is complete)
State Transition Logic:
// Example from stateMachine.service.js
static async borrowBook(bookId, memberId) {
  // 1. Validate can borrow
  await this.canBorrowBook(bookId, memberId);
  
  // 2. Update book status
  const book = await Book.findByPk(bookId);
  await book.update({
    available_copies: book.available_copies - 1,
    status: book.available_copies - 1 === 0 ? 'borrowed' : 'available'
  });
}
Transaction Status State Machine
States:
active - Book is currently borrowed

returned - Book has been returned

overdue - Book is past due date

Automatic Status Updates:
Active → Overdue (when due_date passes)

Overdue status is checked automatically on relevant endpoints

⚖️ Business Rules Enforcement
1. Borrowing Limits
// Maximum 3 books per member
const activeTransactions = await Transaction.count({
  where: { member_id: memberId, status: 'active' }
});
if (activeTransactions >= MAX_BOOKS_PER_MEMBER) {
  throw new AppError(`Member cannot borrow more than ${MAX_BOOKS_PER_MEMBER} books`, 400);
}
2. Loan Period Calculation
// 14-day loan period
const dueDate = new Date(borrowed_at);
dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);
3. Overdue Fine Calculation
// $0.50 per day overdue
const calculateFineAmount = (dueDate, finePerDay = 0.50) => {
  const overdueDays = calculateOverdueDays(dueDate);
  return overdueDays * finePerDay;
};
4. Member Suspension
// Suspend member with 3+ overdue books
const overdueBooks = await Transaction.count({
  where: { member_id: memberId, status: 'overdue' }
});
if (overdueBooks >= MAX_OVERDUE_FOR_SUSPENSION) {
  await member.update({ status: 'suspended' });
}
5. Block Borrowing with Unpaid Fines
// Check for unpaid fines
const unpaidFines = await Fine.findOne({
  where: { member_id: memberId, paid_at: null }
});
if (unpaidFines) {
  throw new AppError('Member has unpaid fines and cannot borrow books', 400);
}
🧪 Testing
Automated Tests
Run the complete test suite:

# Install test dependencies
npm install axios

# Run comprehensive test
node test-complete.js

# Run business rules test
node test-business-rules.js

# Run borrow/return test
node test-borrow-return.js
Manual Testing with curl
# Health check
curl http://localhost:3000/health

# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"9781234567890","title":"Test Book","author":"Author","category":"Test","total_copies":3}'

# Create a member
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Borrow a book
curl -X POST http://localhost:3000/api/transactions/borrow \
  -H "Content-Type: application/json" \
  -d '{"book_id":"book-uuid","member_id":"member-uuid"}'

# Return a book
curl -X POST http://localhost:3000/api/transactions/transaction-uuid/return

# Get available books
curl http://localhost:3000/api/books/available

# Get overdue transactions
curl http://localhost:3000/api/transactions/overdue
Postman Collection
Import postman/library-api.postman_collection.json into Postman for easy API testing.

🚨 Error Handling
HTTP Status Codes
200 OK - Successful GET, PUT, DELETE requests

201 Created - Successful POST requests

400 Bad Request - Invalid input, business rule violation

404 Not Found - Resource not found

409 Conflict - Duplicate entry (e.g., duplicate ISBN)

500 Internal Server Error - Server error

Error Response Format
{
  "success": false,
  "error": "Descriptive error message"
}
Common Error Messages
"Book is currently borrowed" - Trying to borrow an already borrowed book

"Member cannot borrow more than 3 books" - Borrowing limit exceeded

"Member has unpaid fines and cannot borrow books" - Fine restriction

"Member is suspended and cannot borrow books" - Suspended member

"No copies available for borrowing" - All copies are borrowed

"Book has already been returned" - Trying to return already returned book

🔧 Environment Variables
Variable	Description	Default
PORT	Server port	3000
NODE_ENV	Environment mode	development
DB_HOST	Database host	localhost
DB_PORT	Database port	5432
DB_NAME	Database name	library_management
DB_USER	Database user	postgres
DB_PASSWORD	Database password	-
DB_DIALECT	Database dialect	postgres
FINE_PER_DAY	Overdue fine per day	0.50
LOAN_PERIOD_DAYS	Book loan period	14
MAX_BOOKS_PER_MEMBER	Max books per member	3
MAX_OVERDUE_FOR_SUSPENSION	Overdue books for suspension	3
📈 API Usage Examples
Complete Workflow Example
# 1. Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"9780061120084","title":"To Kill a Mockingbird","author":"Harper Lee","category":"Fiction","total_copies":5}'

# 2. Create a member
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","email":"alice@example.com"}'

# 3. Borrow the book (using IDs from above)
curl -X POST http://localhost:3000/api/transactions/borrow \
  -H "Content-Type: application/json" \
  -d '{"book_id":"book-id","member_id":"member-id"}'

# 4. Check borrowed books
curl http://localhost:3000/api/members/member-id/borrowed

# 5. Return the book
curl -X POST http://localhost:3000/api/transactions/transaction-id/return

# 6. Verify book is available again
curl http://localhost:3000/api/books/book-id
Testing Business Rules
// Test borrowing limit
// Try to borrow 4 books with same member
// 4th attempt should fail with "Member cannot borrow more than 3 books"

// Test overdue fines
// Return a book after due date
// Check if fine is automatically created

// Test member suspension
// Create 3 overdue transactions for a member
// Check if member status changes to 'suspended'
🐛 Troubleshooting
Common Issues
Database Connection Failed

# Check PostgreSQL is running
sudo service postgresql status

# Check database exists
psql -U postgres -c "\l"

# Verify .env credentials
cat .env
Port Already in Use

# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
Missing Dependencies
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
Sequelize Sync Errors
# Drop and recreate database
psql -U postgres -c "DROP DATABASE library_management;"
psql -U postgres -c "CREATE DATABASE library_management;"
npm run db:setup
Debug Mode
Enable detailed logging in src/app.js:
// Add before route definitions
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Body:', req.body);
  next();
});
📚 API Design Decisions
1. RESTful Principles
Resources: Books, Members, Transactions, Fines

HTTP Methods: Proper use of GET, POST, PUT, DELETE, PATCH

Status Codes: Appropriate HTTP status codes

Idempotency: PUT and DELETE operations are idempotent

2. State Management
Centralized state machine service

Prevents invalid state transitions

Ensures data consistency

3. Business Logic Separation
Controllers handle HTTP layer

Services contain business logic

Models handle data operations

Utilities for reusable functions

4. Error Handling Strategy
Centralized error handling middleware

Consistent error response format

Detailed error messages for debugging

Appropriate HTTP status codes

🔮 Future Enhancements
Authentication & Authorization

JWT-based authentication

Role-based access control (admin, librarian, member)

Email Notifications

Due date reminders

Overdue notifications

Fine notifications

Advanced Features

Book reservations

Waitlists for popular books

Book reviews and ratings

Analytics dashboard

Performance Improvements

Redis caching

Database indexing optimization

API rate limiting

Deployment

Docker containerization

CI/CD pipeline

Monitoring and logging

Testing

Unit tests with Jest

Integration tests

Load testing

📄 License
MIT License - see LICENSE file for details

👥 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

🙏 Acknowledgments
Express.js team for the excellent framework

Sequelize team for the powerful ORM

PostgreSQL for the reliable database

All open-source contributors whose libraries made this project possible

📞 Support
For support, email vijaytamada333@gmail.com or open an issue in the GitHub repository.

Happy Coding! 🚀

