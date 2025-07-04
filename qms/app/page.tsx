"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "../components/auth-context"
import { LoginPage } from "../components/login-page"
import { Navigation } from "../components/navigation"
import { HomeDashboard } from "../components/home-dashboard"
import { SettingsPage } from "../components/settings-page"
import QcheckDashboard from "../qcheck-dashboard"

// Sample FMEA data for the home dashboard
const sampleFmeaRecords = [
  {
    id: 1,
    processName: "Assembly Line A",
    date: "2025-06-23",
    potentialFailure: 45,
    description: "Risk of component misalignment during assembly process",
  },
  {
    id: 2,
    processName: "Quality Control Station",
    date: "2025-06-22",
    potentialFailure: 32,
    description: "Potential for defective parts to pass inspection",
  },
  {
    id: 3,
    processName: "Material Handling",
    date: "2025-06-20",
    potentialFailure: 67,
    description: "High risk of material contamination during transport",
  },
]

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <HomeDashboard fmeaRecords={sampleFmeaRecords} />
      case "history":
        return <QcheckDashboard />
      case "settings":
        return <SettingsPage />
      default:
        return <HomeDashboard fmeaRecords={sampleFmeaRecords} />
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
    </AuthProvider>
  )
}
