"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FMEARecord } from "@/lib/database"

interface FMEAFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (record: Omit<FMEARecord, "id" | "rpn" | "createdAt" | "updatedAt" | "userId">) => void
  editRecord?: FMEARecord | null
}

export function FMEAForm({ isOpen, onClose, onSubmit, editRecord }: FMEAFormProps) {
  const [formData, setFormData] = useState({
    processName: "",
    date: new Date().toISOString().split("T")[0],
    potentialFailure: "",
    severity: 1,
    occurrence: 1,
    detection: 1,
    description: "",
  })

  const [rpn, setRpn] = useState(1)

  // Update RPN whenever severity, occurrence, or detection changes
  useEffect(() => {
    setRpn(formData.severity * formData.occurrence * formData.detection)
  }, [formData.severity, formData.occurrence, formData.detection])

  // Populate form when editing
  useEffect(() => {
    if (editRecord) {
      setFormData({
        processName: editRecord.processName,
        date: editRecord.date,
        potentialFailure: editRecord.potentialFailure,
        severity: editRecord.severity,
        occurrence: editRecord.occurrence,
        detection: editRecord.detection,
        description: editRecord.description || "",
      })
    } else {
      setFormData({
        processName: "",
        date: new Date().toISOString().split("T")[0],
        potentialFailure: "",
        severity: 1,
        occurrence: 1,
        detection: 1,
        description: "",
      })
    }
  }, [editRecord, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      processName: "",
      date: new Date().toISOString().split("T")[0],
      potentialFailure: "",
      severity: 1,
      occurrence: 1,
      detection: 1,
      description: "",
    })
    onClose()
  }

  const getRiskLevel = (rpn: number) => {
    if (rpn >= 200) return { level: "Critical", color: "bg-red-600" }
    if (rpn >= 100) return { level: "High", color: "bg-orange-500" }
    if (rpn >= 50) return { level: "Medium", color: "bg-yellow-500" }
    return { level: "Low", color: "bg-green-500" }
  }

  const riskInfo = getRiskLevel(rpn)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRecord ? "Edit FMEA Record" : "Create New FMEA Record"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processName">Process Name</Label>
              <Input
                id="processName"
                value={formData.processName}
                onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                placeholder="Enter process name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="potentialFailure">Potential Failure Mode</Label>
            <Input
              id="potentialFailure"
              value={formData.potentialFailure}
              onChange={(e) => setFormData({ ...formData, potentialFailure: e.target.value })}
              placeholder="Describe the potential failure mode"
              required
            />
          </div>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity (1-10)</Label>
                  <Select
                    value={formData.severity.toString()}
                    onValueChange={(value: string) => setFormData({ ...formData, severity: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} - {i + 1 <= 3 ? "Low" : i + 1 <= 6 ? "Medium" : i + 1 <= 8 ? "High" : "Critical"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occurrence">Occurrence (1-10)</Label>
                  <Select
                    value={formData.occurrence.toString()}
                    onValueChange={(value: string) => setFormData({ ...formData, occurrence: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} -{" "}
                          {i + 1 <= 2
                            ? "Very Low"
                            : i + 1 <= 4
                              ? "Low"
                              : i + 1 <= 6
                                ? "Medium"
                                : i + 1 <= 8
                                  ? "High"
                                  : "Very High"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detection">Detection (1-10)</Label>
                  <Select
                    value={formData.detection.toString()}
                    onValueChange={(value: string) => setFormData({ ...formData, detection: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} -{" "}
                          {i + 1 <= 2
                            ? "Very High"
                            : i + 1 <= 4
                              ? "High"
                              : i + 1 <= 6
                                ? "Medium"
                                : i + 1 <= 8
                                  ? "Low"
                                  : "Very Low"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RPN Display */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Risk Priority Number (RPN)</p>
                  <p className="text-2xl font-bold">{rpn}</p>
                  <p className="text-xs text-gray-500">Severity × Occurrence × Detection</p>
                </div>
                <Badge className={`${riskInfo.color} text-white`}>{riskInfo.level} Risk</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter additional details, corrective actions, or notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editRecord ? "Update Record" : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
