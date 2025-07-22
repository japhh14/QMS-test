// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Helper to ensure all required env vars are present
function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

console.log("ENV VARS SNAPSHOT", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NODE_ENV: process.env.NODE_ENV,
})

const firebaseConfig = {
  apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: getEnvVar("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
}

// Debug: Log the config to see what's being loaded (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("Firebase Config Loaded:", Object.keys(firebaseConfig))
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore
const db = getFirestore(app)

// Initialize Auth
const auth = getAuth(app)

// Initialize Analytics (optional, only on client)
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

// Log successful initialization (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("✓ Firebase initialized successfully")
  console.log("✓ Firestore initialized")
  console.log("✓ Auth initialized")
}

export default {
  db,
  auth,
}
