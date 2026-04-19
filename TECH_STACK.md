# FarmSync - Technology Stack & Architecture

## 📋 Complete Tech Stack

### Frontend (Mobile App)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React Native | 0.71.0 | Cross-platform mobile |
| Build System | Expo | 48.0.0 | Managed React Native workflow |
| Navigation | React Navigation | 6.1.0 | Tab & stack navigation |
| State Management | Zustand | 4.3.7 | Global state (lightweight) |
| HTTP Client | Axios | 1.4.0 | API requests |
| Real-time | Socket.io Client | 4.6.1 | WebSocket communication |
| Local Storage | AsyncStorage | 1.17.0 | Persistent state |
| Offline DB | SQLite | 11.3.0 | Local-first data |
| Maps | React Native Maps | 1.3.2 | Geospatial features |
| Camera | Expo Camera | 5.0.5 | Photo capture |
| Location | Expo Location | 16.0.0 | GPS & geolocation |
| Notifications | Expo Notifications | 0.18.0 | Push notifications |
| Icons | Vector Icons | 9.2.0 | UI icons |
| Image Picker | Expo Image Picker | 14.0.0 | Photo selection |
| UI Components | React Native Core | Custom | Buttons, inputs, etc. |

### Backend (API Server)
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18.0+ | JavaScript backend |
| Framework | Express.js | 4.18.2 | HTTP server |
| Real-time | Socket.io | 4.6.1 | WebSocket server |
| Database | PostgreSQL | 13+ | Relational DB |
| ORM | Custom | - | Parameterized queries |
| Geo Extension | PostGIS | 3.3 | Geospatial queries |
| Authentication | JWT | - | Token-based auth |
| Hashing | bcryptjs | 2.4.3 | Password security |
| Email | Nodemailer | 6.9.1 | Email sending |
| HTTP | Axios | 1.4.0 | External API calls |
| CORS | CORS | 2.8.5 | Cross-origin requests |
| Validation | Validator.js | 13.9.0 | Input validation |
| IDs | UUID | 9.0.0 | Unique identifiers |
| Cache | Node Cache | 5.1.2 | In-memory caching |
| Geohashing | Geohash Poly | 0.0.6 | Geospatial hashing |
| Spatial | Turf.js | 6.5.0 | Geospatial analysis |

### Database
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| SQL DB | PostgreSQL | 15+ | Primary database |
| Geo Extension | PostGIS | 3.3 | Spatial queries (nearby farms) |
| Backup | AWS RDS | - | Managed database (production) |
| Cache | Redis | 7-alpine | Session & pub/sub (optional) |

### Cloud Infrastructure
| Component | Service | Purpose |
|-----------|---------|---------|
| Compute | AWS App Runner | Container deployment |
| Database | AWS RDS | Managed PostgreSQL |
| Storage | AWS S3 | Image hosting |
| CDN | AWS CloudFront | Image delivery |
| DNS | Route 53 | Domain management |
| Logging | CloudWatch | Application logs |
| Secrets | AWS Secrets Manager | Secure config |
| Container Registry | AWS ECR | Docker image storage |
| SSL/TLS | AWS ACM | HTTPS certificates |

### Development & Deployment
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker | Image packaging |
| Orchestration | Docker Compose | Local multi-container |
| CI/CD | GitHub Actions | Automated deployment |
| Version Control | Git/GitHub | Code management |
| Testing | Jest | Unit testing |
| Code Quality | ESLint | Code standards |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────┐
│    Mobile App (React Native)        │
│  - iOS via Xcode/App Store          │
│  - Android via Google Play           │
│  - Web via Expo Web                  │
│                                     │
│  Features:                           │
│  • Offline-first (SQLite)            │
│  • Real-time updates (Socket.io)     │
│  • Location services (GPS)           │
│  • Camera/photos                     │
│  • Push notifications                │
└──────────────────┬──────────────────┘
                   │ REST API + WebSockets
                   │ (HTTPS)
┌──────────────────┴──────────────────┐
│   Backend API (Node.js + Express)   │
│   AWS App Runner / Docker           │
│                                     │
│  Key Routes:                         │
│  • /api/auth         (JWT)           │
│  • /api/farms        (CRUD)          │
│  • /api/crops        (Tracking)      │
│  • /api/community    (Forums)        │
│  • /api/map          (Geospatial)    │
│  • /api/recommendations (Smart)      │
│  • /api/sync         (Offline)       │
│                                     │
│  Real-time:                          │
│  • Socket.io events                  │
│  • Activity feeds                    │
│  • Collaboration                     │
└──────────────────┬──────────────────┘
                   │ PostgreSQL Driver
                   │
┌──────────────────┴──────────────────┐
│  Database (PostgreSQL + PostGIS)    │
│  AWS RDS / Docker                   │
│                                     │
│  13 Tables:                          │
│  • users (profiles)                  │
│  • farms (data + geospatial)         │
│  • crops (tracking)                  │
│  • vegetables (database)             │
│  • community (forums, groups)        │
│  • activity_log (timeline)           │
│  • sync_queue (offline)              │
└─────────────────────────────────────┘
```

---

## 🔄 Data Flow

### User Registration → Farming

```
Mobile App
  ↓ Register (email, password)
API
  ↓ Create user, send verification email
Database (users table)
  ↓ User clicks email link
Mobile
  ↓ Auto-login with JWT token
AsyncStorage (store token)
  ↓ Create farm (location, type)
API (+ real-time event)
  ↓ Insert farm, broadcast to collaborators
Database (farms table + geospatial index)
```

### Crop Tracking → Community

```
Mobile App (Camera → Photo)
  ↓ Plant crop (select vegetable)
Database (crops table)
  ↓ Check recommendations (seasonal)
Vegetables table
  ↓ Post to community forum
Database (community_posts)
  ↓ Real-time notification to group members
Socket.io → Other users' apps
```

### Offline → Sync

```
Mobile App (No Internet)
  ↓ Add crop to local SQLite
sync_queue table (local)
  ↓ Internet available?
Yes → Push to API
  ↓ API validates & stores
Database
  ↓ Mark sync_queue as synced
Mobile (confirm)
```

---

## 📊 Database Schema Overview

### Geospatial Queries (PostGIS)

```sql
-- Find farms within 15km
SELECT * FROM farms
WHERE ST_DWithin(location, user_point, 15000)
ORDER BY ST_Distance(location, user_point);

-- Create geospatial indexes for performance
CREATE INDEX idx_farms_location ON farms USING GIST(location);
```

### Real-time Activity

```sql
-- Activity timeline
INSERT INTO activity_log (farm_id, user_id, action, details)
VALUES ($1, $2, 'crop_planted', $3);

-- Trigger updates
SELECT * FROM activity_log 
WHERE farm_id = $1
ORDER BY created_at DESC LIMIT 50;
```

### Offline Sync Queue

```sql
-- Track changes made offline
INSERT INTO sync_queue (user_id, entity_type, operation, payload, synced)
VALUES ($1, 'crop', 'create', '{"..."}', FALSE);

-- Sync when online
UPDATE sync_queue SET synced = TRUE WHERE id = $1;
```

---

## 🔐 Security Layers

### Authentication
- JWT tokens (stateless)
- 7-day expiration
- Refresh token mechanism (optional)
- Email verification on signup

### Password
- bcryptjs hashing (12 rounds)
- Minimum 8 chars, uppercase, lowercase, number
- Never stored in plaintext

### API Security
- CORS enabled (whitelisted origins)
- Input validation (Validator.js)
- SQL injection prevention (parameterized queries)
- Rate limiting (TODO: express-rate-limit)
- HTTPS in production (AWS ACM)

### Data Privacy
- User location only visible in community map if public
- Private farms hidden from search
- Email addresses not exposed in API responses
- Session tokens stored securely in AsyncStorage

---

## 📈 Performance Optimizations

### Database
- **Indexes** on: email, farm_id, location, user_id, synced
- **PostGIS GIST index** for geospatial queries
- **Parameterized queries** prevent SQL injection
- **Connection pooling** (pg pool)

### API
- **Caching** with node-cache for vegetables database
- **Pagination** for large datasets (crops, posts)
- **Lazy loading** of images
- **Compression** (gzip)

### Mobile
- **FlatList** instead of ScrollView for long lists
- **React.memo** for expensive components
- **SQLite** for offline caching
- **Image optimization** before upload
- **Bundle size** reduction with Expo

### Network
- **CloudFront CDN** for images (production)
- **Compression** of API responses
- **Minimal payload sizes**
- **Socket.io** automatic reconnection

---

## 🚀 Scalability Path

### Current (MVP)
- Single-server deployment
- PostgreSQL managed (RDS)
- File uploads to S3
- Basic caching

### Phase 2 (Growth)
- Load balancer (ALB)
- Read replicas (PostgreSQL)
- Redis for sessions & caching
- Message queue (SQS) for emails

### Phase 3 (Scale)
- Database sharding (by region)
- Microservices (user, farm, community)
- Elasticsearch for search
- Analytics pipeline (Kafka)

---

## 📦 Dependency Management

### Backend Dependencies (30 packages)
```json
{
  "production": [
    "express", "socket.io", "pg", "jsonwebtoken",
    "bcryptjs", "nodemailer", "cors", "validator",
    "uuid", "axios"
  ],
  "optional": [
    "redis", "aws-sdk", "multer"
  ]
}
```

### Mobile Dependencies (25 packages)
```json
{
  "core": [
    "react", "react-native", "expo"
  ],
  "navigation": [
    "@react-navigation/native",
    "@react-navigation/stack",
    "@react-navigation/bottom-tabs"
  ],
  "state": [
    "zustand"
  ],
  "networking": [
    "axios", "socket.io-client"
  ],
  "offline": [
    "@react-native-async-storage/async-storage",
    "expo-sqlite"
  ],
  "location": [
    "expo-location", "react-native-maps"
  ],
  "media": [
    "expo-image-picker", "@react-native-camera/camera"
  ]
}
```

---

## 🔄 CI/CD Pipeline

### Local Development
```
npm install → npm run dev → localhost:3000
```

### GitHub Actions
```
Push to main
  ↓ Run tests
  ↓ Build Docker image
  ↓ Push to ECR
  ↓ Deploy to App Runner
  ↓ Run smoke tests
```

---

## 📊 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] JWT secret changed
- [ ] Email service configured
- [ ] S3 bucket created & permissions set
- [ ] CloudFront distribution created
- [ ] Domain DNS records configured
- [ ] SSL certificate installed
- [ ] Monitoring (CloudWatch) enabled
- [ ] Backups automated (RDS)
- [ ] Load testing completed
- [ ] Security audit passed

---

## 🎓 Learning Resources

### Recommended Reading
- **PostgreSQL + PostGIS**: [PostGIS Manual](https://postgis.net/docs/)
- **React Native**: [React Native Docs](https://reactnative.dev/)
- **Node.js**: [Node.js Best Practices](https://nodejs.org/en/docs/)
- **Socket.io**: [Socket.io Guide](https://socket.io/docs/)
- **AWS**: [AWS Training](https://www.aws.training/)

### Similar Projects
- **Stardew Valley** (farming simulation)
- **Harvest Moon** (farming community)
- **eBay/Craigslist** (community marketplace)
- **Discord** (real-time community)

---

## 🤝 Contributing Guidelines

1. Follow coding standards (ESLint)
2. Write tests for new features
3. Update documentation
4. Follow commit message format:
   ```
   feat(auth): Add Google OAuth
   fix(map): Correct geospatial query
   docs(api): Update endpoint description
   ```

---

**Last Updated:** April 2024  
**Stack Version:** 1.0.0  
**Status:** Production-Ready MVP
