# GetReach PHP Backend

Node.js backend ka exact PHP version. Sare endpoints same hain.

## Requirements
- PHP 8.1+
- MongoDB PHP extension (`ext-mongodb`)
- Composer

## Setup

```bash
cd backend-php
composer install
cp .env.example .env
# .env mein apni values fill karo
```

## Apache pe deploy karna
`.htaccess` already hai — bas `DocumentRoot` ko `backend-php/` folder pe point karo.

## PHP built-in server (local testing)
```bash
php -S localhost:5000 index.php
```

## Endpoints (Node.js ke bilkul same)

| Method | URL | Description |
|--------|-----|-------------|
| GET    | /health | Health check |
| POST   | /api/register | Register |
| POST   | /api/login | Login |
| POST   | /api/admin-auth | Admin login |
| POST   | /api/forgot-password | Password reset email |
| POST   | /api/reset-password | Reset password |
| GET    | /api/users | All users (admin) |
| PATCH  | /api/users/:id/reset-password | Admin reset user password |
| PATCH  | /api/users/:id/add-balance | Admin add balance |
| GET    | /api/orders/balance | API balance |
| GET    | /api/orders/services | Services list |
| POST   | /api/orders/place-order | Place order |
| GET    | /api/orders/order-status/:id | Order status |
| GET    | /api/orders/all | All orders (admin) |
| GET    | /api/orders/user/:userId | User orders |
| POST   | /api/orders/cancel/:id | Cancel order |
| GET    | /api/orders/admin/services | Admin services |
| PUT    | /api/orders/admin/services/:id | Save override |
| DELETE | /api/orders/admin/services/:id | Delete override |
| POST   | /api/fund-requests | Submit fund request |
| GET    | /api/fund-requests/user/:userId | User fund requests |
| GET    | /api/fund-requests | All fund requests (admin) |
| PATCH  | /api/fund-requests/:id | Approve/reject |
| POST   | /api/tickets | Create ticket |
| GET    | /api/tickets | Get tickets |
| PATCH  | /api/tickets/:id | Update ticket |
| GET    | /api/admin/stats | Dashboard stats |
| GET    | /api/admin/revenue | Revenue data |
