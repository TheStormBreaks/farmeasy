
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Add other Firebase services as needed, e.g., getAuth, getStorage

console.log("Firebase Init: Reading environment variables...");
console.log("Firebase Init: NEXT_PUBLIC_FIREBASE_PROJECT_ID is set:", !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Your web app's Firebase configuration
// Ensure these environment variables are set in your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
    console.error("Firebase Init Error: Firebase Project ID is not configured. Real-time updates will not work. Check your .env.local file and Netlify environment variables.");
} else {
    console.log("Firebase Init: Configured Project ID:", firebaseConfig.projectId);
}

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase Init: Firebase app initialized successfully.");
  } catch (error) {
    console.error("Firebase Init Error: Failed to initialize Firebase app:", error);
    app = null; // Ensure app is null if initialization fails
  }
} else {
  app = getApp();
  console.log("Firebase Init: Existing Firebase app retrieved.");
}

let db;
if (app) {
  try {
    db = getFirestore(app);
    console.log("Firebase Init: Firestore instance obtained successfully.");
  } catch (error) {
    console.error("Firebase Init Error: Failed to get Firestore instance:", error);
    db = null; // Ensure db is null if obtaining instance fails
  }
} else {
    console.error("Firebase Init: Firebase app is not available, cannot get Firestore instance.");
    db = null;
}

// const auth = getAuth(app); // Initialize Auth if needed
// const storage = getStorage(app); // Initialize Storage if needed

export { app, db /*, auth, storage */ }; // Export db and other services
