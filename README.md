# GetReach — Growth Platform

A full-stack digital growth platform built with React + Vite on the frontend and Express + MongoDB Atlas on the backend. Supports user ordering, wallet balance, support tickets, and a private admin dashboard.

---

## Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 19, Vite 8, Bootstrap 5, Framer Motion      |
| Backend   | Express 5, Node.js (ESM), Cluster mode            |
| Database  | MongoDB Atlas via Mongoose 9                      |
| Auth      | JWT (jsonwebtoken)                                |
| Email     | Nodemailer (Gmail SMTP)                           |
| Security  | express-rate-limit                                |
| Growth API | PakFollowers API v2                              |

---

## Project Structure

```
getreach/
├── server/
│   ├── server.js              # Main Express app (clustered, rate-limited)
│   ├── routes/
│   │   └── orders.js          # Order placement, status, services
│   ├── models/
│   │   └── Order.js           # Mongoose order schema
│   ├── utils/
│   │   └── pakfollowers.js    # Growth API wrapper
│   ├── seed_ticket.js         # Seed script for test tickets
│   ├── test_db.js             # MongoDB connection test
│   ├── test_fetch_tickets.js  # Ticket fetch test
│   ├── test_full_flow.js      # End-to-end order flow test
│   ├── test_ticket.js         # Ticket creation test
│   ├── test_ticket2.js        # Ticket reply/status test
│   └── .env                   # Environment variables
│
└── src/
    ├── App.jsx                # Routes & auth state
    ├── main.jsx
    ├── admin/
    │   ├── AdminLayout.jsx        # Sidebar + header shell
    │   ├── AdminLoginPage.jsx     # Private admin login (/admin/login)
    │   ├── AdminTicketsPage.jsx   # Support CRM with tabs + pagination
    │   └── AdminUsersPage.jsx     # User management + password reset modal
    ├── components/
    │   ├── LoginPage.jsx          # User login + forgot password (inline)
    │   ├── RegisterPage.jsx       # Registration + Privacy Policy modal
    │   ├── DashboardLayout.jsx    # User dashboard shell + sidebar
    │   ├── OrderForm.jsx          # Place new order form
    │   ├── DarkModeToggle.jsx     # Theme switcher
    │   ├── StatsCards.jsx         # Dashboard stat cards
    │   ├── SupportPage.jsx        # Support component
    │   ├── LandingInfoPanel.jsx   # Landing info panel
    │   └── TypewriterText.jsx     # Animated text
    ├── pages/
    │   ├── NewOrderPage.jsx       # Order placement
    │   ├── MyOrdersPage.jsx       # Order history table
    │   ├── TicketsPage.jsx        # Support desk (user side) + history table
    │   ├── AddFundsPage.jsx       # Wallet top-up (EasyPaisa / JazzCash)
    │   ├── ServicesPage.jsx       # Browse growth services
    │   ├── ProfilePage.jsx        # Account settings
    │   ├── RefillPage.jsx         # Refill requests for dropped orders
    │   ├── FAQPage.jsx            # Searchable FAQ accordion
    │   └── ResetPasswordPage.jsx  # Password reset via email token
    └── context/
        └── ThemeContext.jsx       # Dark/light mode context
```

---

## Features

### User Side
- Register with Privacy & Policy acceptance (modal overlay, radio confirm)
- Login with JWT session (persisted in localStorage)
- Forgot password → email reset link (1-hour expiry token)
- Set new password via `/reset-password?token=...`
- Dashboard with balance, stats, order history
- Browse growth services with markup-applied pricing
- Place orders via the growth API
- Wallet balance system — add funds via EasyPaisa / JazzCash with payment notice modal
- Refill requests page for dropped orders (30-day guarantee services)
- Support ticket system — submit, view full chat thread, see admin replies in real time (auto-refresh every 8s)
- Ticket history table with status badges and reply indicator
- Searchable FAQ page with accordion categories
- Dark / light mode toggle

### Admin Dashboard (private — `/admin/login`)
- Separate login page, not linked anywhere in the UI
- Role-based guard — non-admin accounts are rejected with inline error
- User management table with search
- Reset any user's password via modal (lock icon per row)
- Support CRM with clickable tab cards: Pending / In Review / Resolved / Closed
- Live stat counts per status on each tab card
- Inline reply panel with full chat thread
- Two reply actions: "Reply" (keeps In Review) or "Reply & Resolve"
- Pagination — 10 tickets per page, resets on tab/search change
- Auto-refresh every 10s

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Register new user (duplicate check, returns JWT) |
| POST | `/api/login` | Login — user or admin |
| GET | `/api/users` | List all users (admin) |
| PATCH | `/api/users/:id/reset-password` | Reset user password (admin) |
| GET | `/api/orders/services` | Fetch growth services (5min cache, markup applied) |
| POST | `/api/orders/place-order` | Place order via growth API |
| GET | `/api/orders/order-status/:id` | Check order status |
| GET | `/api/orders/user/:userId` | Get user's orders |
| POST | `/api/tickets` | Create support ticket |
| GET | `/api/tickets?userId=` | Get tickets (filtered by user) |
| PATCH | `/api/tickets/:id` | Update ticket — reply / status change |
| POST | `/api/forgot-password` | Send password reset email |
| POST | `/api/reset-password` | Set new password via token |

---

## Rate Limiting

| Route | Limit | Window |
|-------|-------|--------|
| All `/api/*` | 100 requests | 15 min |
| `/api/login` + `/api/register` | 10 attempts | 15 min |
| `/api/forgot-password` + `/api/reset-password` | 5 attempts | 1 hour |
| `/api/orders/place-order` | 30 orders | 10 min |

---

## Environment Variables

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/getReach
PORT=5000
JWT_SECRET=your_jwt_secret

PAKFOLLOWERS_API_URL=https://pakfollowers.com/api/v2
PAKFOLLOWERS_API_KEY=your_api_key
MARKUP_MULTIPLIER=2        # 2 = 100% markup on API price

# Email — required for forgot password feature
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

> Gmail requires a 16-char App Password. Enable 2FA → myaccount.google.com → Security → App Passwords.

---

## Running Locally

```bash
# 1. Install frontend deps (from root)
npm install

# 2. Install server deps
cd server && npm install

# 3. Start backend (from /server)
node server.js

# 4. Start frontend (from root)
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## Auth & Routing

```
/                    → User login (LoginPage)
/register            → Register (with Privacy Policy modal)
/reset-password?token=... → Set new password

/admin/login         → Admin login (private, not linked in UI)
/admin               → Redirects to /admin/login if not authenticated
/admin/users         → User management
/admin/tickets       → Support CRM
```

Sessions require both `gr_user` and `gr_token` in localStorage to be valid.

---

## Pricing / Markup

Services are fetched from the growth API and marked up before display:

```
API cost:     Rs 1.00 / 1000
Markup (2x):  Rs 2.00 / 1000  ← user pays
Profit:       Rs 1.00 / 1000
```

`MARKUP_MULTIPLIER` in `.env` controls this. Original API cost is stored internally per order for profit tracking.

---

## Deployment

### Frontend — Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. Set the following in project settings:
   - Framework Preset: `Vite`
   - Root Directory: `/` (repo root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
5. Deploy — Vercel handles CDN, HTTPS, and previews automatically

> Make sure your `vite.config.js` proxy is removed or conditionally applied for production, and all API calls use `VITE_API_URL`.

---

### Backend — Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Configure the service:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: `Node`
4. Add all environment variables from `server/.env` in the Render dashboard:
   ```
   MONGODB_URI
   PORT=10000          # Render assigns its own port, use process.env.PORT
   JWT_SECRET
   PAKFOLLOWERS_API_URL
   PAKFOLLOWERS_API_KEY
   MARKUP_MULTIPLIER
   EMAIL_USER
   EMAIL_PASS
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
5. Deploy — Render provides a public HTTPS URL for your API

> Render free tier spins down after inactivity. Upgrade to a paid plan for always-on uptime.

---

### Backend — AWS EC2

1. Launch an EC2 instance (Ubuntu 22.04 LTS recommended, t2.micro for starters)
2. Open inbound ports: `22` (SSH), `80` (HTTP), `443` (HTTPS), `5000` (or your PORT)
3. SSH into the instance and set up Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Clone your repo and install deps:
   ```bash
   git clone https://github.com/your/repo.git
   cd repo/server && npm install
   ```
5. Create your `.env` file with all required variables
6. Run with PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name getreach-api
   pm2 save && pm2 startup
   ```
7. (Optional) Set up Nginx as a reverse proxy on port 80/443:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
     }
   }
   ```
8. Use [Certbot](https://certbot.eff.org/) for free SSL: `sudo certbot --nginx`

---

## Notes

- Server runs in Node.js cluster mode — one worker per CPU core, auto-restarts crashed workers
- Password reset tokens expire after 1 hour and are cleared after use
- Ticket chat auto-refreshes every 8s (user) / 10s (admin)
- Admin dashboard URL is intentionally hidden — only accessible via direct URL `/admin/login`
- Duplicate email registration returns a clear error instead of a generic 500
