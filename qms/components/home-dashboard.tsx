"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-context"
import { fmeaDB, type FMEARecord } from "@/lib/database"
import { FMEAForm } from "./fmea-form"
import { useToast } from "@/lib/use-toast"
import { Plus, FileText, Download, History } from "lucide-react"

interface HomeDashboardProps {
  onNavigate: (page: string) => void
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [fmeaRecords, setFmeaRecords] = useState<FMEARecord[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFMEARecords()
    }
  }, [user])

  const loadFMEARecords = async () => {
    if (user) {
      setIsLoading(true)
      try {
        const records = await fmeaDB.findByUserId(user.id)
        setFmeaRecords(records)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load FMEA records",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCreateRecord = async (
    newRecord: Omit<FMEARecord, "id" | "rpn" | "createdAt" | "updatedAt" | "userId">,
  ) => {
    if (!user) return

    try {
      await fmeaDB.create({ ...newRecord, userId: user.id })
      await loadFMEARecords()
      toast({
        title: "Success",
        description: "FMEA record created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create FMEA record",
        variant: "destructive",
      })
    }
  }

  const handleExportAll = () => {
    if (fmeaRecords.length === 0) {
      toast({
        title: "No Data",
        description: "No FMEA records to export",
        variant: "destructive",
      })
      return
    }

    const headers = [
      "Process Name",
      "Date",
      "Potential Failure",
      "Severity",
      "Occurrence",
      "Detection",
      "RPN",
      "Description",
    ]
    const csvContent = [
      headers.join(","),
      ...fmeaRecords.map((record) =>
        [
          `"${record.processName}"`,
          record.date,
          `"${record.potentialFailure}"`,
          record.severity,
          record.occurrence,
          record.detection,
          record.rpn,
          `"${record.description || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `fmea-records-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "FMEA records exported successfully",
    })
  }

  // Calculate metrics
  const totalFMEAs = fmeaRecords.length
  const highRiskCount = fmeaRecords.filter((record) => record.rpn >= 100).length
  const mediumRiskCount = fmeaRecords.filter((record) => record.rpn >= 50 && record.rpn < 100).length
  const lowRiskCount = fmeaRecords.filter((record) => record.rpn < 50).length

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
    {
      title: "Low Risk",
      value: lowRiskCount,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! This is your FMEA dashboard.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="w-full justify-start h-auto p-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <h3 className="font-medium text-white">Create New FMEA</h3>
                    <p className="text-sm text-blue-100 mt-1">Start a new failure mode analysis</p>
                  </div>
                </Button>

                <Button
                  onClick={() => onNavigate("history")}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-gray-50"
                >
                  <History className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">View All Records</h3>
                    <p className="text-sm text-gray-600 mt-1">Browse and manage existing FMEAs</p>
                  </div>
                </Button>

                <Button
                  onClick={handleExportAll}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-gray-50 bg-transparent"
                  disabled={totalFMEAs === 0}
                >
                  <Download className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Export Reports</h3>
                    <p className="text-sm text-gray-600 mt-1">Generate and download FMEA reports</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {fmeaRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No FMEA records yet.</p>
                  <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    Create your first record
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fmeaRecords
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{record.processName}</p>
                          <p className="text-sm text-gray-600">{record.potentialFailure}</p>
                          <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.rpn >= 100
                                ? "bg-red-100 text-red-800"
                                : record.rpn >= 50
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            RPN: {record.rpn}
                          </span>
                        </div>
                      </div>
                    ))}
                  {fmeaRecords.length > 5 && (
                    <Button onClick={() => onNavigate("history")} variant="outline" className="w-full mt-4">
                      View All Records ({fmeaRecords.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* FMEA Form Dialog */}
      <FMEAForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleCreateRecord} />
    </div>
  )
}
