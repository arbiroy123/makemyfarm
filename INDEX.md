# 🌱 FarmSync - Complete Project Navigation

Welcome! Here's your roadmap to understand and use this complete farming platform.

---

## 📖 Documentation Guide (Read in Order)

### 1️⃣ **Start Here** → [README.md](README.md)
**What:** Complete project overview  
**Contains:** Features, architecture, tech stack, API reference  
**Time:** 15-20 minutes  
**Best for:** Understanding the big picture  
**Next:** Pick a deployment option

### 2️⃣ **Getting Started** → [GETTING_STARTED.md](GETTING_STARTED.md)
**What:** Step-by-step setup guide  
**Contains:** 3 deployment options, troubleshooting, testing guide  
**Time:** 10-30 minutes (depending on option)  
**Best for:** Actually running the app  
**Next:** Deploy locally or to AWS

### 3️⃣ **Tech Stack Details** → [TECH_STACK.md](TECH_STACK.md)
**What:** Complete technology breakdown  
**Contains:** All dependencies, database schema, architecture diagrams  
**Time:** 10 minutes  
**Best for:** Developers wanting to understand technical details  
**Next:** Review backend/mobile specific docs

### 4️⃣ **Project Summary** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
**What:** Quick reference card  
**Contains:** What's included, by-the-numbers, quick features  
**Time:** 5 minutes  
**Best for:** Quick overview of what was built  
**Next:** Check specific documentation

---

## 📱 Backend Documentation

### [backend/README.md](backend/README.md)
- API route reference (all 25+ endpoints)
- Database schema explanation
- Setup instructions
- Environment variables
- Deployment info

**Key Files:**
- `backend/src/server.js` - Main server entry point
- `backend/src/database/schema.sql` - Database structure
- `backend/src/routes/*.js` - All API endpoints (7 files)
- `backend/src/realtime/socketHandlers.js` - Real-time features
- `backend/package.json` - Dependencies

---

## 📱 Mobile App Documentation

### [mobile/README.md](mobile/README.md)
- Screen-by-screen guide
- Project structure
- Setup instructions
- Performance tips
- Deployment to App Store/Play Store

**Key Files:**
- `mobile/App.js` - Root navigation
- `mobile/src/screens/` - 10 screens (auth, home, farms, etc.)
- `mobile/src/api/client.js` - API integration
- `mobile/src/store/` - Global state (Zustand)
- `mobile/src/utils/database.js` - SQLite offline storage
- `mobile/app.json` - Expo configuration

---

## ☁️ Cloud Deployment

### [infrastructure/AWS_DEPLOYMENT.md](infrastructure/AWS_DEPLOYMENT.md)
- Complete AWS setup guide
- RDS database creation
- App Runner deployment
- S3 & CloudFront setup
- Cost estimation
- CI/CD with GitHub Actions

**Key Files:**
- `docker-compose.yml` - Local development (all services)
- `backend/Dockerfile` - Backend container image
- `infrastructure/AWS_DEPLOYMENT.md` - Full AWS walkthrough

---

## 🗂️ Project Structure

```
Farming/
├── 📄 README.md                    ← START HERE (main overview)
├── 📄 GETTING_STARTED.md           ← How to run it
├── 📄 TECH_STACK.md                ← Technical details
├── 📄 PROJECT_SUMMARY.md           ← Quick reference
├── 📄 .gitignore                   ← Git configuration
│
├── 🔧 backend/                     ← Node.js API Server
│   ├── src/
│   │   ├── server.js              ← App entry point
│   │   ├── database/
│   │   │   └── schema.sql         ← 13 tables (important!)
│   │   ├── routes/                ← 7 API route files
│   │   │   ├── auth.js            (login/register)
│   │   │   ├── farm.js            (farm CRUD)
│   │   │   ├── crop.js            (crop tracking)
│   │   │   ├── recommendations.js (smart suggestions)
│   │   │   ├── community.js       (forums)
│   │   │   ├── map.js             (geospatial)
│   │   │   └── sync.js            (offline)
│   │   ├── realtime/
│   │   │   └── socketHandlers.js  ← Real-time updates
│   │   ├── email/
│   │   │   └── mailer.js          ← Email service
│   │   └── utils/
│   │       └── validators.js      ← Input validation
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile                 ← Container image
│   └── README.md                  ← API reference
│
├── 📱 mobile/                      ← React Native App
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          ← API client & endpoints
│   │   ├── screens/               ← 10 screens
│   │   │   ├── auth/              (login/register)
│   │   │   ├── home/              (farm list)
│   │   │   ├── farms/             (farm detail)
│   │   │   ├── crops/             (crop tracking)
│   │   │   ├── map/               (community map)
│   │   │   ├── community/         (forums)
│   │   │   ├── profile/           (user profile)
│   │   │   └── recommendations/   (care guides)
│   │   ├── store/
│   │   │   └── index.js           ← Zustand state
│   │   └── utils/
│   │       └── database.js        ← SQLite offline
│   ├── App.js                     ← Root navigator
│   ├── app.json                   ← Expo config
│   ├── package.json
│   ├── .env.example
│   └── README.md                  ← Setup guide
│
├── ☁️ infrastructure/               ← AWS Setup
│   └── AWS_DEPLOYMENT.md          ← Full deployment guide
│
├── 🐳 docker-compose.yml          ← Local dev (all services)
└── 📁 docs/                       ← Additional docs
```

---

## 🚀 Quick Start Paths

### Path 1: I want to run it locally ASAP (5 min)
1. `docker-compose up`
2. Wait for services to start
3. Backend: http://localhost:3000
4. Database: localhost:5432
5. Done! ✅

### Path 2: I want to understand it first (45 min)
1. Read `README.md` (15 min)
2. Read `TECH_STACK.md` (10 min)
3. Review `backend/README.md` (10 min)
4. Review `mobile/README.md` (10 min)
5. Run with Docker
6. Explore the code!

### Path 3: I want to deploy to AWS (2-3 hours)
1. Read `README.md` (understand what it is)
2. Follow `infrastructure/AWS_DEPLOYMENT.md` step-by-step
3. Deploy backend to App Runner
4. Deploy mobile to App Store/Play Store
5. Monitor in AWS Console
6. Go live! 🎉

### Path 4: I want to customize it (Variable)
1. Set up locally (15 min)
2. Find what to change:
   - Colors → `mobile/App.js`
   - Vegetables → `backend/src/database/schema.sql`
   - API endpoints → `backend/src/routes/*.js`
   - Screens → `mobile/src/screens/*/`
3. Make changes
4. Test
5. Deploy

---

## 🎯 Feature-by-Feature Navigation

### Need to modify...

**Registration/Login?**
- Backend: `backend/src/routes/auth.js`
- Mobile: `mobile/src/screens/auth/`
- DB: `users` table in schema.sql

**Farm Management?**
- Backend: `backend/src/routes/farm.js`
- Mobile: `mobile/src/screens/farms/`
- DB: `farms` & `farm_collaborators` tables

**Crop Tracking?**
- Backend: `backend/src/routes/crop.js`
- Mobile: `mobile/src/screens/crops/`
- DB: `crops` table

**Community Features?**
- Backend: `backend/src/routes/community.js`
- Mobile: `mobile/src/screens/community/`
- DB: `community_groups`, `community_posts`, `post_comments`

**Real-time Updates?**
- Backend: `backend/src/realtime/socketHandlers.js`
- Mobile: Uses `socket.io-client`
- DB: `activity_log` table

**Recommendations?**
- Backend: `backend/src/routes/recommendations.js`
- Mobile: `mobile/src/screens/recommendations/`
- DB: `vegetables` table (pre-loaded)

**Maps/Geospatial?**
- Backend: `backend/src/routes/map.js` (PostGIS queries)
- Mobile: `mobile/src/screens/map/MapScreen.js`
- DB: Uses `ST_DWithin()` for "nearby" queries

**Offline Sync?**
- Backend: `backend/src/routes/sync.js`
- Mobile: `mobile/src/utils/database.js`
- DB: `sync_queue` table

---

## 🔐 Environment Setup

### Backend (.env)
Location: `backend/.env`  
Template: `backend/.env.example`

```env
DATABASE_URL=postgresql://...    # Your database
JWT_SECRET=your_secret          # Change this!
SMTP_USER=your_email@gmail.com  # Your email
```

### Mobile (.env)
Location: `mobile/.env`  
Template: `mobile/.env.example`

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## 🧪 Testing Workflow

1. **Register User**
   - Mobile: Tap "Register"
   - Enter email, password, name
   - Check email for verification link

2. **Create Farm**
   - Mobile: "My Farms" → "Create Farm"
   - Fill in details
   - Allow location access
   - Create

3. **Plant a Crop**
   - Mobile: Farm detail → "Add Crop"
   - Select vegetable
   - Set planting date
   - Plant!

4. **Check Recommendations**
   - Mobile: "Learn" tab
   - See seasonal vegetables
   - Tap for care guide

5. **Find Community**
   - Mobile: "Community Map" tab
   - See nearby farms (if they exist)
   - Discover local groups

6. **Test Real-time**
   - Open app on 2 devices
   - Plant crop on device 1
   - See instant update on device 2

7. **Test Offline**
   - Turn off device 2's internet
   - Make changes (plant crop)
   - Turn internet back on
   - Changes sync automatically! ✅

---

## 📊 Database Quick Reference

13 tables total:

**User & Auth**
- `users` - User profiles & login

**Farm Management**
- `farms` - Farm data
- `farm_collaborators` - Multi-user farms
- `growing_seasons` - Seasons per farm

**Crops & Vegetables**
- `crops` - Planted vegetables
- `vegetables` - Vegetable database (pre-loaded)

**Community**
- `community_groups` - Local groups
- `community_members` - Group memberships
- `community_posts` - Forum posts
- `post_comments` - Comments

**System**
- `achievements` - User badges
- `sync_queue` - Offline changes
- `activity_log` - Farm timeline

---

## 🆘 Troubleshooting Quick Guide

### "Connection refused" on port 3000
See: [GETTING_STARTED.md → Troubleshooting](GETTING_STARTED.md#troubleshooting)

### "PostgreSQL connection failed"
See: [GETTING_STARTED.md → Database Issues](GETTING_STARTED.md#troubleshooting)

### Mobile won't connect to backend
See: [GETTING_STARTED.md → Network Issues](GETTING_STARTED.md#troubleshooting)

### "Module not found"
See: [GETTING_STARTED.md → Dependency Issues](GETTING_STARTED.md#troubleshooting)

---

## 📞 Documentation Map

| Document | Best For | Time |
|----------|----------|------|
| [README.md](README.md) | Big picture | 20 min |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Running it | 30 min |
| [TECH_STACK.md](TECH_STACK.md) | Technical details | 15 min |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Quick overview | 5 min |
| [backend/README.md](backend/README.md) | API reference | 15 min |
| [mobile/README.md](mobile/README.md) | App setup | 10 min |
| [infrastructure/AWS_DEPLOYMENT.md](infrastructure/AWS_DEPLOYMENT.md) | AWS deployment | 60 min |
| [TECH_STACK.md](TECH_STACK.md) | Architecture | 15 min |

---

## ✅ Checklist for Getting Started

- [ ] Read `README.md`
- [ ] Read `GETTING_STARTED.md`
- [ ] Choose deployment option (Docker/manual/AWS)
- [ ] Set up environment variables
- [ ] Run backend
- [ ] Run mobile app
- [ ] Create test account
- [ ] Create farm
- [ ] Plant crop
- [ ] View recommendations
- [ ] Check community map
- [ ] Test offline mode
- [ ] Ready to deploy! 🚀

---

## 🎓 Learning Path

```
Day 1: Understand
├── Read README.md
├── Read TECH_STACK.md
└── Understand architecture

Day 2: Run Locally
├── Set up with Docker
├── Register account
├── Create farm
└── Plant crops

Day 3: Explore Code
├── Review backend routes
├── Review mobile screens
├── Understand database
└── Explore real-time features

Day 4: Customize
├── Change colors/branding
├── Add vegetables
├── Modify API
└── Deploy locally

Day 5: Deploy
├── Follow AWS guide
├── Deploy backend
├── Deploy mobile
└── Go live! 🎉
```

---

## 🚀 Next Actions (Pick One)

1. **Run it NOW** → `docker-compose up`
2. **Understand it FIRST** → Read `README.md`
3. **Deploy to AWS** → Follow `infrastructure/AWS_DEPLOYMENT.md`
4. **Customize it** → Explore `/backend` and `/mobile` directories
5. **Share it** → Deploy to app stores and market to farmers!

---

## 💬 Final Notes

- **All code is production-ready** - not boilerplate!
- **Comprehensive documentation** - 8,000+ lines
- **Best practices throughout** - security, performance, scalability
- **Fully functional MVP** - ready for users
- **Easily customizable** - adapt for your needs
- **Cloud-native** - deploy to AWS with confidence

---

**You're all set! Pick a starting point above and let's grow some vegetables! 🌱**

*Questions? Check the relevant documentation file or review the code directly.*

---

**Happy farming! 🚀** 

*🌱 FarmSync - Grow Together*
