# FarmSync Backend API

Production-ready Node.js + Express backend for the FarmSync community farming platform.

## Features

✅ **Authentication**
- Email/password registration & login
- JWT token-based auth
- Email verification
- Password reset

✅ **Farm Management**
- Create and manage farms (backyard to large scale)
- Multi-user collaboration
- Activity logging
- Farm privacy controls

✅ **Crop Tracking**
- Plant new crops
- Track growth stages
- Record harvest data
- Photo documentation

✅ **Smart Recommendations**
- Seasonal vegetable suggestions
- Climate-based recommendations
- Difficulty levels (novice/intermediate/expert)
- Care guides & companion planting

✅ **Community Features**
- Community groups/gardens
- Discussion forums
- Share success stories & tips
- Local networking

✅ **Geospatial Features**
- Find nearby farms & groups
- Location-based recommendations
- Map integration (PostGIS)

✅ **Real-time Collaboration**
- Socket.io for live updates
- Multiple users managing one farm
- Activity feeds
- User presence tracking

✅ **Offline-first Sync**
- Queue offline changes
- Automatic sync when connected
- Conflict resolution

## Setup

### Prerequisites
- Node.js 16+
- PostgreSQL 13+ with PostGIS
- Redis (optional, for caching)

### Installation

```bash
cd backend
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Create database and tables
psql -U postgres -d farmsync -f src/database/schema.sql

# (Optional) Seed with vegetable data
node src/database/seed.js
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-token` - Verify JWT
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Farms
- `POST /api/farms` - Create farm
- `GET /api/farms/my-farms` - Get user's farms
- `GET /api/farms/:farmId` - Get farm details
- `PUT /api/farms/:farmId` - Update farm
- `POST /api/farms/:farmId/collaborators` - Add collaborator
- `GET /api/farms/:farmId/activity` - Get farm activity

### Crops
- `POST /api/crops` - Plant new crop
- `GET /api/crops/farm/:farmId` - Get farm's crops
- `PUT /api/crops/:cropId` - Update crop

### Recommendations
- `GET /api/recommendations/vegetables` - Get recommended vegetables
- `GET /api/recommendations/vegetable/:vegetableId` - Get care guide
- `GET /api/recommendations/seasonal` - Seasonal recommendations

### Map & Community
- `GET /api/map/nearby-farms` - Find nearby farms
- `GET /api/map/nearby-groups` - Find community groups
- `POST /api/community/groups` - Create group
- `POST /api/community/groups/:groupId/posts` - Create post
- `GET /api/community/groups/:groupId/posts` - Get group posts

### Sync
- `POST /api/sync/push` - Push offline changes
- `GET /api/sync/pending` - Get pending changes
- `POST /api/sync/confirm` - Confirm sync

## Real-time Socket Events

```javascript
socket.emit('join-farm', farmId, userId);
socket.on('crop-updated', cropData => {...});
socket.on('active-users', data => {...});
socket.emit('farm-comment', comment);
```

## Database Schema

- `users` - User profiles & authentication
- `farms` - Farm information
- `farm_collaborators` - Multi-user farm management
- `crops` - Planted vegetables
- `vegetables` - Vegetable database with guides
- `community_groups` - Community gardens
- `community_posts` - Forum posts & discussions
- `sync_queue` - Offline-first sync queue
- `activity_log` - Farm activity timeline

## Environment Variables

See `.env.example`

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Secret for JWT signing
- `SMTP_*` - Email configuration
- `AWS_*` - S3 image uploads
- `CORS_ORIGIN` - Allowed origins

## Deployment

### AWS App Runner / Lambda

```bash
# Docker image available at root/Dockerfile
# Deploy with AWS CDK (see /infrastructure folder)
```

### Heroku

```bash
git push heroku main
heroku config:set JWT_SECRET=xxxx
heroku addons:create heroku-postgresql
```

## Testing

```bash
npm test
```

## License

MIT
