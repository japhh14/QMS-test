"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/lib/use-toast"
import { Edit, Trash2, Download, Plus } from "lucide-react"
import { FMEAForm } from "./components/fmea-form"
import { DeleteConfirmation } from "./components/delete-confirmation"
import { useAuth } from "./components/auth-context"
import { fmeaDB, type FMEARecord } from "./lib/database"

export default function QcheckDashboard() {
  const { user } = useAuth()
  const [fmeaRecords, setFmeaRecords] = useState<FMEARecord[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FMEARecord | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<FMEARecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

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

  // Create new FMEA record
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

  // Edit existing FMEA record
  const handleEditRecord = async (
    updatedRecord: Omit<FMEARecord, "id" | "rpn" | "createdAt" | "updatedAt" | "userId">,
  ) => {
    if (!editingRecord) return

    try {
      await fmeaDB.update(editingRecord.id, updatedRecord)
      await loadFMEARecords()
      setEditingRecord(null)
      toast({
        title: "Success",
        description: "FMEA record updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update FMEA record",
        variant: "destructive",
      })
    }
  }

  // Delete FMEA record
  const handleDeleteRecord = async (id: string) => {
    try {
      await fmeaDB.delete(id)
      await loadFMEARecords()
      toast({
        title: "Success",
        description: "FMEA record deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FMEA record",
        variant: "destructive",
      })
    }
  }

  // Export FMEA records to CSV
  const handleExportRecords = () => {
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

  // Export single record
  const handleExportSingleRecord = (record: FMEARecord) => {
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
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `fmea-${record.processName.replace(/\s+/g, "-").toLowerCase()}-${record.date}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: `${record.processName} record exported successfully`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FMEA records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved FMEA Records</h2>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">{fmeaRecords.length} records total</p>
              <Button onClick={handleExportRecords} variant="outline" className="px-4 py-2 font-medium bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New FMEA
              </Button>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Process Name</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Potential Failure</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Severity</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Occurrence</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Detection</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">RPN</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fmeaRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                        No FMEA records found. Create your first record to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fmeaRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                      >
                        <TableCell className="py-4 px-6 font-medium text-gray-900">{record.processName}</TableCell>
                        <TableCell className="py-4 px-6 text-gray-600">{formatDate(record.date)}</TableCell>
                        <TableCell className="py-4 px-6 text-gray-600">{record.potentialFailure}</TableCell>
                        <TableCell className="py-4 px-6 text-center">{record.severity}</TableCell>
                        <TableCell className="py-4 px-6 text-center">{record.occurrence}</TableCell>
                        <TableCell className="py-4 px-6 text-center">{record.detection}</TableCell>
                        <TableCell className="py-4 px-6">
                          <span
                            className={`font-medium px-2 py-1 rounded-full text-xs ${
                              record.rpn >= 200
                                ? "bg-red-100 text-red-800"
                                : record.rpn >= 100
                                  ? "bg-orange-100 text-orange-800"
                                  : record.rpn >= 50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {record.rpn}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRecord(record)
                                setIsFormOpen(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 h-auto font-medium"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteRecord(record)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 h-auto font-medium"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportSingleRecord(record)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 h-auto font-medium"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* FMEA Form Dialog */}
      <FMEAForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingRecord(null)
        }}
        onSubmit={editingRecord ? handleEditRecord : handleCreateRecord}
        editRecord={editingRecord}
      />

      {/* Delete Confirmation Dialog */}
      {deleteRecord && (
        <DeleteConfirmation
          isOpen={!!deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onConfirm={() => handleDeleteRecord(deleteRecord.id)}
          recordName={deleteRecord.processName}
        />
      )}
    </div>
  )
}
