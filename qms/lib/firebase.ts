// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCMNoEYwTOFqZarZr2fy-yjMr",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "qms-prod-2b3a2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "qms-prod-2b3a2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "qms-prod-2b3a2.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "602660560656",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:602660560656:web:afd5df0ac87583e65acf95",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-0VKHH4MRNX",
}

// Debug: Log the config to see what's being loaded
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "✓ Loaded" : "✗ Missing",
  authDomain: firebaseConfig.authDomain ? "✓ Loaded" : "✗ Missing",
  projectId: firebaseConfig.projectId ? "✓ Loaded" : "✗ Missing",
})

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore
const db = getFirestore(app)

// Initialize Auth
const auth = getAuth(app)

// Initialize Analytics (optional)
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      try {
        getAnalytics(app)
        console.log("✓ Firebase Analytics initialized")
      } catch (error) {
        console.log("Analytics not available:", error)
      }
    })
    .catch((error) => {
      console.log("Analytics import failed:", error)
    })
}

// Log successful initialization
console.log("✓ Firebase initialized successfully")
console.log("✓ Firestore initialized")
console.log("✓ Auth initialized")

export default {
  db,
  auth,
}
