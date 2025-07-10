"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "../components/auth-context"
import { LoginPage } from "../components/login-page"
import { Navigation } from "../components/navigation"
import { HomeDashboard } from "../components/home-dashboard"
import { SettingsPage } from "../components/settings-page"
import QcheckDashboard from "../qcheck-dashboard"
import { Toaster } from "../components/ui/toaster"

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <HomeDashboard onNavigate={setCurrentPage} />
      case "history":
        return <QcheckDashboard />
      case "settings":
        return <SettingsPage />
      default:
        return <HomeDashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}
