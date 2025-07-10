"use client"

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import firebase from "./firebase"

const { db, auth } = firebase

export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface FMEARecord {
  id: string
  processName: string
  date: string
  potentialFailure: string
  severity: number
  occurrence: number
  detection: number
  rpn: number
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

// Convert Firestore timestamp to string
const timestampToString = (timestamp: any): string => {
  if (typeof timestamp === "string") return timestamp
  if (timestamp && typeof timestamp === "object" && "toDate" in timestamp) {
    return timestamp.toDate().toISOString()
  }
  return new Date().toISOString()
}

// User operations
export const userDB = {
  async create(userData: { name: string; email: string; password: string; role: string }): Promise<User> {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const firebaseUser = userCredential.user

      // Create user document in Firestore
      const userDoc = {
        uid: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "users"), userDoc)
      console.log("User document created with ID:", docRef.id)

      return {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: new Date().toISOString(),
      }
    } catch (error: any) {
      console.error("User creation error:", error)
      if (error.code === "auth/email-already-in-use") {
        throw new Error("An account with this email already exists")
      } else if (error.code === "auth/weak-password") {
        throw new Error("Password should be at least 6 characters")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address")
      }
      throw new Error(error.message || "Failed to create user account")
    }
  },

  async findByEmail(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, "users"), where("email", "==", email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return null

      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      return {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: timestampToString(userData.createdAt),
      }
    } catch (error) {
      console.error("Error finding user by email:", error)
      return null
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      const q = query(collection(db, "users"), where("uid", "==", id))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return null

      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      return {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: timestampToString(userData.createdAt),
      }
    } catch (error) {
      console.error("Error finding user by ID:", error)
      return null
    }
  },

  async authenticate(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      const user = await this.findById(firebaseUser.uid)

      // If user document doesn't exist in Firestore, create it
      if (!user) {
        const newUserDoc = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || email,
          role: "User",
          createdAt: serverTimestamp(),
        }

        await addDoc(collection(db, "users"), newUserDoc)

        return {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || email,
          role: "User",
          createdAt: new Date().toISOString(),
        }
      }

      return user
    } catch (error: any) {
      console.error("Authentication error:", error)
      if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email")
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password")
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address")
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later")
      }
      return null
    }
  },

  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (typeof window === "undefined") {
      callback(null)
      return () => {}
    }

    try {
      return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const user = await this.findById(firebaseUser.uid)
            callback(user)
          } catch (error) {
            console.error("Error getting user data:", error)
            callback(null)
          }
        } else {
          callback(null)
        }
      })
    } catch (error) {
      console.error("Error setting up auth listener:", error)
      callback(null)
      return () => {}
    }
  },
}

// FMEA operations
export const fmeaDB = {
  async create(fmeaData: Omit<FMEARecord, "id" | "rpn" | "createdAt" | "updatedAt">): Promise<FMEARecord> {
    try {
      const rpn = fmeaData.severity * fmeaData.occurrence * fmeaData.detection

      const docData = {
        processName: fmeaData.processName,
        date: fmeaData.date,
        potentialFailure: fmeaData.potentialFailure,
        severity: fmeaData.severity,
        occurrence: fmeaData.occurrence,
        detection: fmeaData.detection,
        rpn,
        description: fmeaData.description,
        userId: fmeaData.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "fmea_records"), docData)

      return {
        id: docRef.id,
        processName: fmeaData.processName,
        date: fmeaData.date,
        potentialFailure: fmeaData.potentialFailure,
        severity: fmeaData.severity,
        occurrence: fmeaData.occurrence,
        detection: fmeaData.detection,
        rpn,
        description: fmeaData.description,
        userId: fmeaData.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error creating FMEA record:", error)
      throw error
    }
  },

  async update(id: string, fmeaData: Partial<Omit<FMEARecord, "id" | "createdAt">>): Promise<FMEARecord | null> {
    try {
      const docRef = doc(db, "fmea_records", id)

      // Get current document to calculate RPN if needed
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return null

      const currentData = docSnap.data()

      const updatedData: any = {}

      // Copy over the fields that are being updated
      if (fmeaData.processName !== undefined) updatedData.processName = fmeaData.processName
      if (fmeaData.date !== undefined) updatedData.date = fmeaData.date
      if (fmeaData.potentialFailure !== undefined) updatedData.potentialFailure = fmeaData.potentialFailure
      if (fmeaData.severity !== undefined) updatedData.severity = fmeaData.severity
      if (fmeaData.occurrence !== undefined) updatedData.occurrence = fmeaData.occurrence
      if (fmeaData.detection !== undefined) updatedData.detection = fmeaData.detection
      if (fmeaData.description !== undefined) updatedData.description = fmeaData.description

      // Calculate RPN if any of the risk factors changed
      if (fmeaData.severity !== undefined || fmeaData.occurrence !== undefined || fmeaData.detection !== undefined) {
        const severity = fmeaData.severity ?? currentData.severity
        const occurrence = fmeaData.occurrence ?? currentData.occurrence
        const detection = fmeaData.detection ?? currentData.detection
        updatedData.rpn = severity * occurrence * detection
      }

      updatedData.updatedAt = serverTimestamp()

      await updateDoc(docRef, updatedData)

      // Return updated document
      const updatedDoc = await getDoc(docRef)
      const data = updatedDoc.data()

      if (!data) return null

      return {
        id: updatedDoc.id,
        processName: data.processName,
        date: data.date,
        potentialFailure: data.potentialFailure,
        severity: data.severity,
        occurrence: data.occurrence,
        detection: data.detection,
        rpn: data.rpn,
        description: data.description,
        userId: data.userId,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      }
    } catch (error) {
      console.error("Error updating FMEA record:", error)
      throw error
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "fmea_records", id))
      return true
    } catch (error) {
      console.error("Error deleting FMEA record:", error)
      return false
    }
  },

  async findById(id: string): Promise<FMEARecord | null> {
    try {
      const docRef = doc(db, "fmea_records", id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) return null

      const data = docSnap.data()
      return {
        id: docSnap.id,
        processName: data.processName,
        date: data.date,
        potentialFailure: data.potentialFailure,
        severity: data.severity,
        occurrence: data.occurrence,
        detection: data.detection,
        rpn: data.rpn,
        description: data.description,
        userId: data.userId,
        createdAt: timestampToString(data.createdAt),
        updatedAt: timestampToString(data.updatedAt),
      }
    } catch (error) {
      console.error("Error finding FMEA record:", error)
      return null
    }
  },

  async findByUserId(userId: string): Promise<FMEARecord[]> {
    try {
      // Temporary fix: Query without ordering to avoid index requirement
      const q = query(collection(db, "fmea_records"), where("userId", "==", userId))

      const querySnapshot = await getDocs(q)

      const records = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          processName: data.processName,
          date: data.date,
          potentialFailure: data.potentialFailure,
          severity: data.severity,
          occurrence: data.occurrence,
          detection: data.detection,
          rpn: data.rpn,
          description: data.description,
          userId: data.userId,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        }
      })

      // Sort in JavaScript instead of Firestore
      return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error("Error finding FMEA records by user ID:", error)
      return []
    }
  },

  async getAll(): Promise<FMEARecord[]> {
    try {
      // Temporary fix: Query without ordering to avoid index requirement
      const q = query(collection(db, "fmea_records"))
      const querySnapshot = await getDocs(q)

      const records = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          processName: data.processName,
          date: data.date,
          potentialFailure: data.potentialFailure,
          severity: data.severity,
          occurrence: data.occurrence,
          detection: data.detection,
          rpn: data.rpn,
          description: data.description,
          userId: data.userId,
          createdAt: timestampToString(data.createdAt),
          updatedAt: timestampToString(data.updatedAt),
        }
      })

      // Sort in JavaScript instead of Firestore
      return records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error("Error getting all FMEA records:", error)
      return []
    }
  },
}

// Initialize demo data (optional - for development)
export const initializeDatabase = async () => {
  console.log("Firebase database initialized")
}
