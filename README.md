### Wallet & Order Transaction System

**Tech stack**: Node.js, Express, SQLite (better-sqlite3).

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

### Data model (SQLite)

- **clients**: `id`
- **wallets**: `client_id`, `balance_cents`
- **wallet_ledger**: `id`, `client_id`, `change_cents`, `type`, `reference_id`
- **orders**: `id`, `client_id`, `amount_cents`, `status`, `fulfillment_id`

Amounts are stored in **cents** for accuracy; API exposes amounts as decimal numbers.

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

