
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Add other Firebase services as needed, e.g., getAuth, getStorage

console.log("Firebase Init: Script start. Reading environment variables...");

// Your web app's Firebase configuration
// Ensure these environment variables are set in your .env.local file for local dev,
// AND in your Netlify environment variables for deployment.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ---- START DEBUG LOGGING ----
console.log("Firebase Init: RAW Environment Variables Check:");
console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET');
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
console.log("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'SET' : 'NOT SET');
console.log("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'NOT SET');
console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'SET' : 'NOT SET');

console.log("Firebase Init: firebaseConfig object to be used for initialization:", JSON.stringify(firebaseConfig, null, 2));
// ---- END DEBUG LOGGING ----


if (!firebaseConfig.projectId) {
    console.error("Firebase Init Critical Error: Firebase Project ID is MISSING or UNDEFINED in the configuration. Application will not connect to Firebase. Check environment variables (Netlify & .env.local).");
} else if (firebaseConfig.projectId === "farmeasy-connect") {
    console.log("Firebase Init: Project ID is correctly 'farmeasy-connect'.");
} else {
    console.warn("Firebase Init Warning: Project ID is '" + firebaseConfig.projectId + "', NOT 'farmeasy-connect'. If this is unexpected, check environment variables.");
}

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        throw new Error("Firebase API Key or Project ID is missing in config. Cannot initialize app.");
    }
    app = initializeApp(firebaseConfig);
    console.log("Firebase Init: Firebase app initialized successfully using the logged config.");
  } catch (error) {
    console.error("Firebase Init Error: Failed to initialize Firebase app:", error);
    console.error("Firebase Init Error: Config used during failed attempt:", JSON.stringify(firebaseConfig, null, 2));
    app = null; // Ensure app is null if initialization fails
  }
} else {
  app = getApp();
  console.log("Firebase Init: Existing Firebase app retrieved. Config for this app:", JSON.stringify(app.options, null, 2));
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

    