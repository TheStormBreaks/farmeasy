
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app = null; // Initialize app to null
if (!getApps().length) {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("CRITICAL: Firebase API Key or Project ID is missing. Firebase will not initialize. Check environment variables.");
    // app remains null
  } else {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized.");
    } catch (e) {
      console.error("Error initializing Firebase app:", e);
      // app remains null
    }
  }
} else {
  app = getApp();
  console.log("Existing Firebase app retrieved.");
}

let db = null; // Initialize db to null
if (app) {
  try {
    db = getFirestore(app);
    console.log("Firestore instance obtained.");
  } catch (e) {
    console.error("Error getting Firestore instance:", e);
    // db remains null
  }
} else {
  console.error("Firebase app not available, Firestore instance cannot be created.");
}

export { app, db };
