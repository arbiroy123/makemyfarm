# FarmSync Mobile App

React Native + Expo mobile application for iOS & Android.

## Features

✅ **Email Authentication**
- Register with email
- Login with token-based auth
- Persistent sessions

✅ **Farm Management**
- Create farms (backyard to 1-acre)
- Multiple farm types (outdoor, greenhouse, hybrid)
- Track farm collaborators
- Real-time activity feed

✅ **Crop Tracking**
- Plant vegetables with care guides
- Track growth stages
- Log harvests
- Photo documentation

✅ **Smart Recommendations**
- Seasonal vegetable suggestions
- Climate-based recommendations
- Difficulty levels (novice/intermediate/expert)
- Care guides & companion planting

✅ **Community Map**
- Find nearby public farms
- Discover community groups
- Location-based networking
- Geospatial search (15km radius)

✅ **Offline-First**
- Works without internet
- SQLite local database
- Automatic sync when connected
- Conflict-free sync queue

✅ **Real-time Collaboration**
- Multiple users managing one farm
- Live activity updates
- User presence tracking
- Instant notifications

## Setup

### Prerequisites
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS) or TestFlight
- Android: Android Studio or Google Play

### Installation

```bash
cd mobile
npm install

# Set up environment
cp .env.example .env
# Edit .env with your backend URL
```

### Development

```bash
npm start

# For iOS Simulator
npm run ios

# For Android Emulator
npm run android

# For Web (preview)
npm run web
```

Scan QR code with Expo Go app to test on device.

## Project Structure

```
src/
├── api/              # API client & endpoints
├── screens/          # React Native screens
│   ├── auth/         # Login/Register
│   ├── home/         # Farm list
│   ├── farms/        # Farm details
│   ├── crops/        # Crop tracking
│   ├── map/          # Community map
│   ├── community/    # Forums & groups
│   ├── profile/      # User profile
│   └── recommendations/
├── store/            # Zustand global state
└── utils/            # Helper functions & SQLite
```

## Key Technologies

- **React Native** - Cross-platform mobile
- **Expo** - Rapid development & deployment
- **Zustand** - State management
- **SQLite** - Local offline database
- **React Navigation** - Routing
- **Socket.io** - Real-time updates
- **Native Maps** - Geospatial features

## Authentication Flow

1. User registers with email/password
2. JWT token received from backend
3. Token stored in AsyncStorage
4. Automatic refresh on app launch
5. Logout clears token & local data

## Offline-First Architecture

```
Offline Events → Sync Queue (SQLite)
                      ↓
            Network Available?
                  ↙         ↘
                Yes         No
                 ↓
        Push to Backend
                 ↓
        Mark as Synced
```

## Real-time Updates

```
Socket.io
  ├── join-farm → Subscribe to farm updates
  ├── crop-updated → Broadcast crop changes
  ├── farm-comment → Live comments
  └── active-users → User presence
```

## Building for Release

### iOS
```bash
eas build --platform ios --auto-submit
```

### Android
```bash
eas build --platform android
```

## Environment Variables

```
EXPO_PUBLIC_API_URL=https://api.farmsync.com
EXPO_PUBLIC_SOCKET_URL=https://api.farmsync.com
```

## Testing

```bash
npm test
```

## Performance Tips

- Use FlatList for large lists
- Memoize expensive components with React.memo
- Optimize images before upload
- Cache data in SQLite
- Use Network Link State to detect connectivity

## Deployment

1. Configure EAS Build (`eas.json`)
2. Build release: `eas build --platform ios --release`
3. Submit to App Store: `eas submit`
4. For Android: Upload to Google Play Console

## License

MIT
