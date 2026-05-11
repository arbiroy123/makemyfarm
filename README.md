```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🌱 FARMSYNC - SMART FARMING PLATFORM 🌾            ║
║                                                                  ║
║     Grow smarter. Farm together. Built for India & the USA.      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

> **From backyard gardens to community farms.** FarmSync empowers novices to experts with intelligent crop management, AI-powered advice, government scheme discovery, and community-driven knowledge sharing.

---

## ✨ Features at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        FREE TIER                                 │
├─────────────────────────────────────────────────────────────────┤
│ 🌾 Farm Management    │  1 farm, 5 crops                        │
│ 🌱 Crop Tracking      │  Diary, growth stages, harvest log      │
│ 🏛️  Govt Schemes       │  India + USA (8 + 7 schemes)           │
│ 🗺️  Community Map      │  Nearby farms & groups                 │
│ 🛒 Marketplace        │  Buy, sell & trade produce              │
│ 🗓️  Planting Calendar  │  Seasonal grow windows                 │
│ 🌿 Garden Planner     │  Drag-and-drop companion planting       │
│ 🏅 Achievements       │  Milestones & badges                    │
│ 👤 Guest Mode         │  Browse crops & market without signing up│
│ 📵 Offline-First      │  Works without internet                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PRO — $4.99 / month                           │
├─────────────────────────────────────────────────────────────────┤
│ 🤖 KisanBot           │  Claude AI agronomist (Hindi + English) │
│ 🔬 Disease Detection  │  AI photo diagnosis + treatment plan    │
│ 📊 Farm Finances      │  Income, expense, profit & ROI charts   │
│ ♾️  Unlimited          │  Unlimited farms & crops                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Pro Features

### KisanBot — AI Agronomist
- Powered by **Claude claude-sonnet-4-6** (Anthropic)
- Ask about pest control, soil health, crop selection, or government schemes
- Bilingual: Hindi and English
- Remembers conversation context within a session
- Suggestion chips on open (tailored to India or USA)

### Disease Detection
- Take a photo of a sick plant → instant AI diagnosis
- Treatment recommendations with severity guidance
- Works best in good lighting; result stored in crop diary

### Farm Finances
- Log income (sales) and expenses (seeds, labor, fertilizer, water, equipment)
- Monthly bar chart trend (12-month view)
- Profit/loss, ROI summary cards
- Currency-aware: ₹ INR and $ USD with localized category labels

---

## 🏛️ Government Schemes

**India (8 schemes):** PM-KISAN, PMFBY (crop insurance), Kisan Credit Card, Soil Health Card, e-NAM, PM-KUSUM (solar), PKVY (organic), Agri Infrastructure Fund

**USA (7 schemes):** USDA FSA Direct Loans, ARC/PLC, Federal Crop Insurance, EQIP, Beginning Farmer Loans, Organic Cost Share (NRCS), REAP (rural energy)

**More regions coming soon.**

Each scheme card shows: benefit summary, how to apply, documents required, and a direct link to the official application portal.

---

## 📚 Crop Database

56 vegetables pre-loaded with:
- Growing requirements (temp, water, sunlight, soil pH)
- Difficulty level (novice / intermediate / expert)
- Days to harvest, spacing, season & climate zones
- Companion planting ("Grows Well With" card)
- Care guide, pest & disease reference
- Fun fact, nutrition info, and a simple kitchen recipe

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        📱 MOBILE APP                              │
│              React Native + Expo 54 (iOS & Android)              │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Offline-first (AsyncStorage + sync queue)                     │
│  ✓ Real-time Socket.io collaboration                             │
│  ✓ Camera (disease detection)                                    │
│  ✓ Location services & react-native-maps                         │
│  ✓ Push notifications (Expo Notifications)                       │
│  ✓ i18n: English + Hindi (react-i18next)                         │
└────────────────────────┬─────────────────────────────────────────┘
                         │ REST API + WebSockets  │  JWT Auth
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                        🔧 BACKEND API                             │
│              Node.js 20 + Express (Railway.app)                  │
├──────────────────────────────────────────────────────────────────┤
│  ✓ JWT Authentication (bcryptjs, 12 rounds)                      │
│  ✓ Rate limiting (100 req/15 min general, 5/15 min auth)         │
│  ✓ Real-time collaboration (Socket.io + Redis)                   │
│  ✓ Claude AI integration (KisanBot chatbot)                      │
│  ✓ Stripe subscriptions (webhooks, Pro tier enforcement)         │
│  ✓ Free-tier limits (1 farm / 5 crops) enforced server-side      │
│  ✓ Push notifications (Expo server SDK)                          │
│  ✓ Input validation & SQL injection protection                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │ SQL + PostGIS
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                      🗄️  DATABASE LAYER                           │
│          PostgreSQL 15 + PostGIS (Railway / Docker)              │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Geospatial queries (nearby farms, groups, marketplace)        │
│  ✓ Activity logging & season reports                             │
│  ✓ Offline sync queue                                            │
│  ✓ Financial records table                                       │
│  ✓ Subscription tier fields on users                             │
└──────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Mobile** | React Native + Expo 54 | iOS & Android from one codebase |
| **Backend** | Node.js 20 + Express | ES Modules throughout |
| **Database** | PostgreSQL 15 + PostGIS | Geospatial queries |
| **Real-time** | Socket.io + Redis | Instant collaboration |
| **AI** | Anthropic Claude claude-sonnet-4-6 | KisanBot + disease detection |
| **Billing** | Stripe | Subscriptions, webhooks |
| **Hosting** | Railway.app | Backend + DB + Redis |
| **State** | Zustand | Lightweight mobile state |
| **Auth** | JWT | Stateless, mobile-friendly |
| **i18n** | react-i18next | English + Hindi |

---

## 📁 Project Structure

```
Farming/
├── backend/
│   ├── src/
│   │   ├── server.js               # Entry point, rate limiting, routes
│   │   ├── database/
│   │   │   ├── schema.sql          # Full schema (run on fresh install)
│   │   │   ├── seed.sql            # 56 vegetables
│   │   │   └── migrations/
│   │   │       ├── 001_financial_records.sql
│   │   │       └── 002_billing.sql
│   │   ├── middleware/
│   │   │   └── checkSubscriptionLimit.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── farm.js             # Free-tier limit enforced
│   │       ├── crop.js             # Free-tier limit enforced
│   │       ├── chatbot.js          # KisanBot (Claude AI)
│   │       ├── financials.js       # Farm P&L
│   │       ├── schemes.js          # Govt schemes (static)
│   │       ├── billing.js          # Stripe subscriptions
│   │       ├── recommendations.js
│   │       ├── community.js
│   │       ├── map.js
│   │       ├── marketplace.js
│   │       ├── planner.js
│   │       ├── achievements.js
│   │       ├── calendar.js
│   │       └── sync.js
│   ├── Dockerfile
│   ├── railway.toml
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── api/client.js           # All API calls (axios)
│   │   ├── store/                  # Zustand (auth, farms)
│   │   ├── i18n/                   # English + Hindi translations
│   │   └── screens/
│   │       ├── auth/               # Login, Register
│   │       ├── home/               # Farm list + feature strip + paywall
│   │       ├── farms/              # Detail, Create, Season Report
│   │       ├── crops/              # Plant, Detail, Diary, Disease Detection
│   │       ├── chatbot/            # KisanBot chat UI
│   │       ├── financials/         # P&L dashboard
│   │       ├── schemes/            # Govt schemes browser
│   │       ├── tour/               # 10-slide onboarding (auto on first login)
│   │       ├── marketplace/        # Listings, create, detail
│   │       ├── planner/            # Garden planner
│   │       ├── map/                # Community map
│   │       ├── community/          # Groups + forums
│   │       ├── recommendations/    # Vegetable browser + planting calendar
│   │       ├── profile/            # Profile + achievements
│   │       └── admin/              # Admin panel (admin users only)
│   ├── App.js                      # Navigation + auto-tour on first login
│   ├── app.json
│   └── package.json
│
├── docker-compose.yml              # Local dev (postgres + redis + backend)
└── README.md
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 20+
- Expo Go app on your phone (for mobile testing)

---

### Step 1 — Start everything with Docker

```bash
# From project root
docker-compose up --build -d
```

This starts Postgres (`:5432`), Redis (`:6379`), and the backend API (`:3000`).

**First run only** — apply the schema and seed vegetables:

```bash
docker exec -i farming-postgres-1 psql -U postgres -d farmsync \
  < backend/src/database/schema.sql

docker exec -i farming-postgres-1 psql -U postgres -d farmsync \
  < backend/src/database/seed.sql
```

Verify the backend is healthy:
```bash
curl http://localhost:3000/health
```

---

### Step 2 — Configure mobile

```bash
# Find your Mac's local IP
ipconfig getifaddr en0

# Edit mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:3000
```

---

### Step 3 — Start Expo

```bash
cd mobile
npm install     # first run only
npx expo start
```

- **Phone**: Scan QR code with Expo Go
- **iOS Sim**: press `i`
- **Android Emulator**: press `a`
- **Browser**: press `w`

> On first launch you'll see the Terms screen → then register or browse as a guest.

---

### Test Account

```
Email:    admin@farmsync.com
Password: admin123
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmsync
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_here
ANTHROPIC_API_KEY=sk-ant-...          # KisanBot (Claude AI)
STRIPE_SECRET_KEY=sk_test_...         # Billing (optional in dev)
STRIPE_WEBHOOK_SECRET=whsec_...       # Stripe webhooks
NODE_ENV=development
PORT=3000
```

### Mobile (`mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:3000
```

---

## 💳 Subscription Model

| Feature | Free | Pro ($4.99/mo) |
|---------|------|----------------|
| Farms | 1 | Unlimited |
| Crops per farm | 5 | Unlimited |
| KisanBot (AI chat) | ✗ | ✓ |
| Disease Detection | ✗ | ✓ |
| Farm Finances | ✗ | ✓ |
| Govt Schemes | ✓ | ✓ |
| Marketplace | ✓ | ✓ |
| Community Map | ✓ | ✓ |
| Garden Planner | ✓ | ✓ |
| Offline access | ✓ | ✓ |

> India pricing: ₹99–149/month planned (separate tier coming soon).

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Farms & Crops
```
POST   /api/farms
GET    /api/farms/my-farms
GET    /api/farms/:id
PUT    /api/farms/:id
POST   /api/farms/:id/collaborators
GET    /api/farms/:id/activity
GET    /api/farms/:id/season-report

POST   /api/crops
GET    /api/crops/farm/:farmId
GET    /api/crops/:id
PUT    /api/crops/:id
GET    /api/crops/:id/diary
POST   /api/crops/:id/diary
DELETE /api/crops/:id/diary/:entryId
```

### KisanBot (Pro)
```
POST   /api/chatbot/chat             { message, history, farmContext }
GET    /api/chatbot/suggestions      ?country=IN|US
```

### Finances (Pro)
```
GET    /api/financials/farm/:id/summary   ?year=2025
GET    /api/financials/farm/:id/trend     ?year=2025
GET    /api/financials/farm/:id           ?type=income|expense
POST   /api/financials/farm/:id
DELETE /api/financials/:recordId
```

### Government Schemes
```
GET    /api/schemes                  ?country=IN|US&category=...
GET    /api/schemes/:id
POST   /api/schemes/check-eligibility
```

### Billing
```
GET    /api/billing/status
POST   /api/billing/create-checkout-session
POST   /api/billing/webhook          (Stripe webhook — raw body)
POST   /api/billing/cancel
```

### Other
```
GET    /api/recommendations/vegetables
GET    /api/recommendations/vegetable/:id
GET    /api/calendar/:farmId
GET    /api/marketplace/nearby
GET    /api/marketplace/my
POST   /api/marketplace
GET    /api/map/nearby-farms
GET    /api/map/nearby-groups
GET    /api/achievements
POST   /api/achievements/check
POST   /api/disease/diagnose
```

---

## 🔐 Security

- JWT tokens (expiring, stored in AsyncStorage)
- Passwords hashed with bcryptjs (12 rounds)
- Rate limiting: 100 req/15 min general, 5/15 min on auth routes
- Free-tier limits enforced server-side (not just client-side)
- Stripe webhook signature verification
- Parameterized SQL queries (no injection risk)
- CORS restricted to known origins in production

---

## 🗄️ Database Schema (key tables)

| Table | Purpose |
|-------|---------|
| `users` | Auth, profile, `subscription_tier`, Stripe IDs |
| `farms` | Farm metadata, geolocation, owner |
| `crops` | Planted crops, growth stage, harvest data |
| `crop_diary` | Photos + notes per crop |
| `vegetables` | 56 pre-seeded crops with full care data |
| `financial_records` | Income/expense per farm |
| `community_groups` | Local farming groups (geospatial) |
| `community_posts` | Forum posts + comments |
| `marketplace_listings` | Buy/sell/trade produce |
| `sync_queue` | Offline change buffer |
| `activity_log` | Farm timeline events |
| `achievements` | User milestone tracking |

---

## 🚀 Deployment (Railway.app)

1. Push to GitHub — Railway auto-deploys from `main`
2. Add a PostgreSQL plugin + PostGIS (use `postgis/postgis:15-3.3` Docker service — Railway's built-in PG lacks PostGIS)
3. Add a Redis plugin
4. Set environment variables in Railway dashboard
5. Run schema + seed SQL via Railway shell on first deploy

Backend config is in [`backend/railway.toml`](backend/railway.toml).

### App Store Distribution

```bash
# Install EAS CLI
npm install -g eas-cli

# iOS
eas build --platform ios
eas submit --platform ios

# Android
eas build --platform android
eas submit --platform android
```

---

## 🆘 Troubleshooting

### Mobile can't reach backend
```bash
# Confirm your Mac IP
ipconfig getifaddr en0
# Update mobile/.env and restart Expo with --clear
npx expo start --clear
```

### No vegetables showing after docker-compose down -v
```bash
docker exec -i farming-postgres-1 psql -U postgres -d farmsync \
  < backend/src/database/seed.sql
```

### New npm packages not found in Docker
```bash
# Stale anonymous node_modules volume — wipe and rebuild
docker-compose down -v
docker-compose up --build
```

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Expo cache issues
```bash
cd mobile && npx expo start --clear
```

---

## 📈 Roadmap

### Done ✓
- [x] Farm & crop management (CRUD, diary, harvest)
- [x] 56-vegetable database with full care guides
- [x] Community map (geospatial, nearby farms & groups)
- [x] Marketplace (buy, sell, trade)
- [x] Garden planner (companion planting drag-and-drop)
- [x] Planting calendar
- [x] Achievements & badges
- [x] Disease detection (AI photo diagnosis)
- [x] KisanBot — Claude AI agronomist (Hindi + English)
- [x] Farm finances (P&L, ROI, trend charts)
- [x] Government schemes (India + USA)
- [x] Stripe subscriptions (Pro tier, $4.99/mo)
- [x] Free-tier enforcement (1 farm / 5 crops)
- [x] Rate limiting (auth + general)
- [x] Multi-language support (English + Hindi)
- [x] Guest mode (browse without signing up)
- [x] 10-slide onboarding tour (auto-launches on first login)
- [x] Push notifications
- [x] Offline-first sync

### Planned
- [ ] India Pro tier (₹99–149/month)
- [ ] Web dashboard (React)
- [ ] More regions for government schemes (EU, AU, NG)
- [ ] Weather-driven planting alerts
- [ ] Dark mode
- [ ] Advanced analytics (yield trends year-over-year)

---

## 📄 License

MIT — free to use for commercial and personal projects.

---

**Last Updated:** May 2026 | **Version:** 1.2.0
