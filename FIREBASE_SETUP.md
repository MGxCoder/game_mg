# Neon Surge - Firebase Setup Guide

## Quick Start

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Enter name → Create
3. Enable **Authentication** → Sign-in method → Enable **Anonymous** and **Google**
4. Enable **Firestore Database** → Create database → Start in **test mode**

### 2. Get Firebase Config
1. In Firebase Console → Project Settings → Your Apps
2. Click "Add app" → Web (</>) → Register app
3. Copy the config values

### 3. Set Environment Variables
Create `.env` file in project root:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Initialize Firebase CLI
```bash
# If not done already
firebase login

# Initialize project (select Hosting and Firestore)
firebase init

# Select:
# - Firestore
# - Hosting
# - Use existing project: [your-project-id]
# - Public directory: build
# - Single-page app: Yes
# - Don't overwrite index.html
```

### 5. Deploy
```bash
npm run deploy
```

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run build` | Build for production |
| `npm run deploy` | Build + Deploy to Firebase |
| `npm run deploy:hosting` | Deploy only hosting |
| `npm run deploy:rules` | Deploy only Firestore rules |

## Features

### Cloud Save
- Automatic anonymous authentication
- Game progress synced to Firestore
- Optional Google account linking
- Merges local + cloud data (keeps best scores)

### Leaderboard
- Real-time global rankings
- Player rank tracking
- Updates automatically on new high scores

### Data Stored
- High scores & coins
- Achievements & unlocks
- Owned skins
- Daily streak progress
- Game statistics

## Security Rules
The included `firestore.rules` ensures:
- Users can only read/write their own data
- Leaderboard is public read, authenticated write
- Scores can only increase (no cheating)

## Troubleshooting

**"Firebase not configured"**  
Make sure `.env` file exists with valid credentials

**"Permission denied"**  
Check Firestore rules are deployed: `npm run deploy:rules`

**Leaderboard empty**  
Play a game to submit your first score!
