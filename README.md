# 💳 Wallet Transaction System

A backend wallet management system built using **Node.js** and **Express.js** that allows users to create wallets, deposit money, transfer funds, and track transaction history.

This project simulates the core backend logic of a digital wallet system where each user has a wallet and can perform financial transactions securely.

---

# 🚀 Features

* User registration
* Automatic wallet creation for each user
* Deposit money into wallet
* Transfer money between users
* Check wallet balance
* View transaction history
* Basic validation for transactions

---

# 🏗 Project Architecture

The application follows a layered backend architecture:

Client Request
  ↓
Routes
  ↓
Controllers
  ↓
Business Logic / Services
  ↓
Database

### Components

**Routes**

* Define API endpoints
* Handle incoming HTTP requests

**Controllers**

* Process request data
* Call business logic functions
* Send response to client

**Services / Logic**

* Handle wallet operations
* Manage transaction processing

**Database**

* Stores users, wallets, and transactions

---

# 📂 Project Structure

```
wallet-transaction-assignment
│
├── controllers
│   ├── userController.js
│   └── walletController.js
│
├── routes
│   ├── userRoutes.js
│   └── walletRoutes.js
│
├── models
│   ├── User.js
│   ├── Wallet.js
│   └── Transaction.js
│
├── config
│   └── db.js
│
├── app.js
└── package.json
```

---

# 🗄 Database Design

### Users Table

| Field | Description    |
| ----- | -------------- |
| id    | Unique user ID |
| name  | User name      |
| email | User email     |

---

### Wallet Table

| Field   | Description            |
| ------- | ---------------------- |
| id      | Wallet ID              |
| user_id | Linked user            |
| balance | Current wallet balance |

---

### Transactions Table

| Field     | Description        |
| --------- | ------------------ |
| id        | Transaction ID     |
| amount    | Transaction amount |
| type      | Deposit / Transfer |
| user_id   | Related user       |
| timestamp | Transaction time   |

---

# 🔄 Workflow

### 1️⃣ User Registration

POST /users/register

Steps:

1. Create a new user
2. Create a wallet for the user
3. Set wallet balance to 0

---

### 2️⃣ Deposit Money

POST /wallet/deposit

Steps:

1. Validate user
2. Add amount to wallet
3. Record transaction in database

---

### 3️⃣ Transfer Money

POST /wallet/transfer

Steps:

1. Verify sender and receiver
2. Check sender wallet balance
3. Deduct money from sender
4. Add money to receiver wallet
5. Record transaction

---

### 4️⃣ Get Wallet Balance

GET /wallet/:userId

Returns the current wallet balance for a user.

---

### 5️⃣ Get Transaction History

GET /transactions/:userId

Returns all transactions performed by the user.

---

# 🛠 Tech Stack

Backend:

* Node.js
* Express.js

Database:

* SQL / NoSQL (depending on configuration)

Tools:

* Postman for API testing
* Git for version control

---

# ▶️ Installation

Clone the repository

```
git clone https://github.com/Adarsh01302/wallet-transaction-assignment.git
```

Navigate to project directory

```
cd wallet-transaction-assignment
```

Install dependencies

```
npm install
```

Run the server

```
npm start
```

Server will start on:

```
http://localhost:3000
```

---

# 📌 Example Transaction

Initial Balance

User A → ₹2000
User B → ₹1000

User A transfers ₹500 to User B

Result:

User A → ₹1500
User B → ₹1500

Transactions recorded:

A → -500
B → +500

---

# 📈 Future Improvements

* JWT authentication
* Transaction rollback support
* API rate limiting
* Better error handling
* Unit testing
* Security improvements

---

# 👨‍💻 Author

Adarsh Mishra
MCA Student | Backend Developer

GitHub:
https://github.com/Adarsh01302
