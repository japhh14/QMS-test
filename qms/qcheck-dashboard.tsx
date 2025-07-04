"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Download, Plus } from "lucide-react"
import { FMEAForm } from "./components/fmea-form"
import { DeleteConfirmation } from "./components/delete-confirmation"

interface FMEARecord {
  id: number
  processName: string
  date: string
  potentialFailure: number
  description?: string
}

// Initial sample data
const initialFmeaRecords: FMEARecord[] = [
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
    processName: "Packaging Process",
    date: "2025-06-21",
    potentialFailure: 18,
    description: "Risk of packaging damage during automated sealing",
  },
  {
    id: 4,
    processName: "Material Handling",
    date: "2025-06-20",
    potentialFailure: 67,
    description: "High risk of material contamination during transport",
  },
]

export default function QcheckDashboard() {
  const [fmeaRecords, setFmeaRecords] = useState<FMEARecord[]>(initialFmeaRecords)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FMEARecord | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<FMEARecord | null>(null)
  const { toast } = useToast()

  // Create new FMEA record
  const handleCreateRecord = (newRecord: Omit<FMEARecord, "id">) => {
    const id = Math.max(...fmeaRecords.map((r) => r.id), 0) + 1
    const record: FMEARecord = { ...newRecord, id }
    setFmeaRecords([...fmeaRecords, record])
    toast({
      title: "Success",
      description: "FMEA record created successfully",
    })
  }

  // Edit existing FMEA record
  const handleEditRecord = (updatedRecord: Omit<FMEARecord, "id">) => {
    if (!editingRecord) return

    const updatedRecords = fmeaRecords.map((record) =>
      record.id === editingRecord.id ? { ...updatedRecord, id: editingRecord.id } : record,
    )
    setFmeaRecords(updatedRecords)
    setEditingRecord(null)
    toast({
      title: "Success",
      description: "FMEA record updated successfully",
    })
  }

  // Delete FMEA record
  const handleDeleteRecord = (id: number) => {
    setFmeaRecords(fmeaRecords.filter((record) => record.id !== id))
    toast({
      title: "Success",
      description: "FMEA record deleted successfully",
    })
  }

  // Export FMEA records to CSV
  const handleExportRecords = () => {
    const headers = ["Process Name", "Date", "Potential Failure", "Description"]
    const csvContent = [
      headers.join(","),
      ...fmeaRecords.map((record) =>
        [`"${record.processName}"`, record.date, record.potentialFailure, `"${record.description || ""}"`].join(","),
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
    const headers = ["Process Name", "Date", "Potential Failure", "Description"]
    const csvContent = [
      headers.join(","),
      [`"${record.processName}"`, record.date, record.potentialFailure, `"${record.description || ""}"`].join(","),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Remove the header section completely */}

      {/* Main Content - keep as is */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Saved FMEA Records Section */}
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
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fmeaRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-gray-500">
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
                        <TableCell className="py-4 px-6">
                          <span
                            className={`font-medium ${
                              record.potentialFailure >= 70
                                ? "text-red-600"
                                : record.potentialFailure >= 40
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {record.potentialFailure}
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
