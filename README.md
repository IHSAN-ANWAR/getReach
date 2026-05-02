# GetReach — Social Growth Platform

Full-stack social media growth platform for purchasing engagement (followers, views, likes) across TikTok, Instagram, YouTube, Facebook, and Twitter.

---

## Tech Stack

### Backend (PHP)
| Library | Version | Purpose |
|---|---|---|
| PHP | 8.1+ | Server-side language |
| `mongodb/mongodb` | ^1.19 | MongoDB driver — queries, models |
| `phpmailer/phpmailer` | ^6.9 | Password reset + alert emails |
| `ext-mongodb` | — | PHP MongoDB extension (XAMPP) |

### Frontend (React)
| Library | Version | Purpose |
|---|---|---|
| `react` | v19 | UI component framework |
| `react-dom` | v19 | DOM rendering |
| `react-router-dom` | v7 | Client-side routing |
| `framer-motion` | v12 | Page & component animations |
| `recharts` | v2 | Admin revenue & stats charts |
| `react-countup` | v6 | Animated number counters |
| `react-icons` | v5 | Icon library (FontAwesome set) |
| `bootstrap` | v5 | Grid system & utility classes |
| `axios` | v1 | HTTP client for API calls |
| `canvas-confetti` | v1 | Confetti animation on order success |

### Dev & Build
| Tool | Purpose |
|---|---|
| `vite` v8 | Frontend bundler & dev server |
| `@vitejs/plugin-react` | React fast-refresh for Vite |
| `eslint` v9 | Code linting |

### Infrastructure
| Service | Purpose |
|---|---|
| XAMPP (Apache) | Local PHP server |
| MongoDB Atlas | Cloud database |
| Gmail (PHPMailer) | Password reset + low balance alert emails |

---

## Project Structure

```
getreach/
├── backend-php/
│   ├── index.php              # Main entry point — router
│   ├── .env                   # Environment config (never commit)
│   ├── .env.example           # Template
│   ├── .htaccess              # Apache URL rewriting
│   ├── composer.json          # PHP dependencies
│   ├── config/
│   │   ├── database.php       # MongoDB connection
│   │   ├── env.php            # .env loader
│   │   └── jwt.php            # JWT encode/decode helpers
│   ├── middleware/
│   │   └── auth.php           # requireAdmin() middleware
│   ├── routes/
│   │   ├── auth.php           # register, login, admin-auth, forgot/reset password
│   │   ├── users.php          # user list, reset password, add balance
│   │   ├── orders.php         # services, place order, order status, cancel
│   │   ├── fund_requests.php  # deposit requests
│   │   ├── tickets.php        # support tickets
│   │   └── admin.php          # stats, revenue
│   └── utils/
│       ├── email.php          # PHPMailer wrapper
│       ├── pakfollowers.php   # Growth API wrapper
│       └── response.php       # jsonResponse() / jsonError() helpers
│
├── src/
│   ├── App.jsx
│   ├── config.js              # API_BASE URL
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ...
│   ├── pages/
│   └── admin/
│
├── public/
├── vite.config.js
└── package.json
```

---

## Local Setup

### Requirements
- XAMPP (PHP 8.1+, Apache)
- Composer
- Node.js 20+
- MongoDB Atlas account

### 1. PHP Backend

```bash
cd C:\xampp\htdocs\getReach\backend-php
composer install
```

Copy `.env.example` to `.env` and fill in your values:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/getReach
JWT_SECRET=your_strong_jwt_secret_here

PAKFOLLOWERS_API_URL=https://pakfollowers.com/api/v2
PAKFOLLOWERS_API_KEY=your_api_key_here
MARKUP_MULTIPLIER=2

ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password_here

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_ALERT_EMAIL=your_gmail@gmail.com
FRONTEND_URL=http://localhost:5173
```

Enable MongoDB extension in `C:\xampp\php\php.ini`:
```ini
extension=mongodb
```

Start Apache from XAMPP Control Panel.

Test backend:
```
http://localhost/getReach/backend-php/health
```
Expected: `{"status":"ok"}`

### 2. Frontend

```bash
# In project root
npm install
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost/getReach/backend-php`

---

## Environment Variables

### Backend (`backend-php/.env`)
```env
MONGODB_URI=            # MongoDB Atlas connection string
JWT_SECRET=             # JWT signing secret
PAKFOLLOWERS_API_URL=   # Growth API endpoint
PAKFOLLOWERS_API_KEY=   # Growth API key
MARKUP_MULTIPLIER=2     # Price markup (2 = 100% profit)
ADMIN_USERNAME=         # Admin login username
ADMIN_PASSWORD=         # Admin login password
EMAIL_USER=             # Gmail address
EMAIL_PASS=             # Gmail App Password (16 chars)
ADMIN_ALERT_EMAIL=      # Receives low API balance alerts
FRONTEND_URL=           # Used in password reset email links
```

### Frontend (`.env` or Vite env)
```env
VITE_API_URL=http://localhost/getReach/backend-php
```

---

## API Endpoints

| Method | URL | Description |
|---|---|---|
| GET | /health | Health check |
| POST | /api/register | Register user |
| POST | /api/login | Login |
| POST | /api/admin-auth | Admin login |
| POST | /api/forgot-password | Send reset email |
| POST | /api/reset-password | Reset password |
| GET | /api/users | All users (admin) |
| PATCH | /api/users/:id/reset-password | Admin reset user password |
| PATCH | /api/users/:id/add-balance | Admin add balance |
| GET | /api/orders/balance | API balance |
| GET | /api/orders/services | Services list |
| POST | /api/orders/place-order | Place order |
| GET | /api/orders/order-status/:id | Order status |
| GET | /api/orders/all | All orders (admin) |
| GET | /api/orders/user/:userId | User orders |
| POST | /api/orders/cancel/:id | Cancel order |
| GET | /api/orders/admin/services | Admin services list |
| PUT | /api/orders/admin/services/:id | Save service override |
| DELETE | /api/orders/admin/services/:id | Delete service override |
| POST | /api/fund-requests | Submit fund request |
| GET | /api/fund-requests/user/:userId | User fund requests |
| GET | /api/fund-requests | All fund requests (admin) |
| PATCH | /api/fund-requests/:id | Approve/reject fund request |
| POST | /api/tickets | Create ticket |
| GET | /api/tickets | Get tickets |
| PATCH | /api/tickets/:id | Update ticket |
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/revenue | Revenue data |

---

## Pricing Model

```
Growth API raw rate (USD per 1000 units)
        × MARKUP_MULTIPLIER  (env var, default: 2 = 100% profit)
        × 315                (USD → PKR conversion rate)
        = Display rate shown to user (PKR per 1000)

User charge  = (display_rate / 1000) × quantity   [PKR]
API cost     = (raw_rate / 1000) × quantity        [USD]
Your profit  = user_charge − (api_cost × 315)      [PKR]
```

---

## Admin Access

```
URL:       /admin/login
Username:  ADMIN_USERNAME (from .env)
Password:  ADMIN_PASSWORD (from .env)
```

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│   User Dashboard                  Admin Panel                    │
│   ├── New Order                   ├── Dashboard (stats/charts)   │
│   ├── Services (browse)           ├── User Base                  │
│   ├── My Orders                   ├── Services Manager           │
│   ├── Add Funds                   ├── Fund Requests              │
│   ├── Support Tickets             ├── Support CRM                │
│   ├── FAQ                         ├── Revenue                    │
│   └── Profile                     └── Settings                   │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTP REST
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              PHP Backend (Apache / XAMPP)                        │
│              http://localhost/getReach/backend-php               │
│                                                                  │
│  index.php  →  Router  →  routes/*.php                           │
│                                                                  │
│  Middleware: CORS → JWT auth → route handler                     │
└──────────┬───────────────────────────────────────────────────────┘
           │
    ┌──────▼──────┐             ┌──────────────┐
    │   MongoDB   │             │  Growth API  │
    │   Atlas     │             │ (PakFollowers│
    │             │             │    API v2)   │
    │ collections:│             │              │
    │ users       │             │ action:      │
    │ orders      │             │  services    │
    │ tickets     │             │  add         │
    │ fund_reqs   │             │  status      │
    │ svc_overrides             │  balance     │
    └─────────────┘             └──────────────┘
```

---

## Data Flow

### Order Placement
```
User fills: service, link, quantity
        │
        │  POST /api/orders/place-order
        ▼
  PHP Backend
        ├── Find user → check balance (PKR)
        ├── Get service → calculate charge
        ├── balance < charge? → 400 error
        ├── Call Growth API (action=add)
        ├── user.balance -= charge → save to MongoDB
        ├── Create Order in MongoDB
        └── Return { success, order, newBalance }
```

### Fund Deposit
```
User submits: method, amount, TID
        │
        │  POST /api/fund-requests
        ▼
  Saved as "pending"
        │
        ▼
  Admin verifies TID manually → PATCH /api/fund-requests/:id
        │
        ├── approved → User.balance += amount
        └── rejected → note saved
```

### Authentication
```
POST /api/login { email, password }
        │
        ├── Admin bypass (from .env) → JWT
        ├── Find user in MongoDB
        ├── password_verify() → wrong? → 401
        └── jwtEncode({ id, role }, JWT_SECRET, 1d) → return token
```

---

## Features

- **User Dashboard** — place orders, view order history, add funds, support tickets, profile
- **Admin Panel** — user management, services manager, fund request approval, ticket CRM, revenue charts, settings
- **Services** — fetched live from Growth API, merged with admin overrides (custom name, rate, category, hidden)
- **Fund Requests** — manual deposit verification (EasyPaisa / JazzCash)
- **Support Tickets** — full chat thread between user and admin
- **Password Reset** — email link via PHPMailer + Gmail SMTP
- **Reviews** — user-facing reviews page with like system
- **Dark Mode** — theme toggle persisted in localStorage

---

## Security

### What's Protected

| Threat | Status | How |
|---|---|---|
| SQL Injection | ✅ Safe | MongoDB parameterized queries — no raw SQL |
| XSS (Frontend) | ✅ Safe | React JSX auto-escaping — no dangerouslySetInnerHTML |
| XSS (Backend) | ✅ Safe | `strip_tags()` + `mb_substr()` on all user input |
| CSRF | ✅ Safe | JWT Bearer token auth — CSRF only affects cookie-based sessions |
| Brute Force | ✅ Protected | File-based rate limiter per IP per route |
| JWT Tampering | ✅ Safe | `hash_equals()` timing-safe signature verification |
| Password Storage | ✅ Safe | bcrypt cost 10 via `password_hash()` |
| URL Injection | ✅ Safe | `sanitizeUrl()` — blocks `javascript:` and non-http(s) schemes |
| PHP Fingerprint | ✅ Hidden | `X-Powered-By` header removed |
| Sensitive Files | ✅ Blocked | `.htaccess` blocks `.env`, `vendor/`, `config/`, `utils/` direct access |
| Security Headers | ✅ Set | CSP, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy |
| ObjectId Injection | ✅ Safe | All MongoDB IDs validated with 24-char hex regex before use |

### Rate Limits (per IP)

| Route | Max Requests | Window |
|---|---|---|
| `POST /api/login` | 10 | 15 minutes |
| `POST /api/register` | 10 | 1 hour |
| `POST /api/admin-auth` | 5 | 15 minutes |
| `POST /api/forgot-password` | 5 | 1 hour |
| `POST /api/reset-password` | 5 | 1 hour |

### Security Headers (Apache via .htaccess)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; ...
```

### Input Sanitization (backend-php/utils/sanitize.php)

All user input is sanitized before use:

- `sanitizeString()` — strip_tags + trim + max length
- `sanitizeEmail()` — filter_var FILTER_VALIDATE_EMAIL
- `sanitizeUrl()` — validates http/https only, blocks javascript: protocol
- `sanitizePositiveNumber()` — float validation, must be > 0
- `sanitizePositiveInt()` — integer validation, must be > 0
- `sanitizeAlphanumeric()` — strips non-alphanumeric chars (used for TIDs)
- `isValidObjectId()` — 24-char hex regex for all MongoDB IDs

### CORS

Origin whitelist from `FRONTEND_URL` env var — wildcard `*` removed.

---

## Contact

- Address: Islamabad Expressway, Islamabad, Pakistan
- Email: getreach.support@gmail.com
