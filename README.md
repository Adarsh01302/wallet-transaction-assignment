### Wallet & Order Transaction System

**Tech stack**: Node.js, Express, SQLite (better-sqlite3).

### Project structure (MVC style)

This is an API-only backend, organized as **Routes → Controllers → Models**:

- **Entry**
  - `src/server.js`: starts the HTTP server (`app.listen`)
  - `src/app.js`: builds the Express app, middleware, mounts routes
- **Routes**
  - `src/routes/adminRoutes.js`: `/admin/*`
  - `src/routes/orderRoutes.js`: `/orders/*`
  - `src/routes/walletRoutes.js`: `/wallet/*`
- **Controllers**
  - `src/controllers/adminController.js`
  - `src/controllers/orderController.js`
  - `src/controllers/walletController.js`
- **Models (DB logic)**
  - `src/models/walletModel.js`
  - `src/models/orderModel.js`
- **DB init**
  - `src/db.js`: SQLite setup + table creation (creates `data.sqlite`)
- **Utilities**
  - `src/utils/amount.js`: amount parsing (stored in cents)

### Setup

- **Install dependencies**

```bash
cd e:\\Assiment
npm install
```

- **Run the server**

```bash
npm start
```

Server runs on **http://localhost:3000** by default.

### Testing with Postman

Use `http://localhost:3000` as the base URL.

- **Admin requests (credit/debit)**
  - **Header**: `Content-Type: application/json`
  - **Body**: raw JSON
- **Client requests**
  - **Header**: `client-id: <CLIENT_ID>`
  - Add `Content-Type: application/json` for POST requests

Important: ensure there are **no spaces** in the URL (a leading space becomes `%20` and causes `Cannot POST /%20/...`).

### Data model (SQLite)

- **clients**: `id`
- **wallets**: `client_id`, `balance_cents`
- **wallet_ledger**: `id`, `client_id`, `change_cents`, `type`, `reference_id`
- **orders**: `id`, `client_id`, `amount_cents`, `status`, `fulfillment_id`

Amounts are stored in **cents** for accuracy; API exposes amounts as decimal numbers.

### Key behaviors / edge cases

- **Atomic order debit + creation**: order creation + wallet debit + ledger entry are executed in a single SQLite transaction.
- **Insufficient funds**: returns `400` with `{ "error": "Insufficient wallet balance" }`.
- **Fulfillment failure**:
  - The order is **kept** (wallet is already debited) and order `status` becomes `fulfillment_failed`.
  - API returns `502` with `{ "error": "Order created but fulfillment failed", "order_id": <id> }`.
- **Order visibility**: `GET /orders/:orderId` returns `404` if the order does not belong to the `client-id`.

### APIs

- **Admin – Credit Wallet**
  - **POST** `/admin/wallet/credit`
  - **Body**:

```json
{
  "client_id": "CLIENT_1",
  "amount": 100.5
}
```

  - **Response**:

```json
{
  "client_id": "CLIENT_1",
  "balance": 100.5
}
```

- **Admin – Debit Wallet**
  - **POST** `/admin/wallet/debit`
  - **Body**:

```json
{
  "client_id": "CLIENT_1",
  "amount": 50
}
```

  - **Errors**:
    - `400` if insufficient balance or invalid amount.

- **Client – Create Order**
  - **POST** `/orders`
  - **Headers**:
    - `client-id: CLIENT_1`
  - **Body**:

```json
{
  "amount": 25
}
```

  - **Behavior**:
    - Validates wallet balance.
    - Deducts amount from wallet inside a DB transaction.
    - Creates order row.
    - Calls fulfillment API `https://jsonplaceholder.typicode.com/posts` with:

```json
{
  "userId": "<CLIENT_ID>",
  "title": "<ORDER_ID>"
}
```

    - Stores returned `id` as `fulfillment_id`.
    - If fulfillment fails, order is kept with status `fulfillment_failed`.

  - **Success response** (`201`):

```json
{
  "order_id": 1,
  "client_id": "CLIENT_1",
  "amount": 25,
  "status": "fulfilled",
  "fulfillment_id": "101"
}
```

- **Client – Get Order Details**
  - **GET** `/orders/{order_id}`
  - **Headers**:
    - `client-id: CLIENT_1`
  - **Response**:

```json
{
  "order_id": 1,
  "client_id": "CLIENT_1",
  "amount": 25,
  "status": "fulfilled",
  "fulfillment_id": "101",
  "created_at": "2026-03-13T10:00:00Z"
}
```

  - **Errors**:
    - `404` if order not found for that client.

- **Wallet Balance**
  - **GET** `/wallet/balance`
  - **Headers**:
    - `client-id: CLIENT_1`
  - **Response**:

```json
{
  "client_id": "CLIENT_1",
  "balance": 75
}
```

### Sample cURL commands

- **Credit wallet**

```bash
curl -X POST http://localhost:3000/admin/wallet/credit \
  -H "Content-Type: application/json" \
  -d '{"client_id":"CLIENT_1","amount":100}'
```

- **Debit wallet**

```bash
curl -X POST http://localhost:3000/admin/wallet/debit \
  -H "Content-Type: application/json" \
  -d '{"client_id":"CLIENT_1","amount":20}'
```

- **Create order**

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "client-id: CLIENT_1" \
  -d '{"amount":25}'
```

- **Get order**

```bash
curl http://localhost:3000/orders/1 \
  -H "client-id: CLIENT_1"
```

- **Get wallet balance**

```bash
curl http://localhost:3000/wallet/balance \
  -H "client-id: CLIENT_1"
```

