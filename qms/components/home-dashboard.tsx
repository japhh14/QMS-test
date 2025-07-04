"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "./auth-context"

interface FMEARecord {
  id: number
  processName: string
  date: string
  potentialFailure: number
  description?: string
}

interface HomeDashboardProps {
  fmeaRecords: FMEARecord[]
}

export function HomeDashboard({ fmeaRecords }: HomeDashboardProps) {
  const { user } = useAuth()

  // Calculate metrics
  const totalFMEAs = fmeaRecords.length
  const highRiskCount = fmeaRecords.filter((record) => record.potentialFailure >= 70).length
  const mediumRiskCount = fmeaRecords.filter(
    (record) => record.potentialFailure >= 40 && record.potentialFailure < 70,
  ).length

  const metrics = [
    {
      title: "Total FMEAs",
      value: totalFMEAs,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "High Risk",
      value: highRiskCount,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Medium Risk",
      value: mediumRiskCount,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! This is your FMEA dashboard.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.title} className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${metric.color}`}>{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity or Additional Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {fmeaRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No FMEA records yet. Create your first record to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {fmeaRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{record.processName}</p>
                        <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.potentialFailure >= 70
                            ? "bg-red-100 text-red-800"
                            : record.potentialFailure >= 40
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        Risk: {record.potentialFailure}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <h3 className="font-medium text-gray-900">Create New FMEA</h3>
                  <p className="text-sm text-gray-600 mt-1">Start a new failure mode analysis</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <h3 className="font-medium text-gray-900">View All Records</h3>
                  <p className="text-sm text-gray-600 mt-1">Browse and manage existing FMEAs</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <h3 className="font-medium text-gray-900">Export Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Generate and download FMEA reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
