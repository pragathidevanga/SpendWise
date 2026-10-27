# SpendWise — Smart Personal Finance Manager

A modern, responsive, client-first Personal Finance Management Web Application engineered with **React 18**, **Vite**, **Express.js**, **Recharts**, and browser-native **localStorage** with Web Crypto SHA-256 password hashing.

---

## 1. Project Title
**SpendWise — Smart Personal Finance Manager**

## 2. Project Overview
SpendWise is a personal finance management application that delivers SaaS-tier visual design, responsive interactions, and dependable offline persistence. It enables individuals to track income and daily expenses, manage category-based budgets with real-time threshold warnings, track savings goals, generate interactive analytics, and export ledgers as CSV and JSON backups — all without requiring MongoDB, third-party cloud databases, or paid API keys.

## 3. Problem Statement
Many personal finance applications either:
- Rely on invasive cloud databases that compromise user financial privacy.
- Require complex setups with external databases (MongoDB, PostgreSQL, Firebase) and API keys.
- Stop working completely if an API server drops offline.
- Offer simplistic dashboards with decorative buttons and fake mock data.

SpendWise solves this by adopting a **resilient client-first architecture**:
1. All user accounts, transaction ledgers, budgets, goals, and settings are preserved in isolated, user-scoped browser `localStorage`.
2. A lightweight local **Express.js** backend provides supplementary validated calculation and health monitoring endpoints.
3. If the backend is stopped or unavailable, the frontend continues to operate seamlessly using local fallback calculation engines.

## 4. Project Objectives
- Deliver a complete web experience featuring a public landing page, robust authentication, an interactive onboarding wizard, and a private application suite.
- Guarantee 100% data privacy: records are strictly confined to the user's browser.
- Implement real CRUD functionality: transactions update summaries, charts, budgets, and savings goals dynamically.
- Provide honest, transparent local demonstration flows for Google Sign-In and Password Reset without misleading claims or simulated backend network calls.
- Include data portability via compliant CSV and JSON backup export and import.

## 5. Key Features
1. **Public Marketing Website (`/`)**:
   - Modern responsive navigation bar with mobile drawer and theme toggle.
   - Dynamic hero with feature preview card, key benefits, and quick CTA buttons.
   - 8 capability cards, 4-step workflow roadmap, and expandable FAQ accordions.
2. **Authentication Suite (`/login`, `/signup`, `/forgot-password`)**:
   - Split-screen layout with SpendWise branding and security badges.
   - Client-side Web Crypto API (SHA-256) password hashing.
   - Inline form validation, show/hide password toggles, and duplicate email prevention.
   - **Google Sign-In Demo Modal**: A transparent, sandbox modal that lets users pick or customize demo profiles without collecting Google passwords.
   - **Local Password Reset Demo**: Direct client-side credential updating for existing accounts.
   - Route protection: unauthenticated visits redirect to `/login` with preserved return destinations.
3. **Interactive Onboarding Flow (`/onboarding`)**:
   - 4-step wizard: Display Name, Primary Currency (default INR ₹), Monthly Income & Budget, and Primary Financial Goal.
4. **Financial Dashboard (`/app`)**:
   - 4 real-time stat cards: Net Balance, Total Income, Total Expenses, Remaining Monthly Budget.
   - Recharts cash flow bar charts and category distribution donut charts.
   - Recent transactions table and active savings goal widgets.
5. **Transaction Ledger (`/transactions`)**:
   - Add, Edit, Delete (with confirmation modal), and Detailed View.
   - Multi-criteria filtering: search keywords (title, notes, category), type (income/expense), category, date range.
   - Dynamic sorting (newest, oldest, highest amount, lowest amount).
   - Filter summary ribbon displaying totals for filtered subsets.
   - Pagination and CSV export.
6. **Smart Budget Planner (`/budgets`)**:
   - Category budget caps with real-time spending calculations derived directly from expense transactions.
   - Utilization progress bars with color-coded alerts (Normal <80%, Warning 80-100%, Exceeded >=100%).
7. **Savings Goals (`/goals`)**:
   - Target amount milestones, target deadlines, and progress meters.
   - Direct fund contributions and withdrawal logging with target milestone notifications.
8. **Visual Analytics & Insights (`/analytics`)**:
   - Chronological income vs. expense Area chart timeline.
   - Category expenditure share breakdown.
   - Rule-based heuristic financial insights (savings rate evaluation, high-expense alerts, budget breach alerts).
9. **Notification Center (`/notifications`)**:
   - System alerts, budget warnings, and savings goal completions.
   - Read/unread state tracking, unread count badge, and batch clearing.
10. **Settings & Data Management (`/settings`)**:
    - Profile editing and currency selection (INR ₹, USD $, EUR €, GBP £, CAD $, AUD $, JPY ¥).
    - Theme switching (Light Mode and Dark Navy SaaS Mode).
    - Full JSON backup export and validated JSON backup import with schema verification.
    - User-scoped data reset with confirmation safeguards.

## 6. Technology Stack
- **Frontend**:
  - React 18
  - Vite 6
  - React Router DOM 6
  - Lucide React (UI iconography)
  - Recharts 2.13 (Responsive SVG financial charts)
  - Custom Modular CSS (Glassmorphism, custom design system, light/dark variables)
- **Backend**:
  - Node.js (v25+)
  - Express.js 4
  - CORS middleware
- **Security & Persistence**:
  - Web Crypto API (`crypto.subtle.digest('SHA-256')`) for browser password hashing.
  - Browser `localStorage` with versioned, user-scoped keys.

## 7. Application Architecture
```text
┌────────────────────────────────────────────────────────┐
│                   SpendWise Frontend                   │
│   (React 18 + Vite + React Router + Context + Recharts)│
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       (HTTP API / Proxy)          (Storage Engine)
                │                        │
                ▼                        ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     Local Express Backend    │ │     Browser localStorage     │
│   • /api/health              │ │   • spendwise_users          │
│   • /api/info                │ │   • spendwise_session        │
│   • /api/calculate/summary   │ │   • spendwise_transactions   │
│   • /api/calculate/budget    │ │   • spendwise_budgets        │
│   (Zero Cloud / Zero Mongo)  │ │   • spendwise_goals          │
└──────────────────────────────┘ │   • spendwise_preferences    │
                                 └──────────────────────────────┘
```

## 8. Project Folder Structure
```text
SpendWise/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Card, Modal, Input, Badge, EmptyState, etc.
│   │   │   ├── layout/         # PublicNavbar, PublicFooter, AppHeader, AppSidebar, AppLayout
│   │   │   └── dashboard/      # QuickAddModal, StatCards
│   │   ├── context/            # AuthContext, FinanceContext, ThemeContext, ToastContext
│   │   ├── pages/              # Landing, Login, Signup, Onboarding, Dashboard, etc.
│   │   ├── services/           # api.js, storage.js, crypto.js
│   │   ├── utils/              # formatters.js, sampleData.js, exportImport.js
│   │   ├── styles/             # index.css (cohesive design system)
│   │   ├── App.jsx             # Route definitions and route guards
│   │   └── main.jsx            # React root and context provider tree
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── controllers/            # calculateController.js
│   ├── routes/                 # apiRoutes.js
│   ├── server.js               # Express application entry
│   └── package.json
├── README.md
└── .gitignore
```

## 9. Installation Requirements
- **Node.js**: v18.0.0 or higher (v25.6 tested).
- **npm**: v9.0.0 or higher.
- A modern web browser (Google Chrome, Microsoft Edge, Firefox, or Safari).

## 10. Frontend Setup
```bash
cd frontend
npm install
```

## 11. Backend Setup
```bash
cd backend
npm install
```

## 12. How to Run Both Servers

### Terminal 1: Start Backend (Port 5000)
```bash
cd backend
npm start
```
*The backend server will launch at `http://localhost:5000`.*

### Terminal 2: Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser.*

> **Note on Resiliency:** The frontend is configured with a proxy to `/api` at `http://localhost:5000`. If you run only the frontend without starting the backend, SpendWise automatically falls back to client-side calculation engines, allowing full evaluation without any errors.

## 13. Local Routes and API Endpoints

### Frontend Routes
| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with hero, features, workflow, and FAQ |
| `/login` | Public | Split-screen login with email/password and Google demo |
| `/signup` | Public | Registration with password strength meter |
| `/forgot-password` | Public | Local password recovery demonstration |
| `/onboarding` | Protected | 4-step first-time profile configuration |
| `/app` | Protected | Main financial dashboard and overview |
| `/transactions` | Protected | Full transaction ledger with search, filters, pagination, CSV |
| `/budgets` | Protected | Category spending caps with real-time meter tracking |
| `/goals` | Protected | Savings targets with contribution and withdrawal logging |
| `/analytics` | Protected | Recharts timeline, distribution, and rule-based insights |
| `/notifications` | Protected | Budget alerts, goal milestones, and system messages |
| `/settings` | Protected | Preferences, profile, theme, JSON backup/import, reset |

### Backend API Endpoints
| Method | Endpoint | Payload / Params | Response |
|---|---|---|---|
| `GET` | `/api/health` | None | `{ status: "ok", uptimeSeconds: number, timestamp: string }` |
| `GET` | `/api/info` | None | `{ name: string, version: string, mode: "local-demo", capabilities: [...] }` |
| `POST` | `/api/calculate/summary` | `{ transactions: [...] }` | `{ success: true, data: { totalIncome, totalExpenses, netBalance, savingsRate, ... } }` |
| `POST` | `/api/calculate/budget` | `{ budgets: [...], transactions: [...] }` | `{ success: true, data: { overallBudgetLimit, overallSpent, budgets: [...] } }` |

## 14. Demo Account Instructions
You can explore SpendWise immediately using either method:
1. **Google Sign-In Demo**:
   - On `/login` or `/signup`, click **"Continue with Google (Demo)"**.
   - Select one of the preset identities:
     - **Alex Morgan** (`alex.morgan.demo@gmail.com`)
     - **Rohan Sharma** (`rohan.sharma.demo@gmail.com`)
     - **Priya Patel** (`priya.patel.demo@gmail.com`)
     - Or choose **"Custom Demo Identity"** to supply your own name.
   - Demo accounts are automatically preloaded with realistic sample transactions, budgets, and savings goals.
2. **Manual Registration**:
   - Navigate to `/signup`, provide your name, email, and password (min. 6 characters).
   - After registering, complete or skip onboarding.
   - On an empty account, click **"Load Demo Data"** in the sidebar or dashboard banner to populate sample transactions at any time.

## 15. Google OAuth versus Google Sign-In Demo Explanation
- **Production Google OAuth**: Requires registering an application with Google Cloud Console, verifying authorized redirect URIs, provisioning client credentials, and securely exchanging authorization codes on a production server.
- **SpendWise Local Demo**: Because this application is an individual project without cloud database dependencies or third-party credential requirements, SpendWise provides an explicit, transparent **Google Sign-In Demo Mode**.
  - It clearly indicates to the user that it is an interactive sandbox demonstration.
  - It never requests, transmits, or collects actual Google passwords.
  - It never claims that Google has authenticated the user.
  - It creates a safe local demo session in browser localStorage.

## 16. LocalStorage Persistence Explanation
- All records are saved under versioned storage keys:
  - `spendwise_users`: Array of registered accounts with SHA-256 hashed passwords.
  - `spendwise_session`: Active session metadata.
  - `spendwise_transactions`: User-scoped transaction records (`{ [userId]: [...] }`).
  - `spendwise_budgets`: User-scoped budget entries.
  - `spendwise_goals`: User-scoped savings milestones.
  - `spendwise_preferences`: User-scoped currency, date format, and target budget.
  - `spendwise_notifications`: User-scoped notification lists.
- **User Isolation**: Data is partitioned by stable user IDs. Logging into User A will never display transactions, budgets, or goals created by User B.
- **Session Preservation**: Selecting "Remember Me" keeps your session active across browser restarts. Logging out clears the active session while leaving user records safely intact.

## 17. Data Export and Import Instructions
1. **CSV Export**:
   - Go to `/transactions` and click **"Export CSV"**.
   - A properly escaped, comma-delimited CSV file (`spendwise_transactions_YYYY-MM-DD.csv`) will download with headers (`ID, Date, Title, Type, Category, Amount, Currency, Payment Method, Notes`).
2. **JSON Full Backup**:
   - Go to `/settings` and click **"Export JSON Backup"**.
   - Downloads a complete snapshot (`spendwise_backup_user_YYYY-MM-DD.json`) with app version, timestamp, user metadata, preferences, transactions, budgets, and goals.
3. **JSON Backup Restoration**:
   - Under `/settings`, click **"Import JSON Backup"**.
   - Select a valid SpendWise JSON backup file.
   - The system structurally validates and sanitizes all fields before applying it to the active account.

## 18. Limitations
- **Browser-Specific**: Because records reside in browser localStorage, data created in Google Chrome will not automatically synchronize to Mozilla Firefox or another physical machine.
- **Demo Reset**: Password recovery updates the SHA-256 hash locally; no email verification is sent due to the absence of an external SMTP service.
- **Simulated Bank Accounts**: Savings goals track progress locally; no banking integrations or monetary transfers take place.

## 19. Testing Checklist
- [x] **Public Site**: Landing page renders cleanly with responsive navigation, feature cards, and functioning FAQ accordions.
- [x] **Authentication**: Registration validates email formatting and enforces password strength; duplicate emails are rejected.
- [x] **Password Recovery**: Local password reset updates the SHA-256 hash and allows subsequent login with the new password.
- [x] **Google Demo**: Interactive modal allows selecting demo accounts without fake claims.
- [x] **Data Isolation**: Verified that creating two distinct accounts partitions all records by user ID.
- [x] **Transactions**: Add, edit, delete, search, category filter, date filtering, and sorting functions verified.
- [x] **Budget Tracking**: Category spending is calculated dynamically from actual expense transactions.
- [x] **Savings Goals**: Milestone progress updates on contribution and withdrawal.
- [x] **Analytics**: Recharts charts update in real-time as transactions are recorded or removed.
- [x] **Theme Switching**: Dark and light modes apply variables across all routes and persist in storage.
- [x] **Backend API**: `/api/health`, `/api/info`, and calculation endpoints respond correctly; app operates smoothly if backend is offline.
- [x] **Backup & Restore**: Exported CSV opens cleanly; JSON backup import validates schema and restores user ledger.

## 20. Future Enhancements
- Integration with live Google Cloud OAuth credentials when deployed to a public domain.
- Progressive Web App (PWA) manifest and service worker for full offline desktop installation.
- Multi-currency conversion using open exchange rate feeds.
- Automated recurring transaction scheduler (e.g., monthly rent, recurring salaries).
- PDF report generation with formatted monthly spending summaries.
