# JAI SHREE SHYAM

# LedgerJi — Simple Business Money Tracker

Mobile-first digital ledger for local Indian businesses. Track pending payments, send WhatsApp reminders, and generate UPI QR codes — all from your phone.

---

## Overview

LedgerJi is built for Indian small business owners who need a **super simple** way to track money — without accounting jargon, without expensive software, and without needing a computer.

- **Track** — Record money given (credit) and money received (debit)
- **Remind** — Send payment reminders via WhatsApp in one tap
- **Collect** — Generate UPI QR codes customers can scan to pay

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| **State** | Zustand (client), TanStack React Query (server) |
| **Animation** | Framer Motion |
| **Backend** | Express.js, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT access + refresh tokens, Google OAuth |
| **Deployment** | Vercel (frontend), Neon (database) |
| **Monorepo** | npm workspaces + Turborepo |

---

## Project Structure

```
Ledgerji/
├── packages/
│   ├── backend/           # Express API server
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── index.ts           # Server entry point
│   │       ├── lib/               # JWT, Prisma, validators
│   │       ├── middleware/        # Auth, error, validation
│   │       ├── routes/            # Auth, customer, transaction, reminder, UPI, dashboard
│   │       └── services/          # Business logic layer
│   │
│   └── frontend/          # Next.js 15 App Router
│       ├── public/
│       │   ├── manifest.json      # PWA manifest
│       │   └── sw.js              # Service worker
│       └── src/
│           ├── app/
│           │   ├── layout.tsx     # Root layout + metadata + SEO
│           │   ├── providers.tsx  # QueryClient + AuthInitializer
│           │   ├── sitemap.ts     # Auto-generated sitemap
│           │   ├── robots.ts      # Robots.txt rules
│           │   ├── login/         # Login page
│           │   ├── register/      # Registration page
│           │   ├── offline/       # Offline fallback page
│           │   └── (authenticated)/
│           │       ├── layout.tsx # App shell + AuthGuard + bottom nav
│           │       ├── dashboard/ # Dashboard with metrics
│           │       ├── customers/ # List, detail, new, edit
│           │       ├── transactions/ # List, new entry
│           │       ├── reminders/ # WhatsApp reminder system
│           │       ├── payments/  # UPI QR payment generator
│           │       └── settings/  # Profile, privacy, about
│           ├── lib/
│           │   ├── api.ts         # API client with auto-refresh
│           │   └── utils.ts       # Formatters, helpers
│           └── stores/
│               ├── auth.store.ts  # Zustand auth (persisted)
│               └── ui.store.ts    # Zustand UI state
│
├── package.json           # Root workspace config
├── turbo.json             # Turborepo pipeline
├── tsconfig.json          # Root TypeScript config
└── .env.example           # Environment variables template
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech) free tier)
- npm 9+

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ledgerji.git
cd ledgerji
npm install
```

### 2. Environment Setup

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Required variables (see [`.env.example`](.env.example) for full reference):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon free tier recommended) |
| `JWT_ACCESS_SECRET` | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min 32 chars) |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:3000`) |
| `BACKEND_URL` | Backend origin for API rewrites (default: `http://localhost:5000`) |
| `UPI_ID` | Your business UPI ID (fallback; each business sets their own in Settings) |
| `BUSINESS_NAME` | Your business display name (default: `LedgerJi`) |

### 3. Database Setup

```bash
# Push schema to database (no migration files needed for dev)
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
# From project root — starts both servers via Turborepo
npm run dev
```

This starts both frontend (port 3000) and backend (port 5000) concurrently.

### 5. Open

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/customers` | List customers (search, pagination) |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers/:id` | Get customer details |
| PATCH | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Deactivate customer |
| GET | `/api/customers/:id/summary` | Customer balance summary |

### Transactions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions` | List transactions (filters, pagination) |
| POST | `/api/transactions` | Create transaction |
| PATCH | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Cancel transaction |

### Reminders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reminders` | Get reminder history |
| POST | `/api/reminders` | Send reminder (generates WhatsApp link) |
| POST | `/api/reminders/quick` | Quick send without saving |
| GET | `/api/reminders/templates` | Get message templates |

### UPI / Payments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upi/qr` | Generate QR code |
| POST | `/api/upi/qr/download` | Download QR as PNG |
| POST | `/api/upi/qr/customer` | Generate customer-specific QR |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Dashboard stats & overview |

---

## Key Design Decisions

### Why Plain Language?
The app uses "Money Given" / "Money Received" instead of "Debit" / "Credit" because the target users are non-accountants.

### Why WhatsApp Deep Links?
Using `wa.me/<phone>?text=` avoids paid WhatsApp Business API costs while still providing click-to-send functionality.

### Why No Database in Frontend?
All API calls go through an API client that auto-refreshes tokens, so chats about "editing the API client" implicitly refer to the server-side data layer.

### Why Mobile-First?
95%+ of target users access the web via mobile phones. The UI is designed with 48px touch targets, bottom navigation, and swipe-friendly interactions.

---

## Deployment

### Frontend (Vercel)
```bash
# Connect repo to Vercel
# Root directory: ./
# Build command: cd ../.. && npx turbo run build --filter=@ledgerji/frontend
# Output directory: packages/frontend/.next
```

### Database (Neon)
- Create a free PostgreSQL database at [neon.tech](https://neon.tech)
- Copy the connection string to `DATABASE_URL`
- Neon free tier: 0.5 GB storage, 1 project — perfect for MVP

### Backend
The backend can be deployed to Render, Railway, or a cheap VPS. For MVP, you can also use a single Vercel serverless function approach by converting Express routes to Next.js API routes.

---

## PWA Features

- **Installable** — Add to home screen on Android/iOS
- **Offline support** — Service worker caches pages for offline access
- **Push notifications** — Ready for payment reminder push alerts
- **App-like feel** — Standalone display mode, no browser chrome

---

## License

MIT License — Free for personal and commercial use.

---

## Contributing

Contributions, suggestions, and feedback are welcome. Open an issue or submit a PR.

---

Built with ❤️ for Indian businesses 🇮🇳
