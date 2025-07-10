"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { userDB, type User } from "@/lib/database"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    // Listen to authentication state changes
    const unsubscribe = userDB.onAuthStateChanged((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await userDB.authenticate(email, password)
      if (authenticatedUser) {
        setUser(authenticatedUser)
        return true
      }
      return false
    } catch (error: any) {
      console.error("Login error:", error)
      // Re-throw the error so the component can show the specific message
      throw error
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const newUser = await userDB.create({
        name,
        email,
        password,
        role: "User",
      })
      setUser(newUser)
      return true
    } catch (error: any) {
      console.error("Registration error:", error)
      // Re-throw the error so the component can show the specific message
      throw error
    }
  }

  const logout = async () => {
    try {
      await userDB.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
