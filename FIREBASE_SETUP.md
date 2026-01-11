# Firebase Setup Guide

## Step 1: Firebase Service Account Key

You need to generate a service account key for the backend to connect to Firebase.

### Instructions:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if you haven't)
3. Click the **gear icon** ⚙️ → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded JSON file as `serviceAccountKey.json`
7. Move it to the root of your project: `/Users/shubhamkhilari/Internshsip /Departmental_Intership/serviceAccountKey.json`

> [!WARNING] > **Never commit this file to Git!** It contains sensitive credentials. Add it to `.gitignore` if not already present.

## Step 2: Update Environment Variables

Add these variables to your `.env` file:

```env
# Backend Configuration
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Frontend Configuration (if not already present)
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
```

You can find these values in Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

## Step 3: Install Dependencies (if needed)

The backend already has `firebase-admin` in package.json, but verify installation:

```bash
cd backend
npm install
```

## Step 4: Enable Firestore

1. In Firebase Console, click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (we'll apply security rules later)
4. Select a location (choose closest to your users)
5. Click **Enable**

## Step 5: Deploy Firestore Security Rules

Once Firestore is enabled, deploy the security rules:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# When prompted:
# - Select your Firebase project
# - Accept default locations for firestore.rules and firestore.indexes.json

# Deploy the rules
firebase deploy --only firestore:rules
```

## Step 6: Enable Authentication

1. In Firebase Console, click **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

## Next Steps

Once you've completed these steps, you can:

1. Start the backend server: `npm run dev`
2. Proceed with frontend integration
3. Test the authentication flow

## Troubleshooting

### Error: "Firebase Admin SDK initialization failed"

- Check that `serviceAccountKey.json` exists in the correct location
- Verify `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` points to the correct file

### Error: "Permission denied" in Firestore

- Make sure you've deployed the security rules
- Check that authentication is working properly

### Backend won't start

- Check for port conflicts (port 3000 already in use)
- Verify all dependencies are installed: `npm install`
