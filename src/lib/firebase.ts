// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// These values will come from your .env.local file
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
let db;
let analytics;

if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("CRITICAL: Firebase API Key or Project ID is missing. Firebase will not initialize. Check environment variables.");
    // app remains undefined, db remains undefined
  } else {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized with new config.");
      } catch (e) {
        console.error("Error initializing Firebase app with new config:", e);
        app = undefined;
      }
    } else {
      app = getApp();
      console.log("Existing Firebase app retrieved (new config context).");
    }

    if (app) {
      try {
        db = getFirestore(app);
        console.log("Firestore instance obtained with new config.");
      } catch (e) {
        console.error("Error getting Firestore instance with new config:", e);
        db = undefined;
      }

      // Initialize Analytics if supported
      isAnalyticsSupported().then((supported) => {
        if (supported && app) {
          try {
            analytics = getAnalytics(app);
            console.log("Firebase Analytics initialized with new config.");
          } catch(e) {
            console.error("Error initializing Firebase Analytics with new config:", e);
            analytics = undefined;
          }
        } else {
          console.log("Firebase Analytics is not supported in this environment or app not available.");
        }
      });

    } else {
      console.error("Firebase app not available, Firestore & Analytics instances cannot be created (new config context).");
    }
  }
}

export { app, db, analytics };
