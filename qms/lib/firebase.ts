// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMNoEYwTOFqZarZr2fy-yjMrC9OayeTgQ",
  authDomain: "qms-prod-2b3a2.firebaseapp.com",
  projectId: "qms-prod-2b3a2",
  storageBucket: "qms-prod-2b3a2.appspot.com",
  messagingSenderId: "602660560656",
  appId: "1:602660560656:web:afd5df0ac87583e65acf95",
  measurementId: "G-0VKHH4MRNX"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    getAnalytics(app);
  });
}

const db = getFirestore(app);
const auth = getAuth(app);

export default {
  db,
  auth,
};
