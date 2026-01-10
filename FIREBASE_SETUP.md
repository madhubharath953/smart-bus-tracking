# Firebase Setup Guide

Follow these steps to connect your Smart Bus Tracking app to Firebase Firestore:

## 1. Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the steps.
3.  Once the project is created, click on the **Web** icon (</>) to register an app.
4.  Copy the `firebaseConfig` object provided.

## 2. Enable Firestore Database
1.  In the Firebase left sidebar, click **"Firestore Database"**.
2.  Click **"Create database"**.
3.  Choose **"Start in test mode"** (for development) and select a location close to you.

## 3. Configure Environment Variables
Create a file named `.env.local` in the root directory (`d:\bus\smart-bus-tracking`) and paste your config like this:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
```

## 4. Restart the Dev Server
Wait for the environment variables to load by restarting your terminal or the `npm run dev` command.

The app is now ready to track buses in real-time across the cloud!
