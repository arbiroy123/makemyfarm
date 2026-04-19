# FarmSync - Getting Started Guide

## 🎯 What You Have

A **complete, production-ready farming app** with:

✅ **Full-stack codebase** (frontend + backend)  
✅ **Real-time collaboration** (Socket.io)  
✅ **Offline-first sync** (SQLite + API)  
✅ **Community features** (maps, forums, groups)  
✅ **Smart recommendations** (seasonal vegetables)  
✅ **Email authentication** (register/login)  
✅ **AWS deployment ready** (Docker + cloudformation)  
✅ **Mobile-optimized** (iOS/Android via Expo)  

---

## 📂 Project Files

```
Farming/
├── backend/                 → Node.js API Server
├── mobile/                  → React Native App
├── infrastructure/          → AWS deployment guide
├── docker-compose.yml       → Local dev environment
├── README.md                → Main documentation
└── .gitignore               → Git configuration
```

---

## 🚀 Next Steps (Choose One)

### Option 1: Run Locally with Docker (Easiest)

```bash
cd /Users/somanigunni/Farming

# Start all services
docker-compose up

# Endpoints:
# Backend API: http://localhost:3000
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

Then open another terminal:

```bash
cd mobile
npm install
npm start
# Scan QR code with Expo Go app
```

**Time: 10 minutes**

---

### Option 2: Manual Setup (Full Control)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Create database locally
createdb farmsync
psql -U postgres -d farmsync -f src/database/schema.sql

npm run dev
# Server runs on http://localhost:3000
```

#### Mobile

```bash
cd mobile
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://localhost:3000/api

npm start
# Scan QR code with Expo Go
```

**Time: 15 minutes**

---

### Option 3: Deploy to AWS (Production)

See: [infrastructure/AWS_DEPLOYMENT.md](infrastructure/AWS_DEPLOYMENT.md)

**What's included:**
- RDS PostgreSQL setup
- ECR Docker registry
- App Runner deployment
- S3 image storage
- CloudFront CDN
- Complete CLI commands

**Time: 30-60 minutes**

---

## 🎨 Key Features to Explore

### 1. Create a Farm
- **Endpoint**: `POST /api/farms`
- **UI**: Mobile app → "Create Farm" button
- **Try it**: Add your first farm with location

### 2. Plant a Crop
- **Endpoint**: `POST /api/crops`
- **UI**: Mobile app → Farm detail → Add crop
- **Try it**: Plant tomatoes, lettuce, or peppers

### 3. Get Recommendations
- **Endpoint**: `GET /api/recommendations/seasonal`
- **UI**: Mobile app → "Learn" tab
- **Try it**: See vegetables recommended for your climate

### 4. Find Nearby Farms
- **Endpoint**: `GET /api/map/nearby-farms`
- **UI**: Mobile app → "Community Map" tab
- **Try it**: See other farmers in your area

### 5. Real-time Collaboration
- **Socket events**: `join-farm`, `crop-updated`, `active-users`
- **UI**: Multiple users on same farm see updates instantly
- **Try it**: Open app in two places, plant a crop on one

---

## 📱 Mobile App Navigation

```
📱 FarmSync App
├── 🏠 Home
│   └── Your farms list
│   └── Quick stats
│
├── 🗺️ Map
│   └── Nearby public farms
│   └── Community groups
│
├── 👥 Community
│   └── Discussion forums
│   └── Local groups
│
├── 📖 Learn
│   └── Vegetable care guides
│   └── Seasonal recommendations
│
└── 👤 Profile
    └── User settings
    └── Farm collaborators
```

---

## 🛠️ Customization

### Add a New Vegetable to Database

Edit `backend/src/database/schema.sql` and add to vegetables insert:

```sql
INSERT INTO vegetables (name, difficulty_level, days_to_harvest, season...)
VALUES ('Cucumber', 'novice', 50, 'summer', ...);
```

### Customize Farm Types

Edit `backend/src/database/schema.sql`:

```sql
-- In CREATE TABLE farms:
farm_type VARCHAR(20) CHECK (farm_type IN ('backyard', 'greenhouse', 'YOUR_TYPE'))
```

### Change App Colors

Edit `mobile/App.js` and screen files:

```javascript
// Change from #4CAF50 (green) to your brand color
backgroundColor: '#YOUR_COLOR'
```

### Add Email Service

Update `backend/src/email/mailer.js`:

```javascript
// Change from Gmail to SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: { api_user, api_key }
});
```

---

## 🔗 API Documentation

### Full API Reference

```bash
# View all endpoints
cat backend/README.md

# Test API (use Postman, Insomnia, or curl)
curl http://localhost:3000/health
```

### Common Requests

**Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "experienceLevel": "novice"
  }'
```

**Get Seasonal Recommendations**
```bash
curl http://localhost:3000/api/recommendations/seasonal \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Farm**
```bash
curl -X POST http://localhost:3000/api/farms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Backyard Farm",
    "farmType": "backyard",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "climateZone": "7a"
  }'
```

---

## 💾 Database

### Tables Created

```sql
-- 11 main tables:
users                 -- User profiles
farms                 -- Farm data
farm_collaborators    -- Multi-user farms
crops                 -- Planted vegetables
vegetables            -- Vegetable database (pre-loaded)
growing_seasons       -- Farm seasons
community_groups      -- Local groups
community_members     -- Group members
community_posts       -- Forum posts
post_comments         -- Comments on posts
achievements          -- User badges
sync_queue            -- Offline sync
activity_log          -- Farm timeline
```

### Indexes for Performance

```sql
-- Geospatial indexing (for "nearby farms")
CREATE INDEX idx_farms_location ON farms USING GIST(location);
CREATE INDEX idx_community_groups_location ON community_groups USING GIST(location);

-- Quick lookups
CREATE INDEX idx_crops_farm_id ON crops(farm_id);
CREATE INDEX idx_sync_queue_synced ON sync_queue(synced);
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/farmsync
JWT_SECRET=your_secret_key_here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# AWS (optional, for image uploads)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=farmsync-images
```

### Mobile (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## 🧪 Testing the App

### 1. Create Account
- Open mobile app
- Click "Register"
- Fill in: email, password, name, experience level
- Receive verification email

### 2. Create Farm
- Click "My Farms" → "Create Farm"
- Add name, type (backyard/greenhouse/large)
- Allow location access
- Create farm

### 3. Plant a Crop
- Go to farm detail
- Click "Add Crop"
- Select vegetable from dropdown
- Set planting date
- Select growing method (outdoor/greenhouse)

### 4. Check Recommendations
- Go to "Learn" tab
- See seasonal vegetables for your climate
- Tap any vegetable for care guide

### 5. Discover Community
- Go to "Community Map" tab
- See nearby farms & groups (if any exist)
- Find other farmers in your area

---

## 📊 Example Data

Pre-loaded vegetables include:

- **Tomatoes** (Novice, 65 days, 70-85°F)
- **Lettuce** (Novice, 30 days, 60-70°F)
- **Peppers** (Intermediate, 75 days, 75-85°F)
- **Cucumbers** (Novice, 50 days, 70-80°F)
- **Carrots** (Novice, 60 days, 60-70°F)
- **Broccoli** (Intermediate, 70 days, 65-75°F)
- **Zucchini** (Novice, 45 days, 70-80°F)
- **Spinach** (Novice, 35 days, 50-70°F)
- **Kale** (Novice, 50 days, 50-70°F)
- **Herbs**: Basil, mint, parsley, dill

**Add more:** Edit `backend/src/database/seed.js`

---

## 🐛 Troubleshooting

### "Connection refused" (Port 3000)

```bash
# Check if backend is running
lsof -i :3000

# Kill process using port
kill -9 <PID>

# Or use different port:
PORT=3001 npm run dev
```

### "PostgreSQL connection failed"

```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Start PostgreSQL (macOS)
brew services start postgresql

# Or use Docker:
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
```

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Mobile app won't connect to backend

```bash
# Check API URL in mobile/.env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000/api

# Get your IP:
ifconfig | grep "inet "

# Not 127.0.0.1, use your local network IP!
```

---

## 📈 What's Next?

### Short-term (Next Sprint)
- [ ] Add photo upload for farms & crops
- [ ] Implement water/fertilizer reminders
- [ ] Add weather integration
- [ ] Create user leaderboards

### Medium-term (Q2)
- [ ] Web dashboard (React)
- [ ] Advanced analytics
- [ ] AI crop disease detection
- [ ] Marketplace (buy/sell seeds)

### Long-term (Q3+)
- [ ] Mobile web version
- [ ] Government grants database
- [ ] Blog & educational content
- [ ] Multi-language support

---

## 🤝 Contributing

Want to improve the app? Here's how:

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes** (frontend or backend)

3. **Test locally**
   ```bash
   npm run dev
   npm test
   ```

4. **Commit & push**
   ```bash
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

5. **Create Pull Request** on GitHub

---

## 📞 Support & Questions

- **Documentation**: See README files in backend/ and mobile/
- **API Docs**: backend/README.md
- **Deployment**: infrastructure/AWS_DEPLOYMENT.md
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@farmsync.com (when ready)

---

## 🎉 You're All Set!

Your complete farming platform is ready. Choose how to proceed:

1. **🐳 Docker** (easiest) → `docker-compose up`
2. **⚙️ Manual** (most control) → Setup backend + mobile separately
3. **☁️ AWS** (production) → Follow AWS_DEPLOYMENT.md guide

**Happy farming!** 🌱

---

**Questions?** Check the relevant README:
- Backend: `backend/README.md`
- Mobile: `mobile/README.md`
- Deployment: `infrastructure/AWS_DEPLOYMENT.md`
- Main: `README.md`
