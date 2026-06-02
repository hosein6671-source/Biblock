````markdown name=docs/API.md
# 📚 Backend API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

## Endpoints

### Users

#### Get User by ID
```
GET /api/users/:id
```

#### Get User by Telegram ID
```
GET /api/users/telegram/:telegramId
```

#### Get All Users (Admin)
```
GET /api/users
```

#### Ban User (Admin)
```
POST /api/users/:id/ban
```

### Plans

#### Get All Plans
```
GET /api/plans
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Basic",
    "price_usdt": 5.00,
    "traffic_gb": 10,
    "duration_days": 30,
    "speed_limit_mbps": 0,
    "device_limit": 5,
    "is_active": true
  }
]
```

#### Get Plan by ID
```
GET /api/plans/:id
```

#### Create Plan (Admin)
```
POST /api/plans
Content-Type: application/json

{
  "name": "Premium",
  "price_usdt": 15.00,
  "traffic_gb": 100,
  "duration_days": 30,
  "speed_limit_mbps": 100,
  "device_limit": 10
}
```

#### Update Plan (Admin)
```
PUT /api/plans/:id
Content-Type: application/json

{
  "name": "Premium Plus",
  "price_usdt": 20.00,
  "is_active": true
}
```

#### Delete Plan (Admin)
```
DELETE /api/plans/:id
```

### Orders

#### Create Order
```
POST /api/orders
Content-Type: application/json

{
  "user_id": "user-uuid",
  "plan_id": "plan-uuid",
  "amount": 5.00
}
```

#### Get Order by ID
```
GET /api/orders/:id
```

#### Get User Orders
```
GET /api/orders/user/:userId
```

#### Get All Orders (Admin)
```
GET /api/orders
```

### Subscriptions

#### Get Subscription by ID
```
GET /api/subscriptions/:id
```

#### Get User Subscriptions
```
GET /api/subscriptions/user/:userId
```

#### Get Subscription by UUID
```
GET /api/subscriptions/uuid/:uuid
```

### Payments

#### Create Payment
```
POST /api/payments/create
Content-Type: application/json

{
  "orderId": "order-uuid",
  "amount": 5.00,
  "currency": "USDT"
}
```

**Response:**
```json
{
  "id": "payment-uuid",
  "transaction_id": "np_xxx",
  "payment_address": "TW...",
  "currency": "USDT",
  "amount": 5.00,
  "status": "PENDING"
}
```

#### Verify Payment
```
GET /api/payments/:transactionId/verify
```

#### Get Payment by Order
```
GET /api/payments/order/:orderId
```

#### Webhook (NowPayments IPN)
```
POST /api/payments/webhook
Content-Type: application/json

{
  "payment_id": "xxx",
  "payment_status": "CONFIRMED",
  "pay_amount": "5.00"
}
```

### Admin

#### Dashboard Stats
```
GET /api/admin/dashboard
```

**Response:**
```json
{
  "totalUsers": 100,
  "totalOrders": 50,
  "timestamp": "2026-06-02T13:00:00Z"
}
```

#### Get All Users
```
GET /api/admin/users
```

#### Get All Orders
```
GET /api/admin/orders
```

#### Get Total Revenue
```
GET /api/admin/revenue
```

**Response:**
```json
{
  "totalRevenue": 250.00,
  "currency": "USDT"
}
```

#### Log Action
```
POST /api/admin/logs
Content-Type: application/json

{
  "admin_id": "user-uuid",
  "action": "USER_BANNED",
  "details": { "user_id": "xxx" }
}
```

#### Get Logs
```
GET /api/admin/logs
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```
````