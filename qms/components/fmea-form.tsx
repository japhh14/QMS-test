"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FMEARecord {
  id: number
  processName: string
  date: string
  potentialFailure: number
  description?: string
}

interface FMEAFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (record: Omit<FMEARecord, "id">) => void
  editRecord?: FMEARecord | null
}

export function FMEAForm({ isOpen, onClose, onSubmit, editRecord }: FMEAFormProps) {
  const [formData, setFormData] = useState({
    processName: editRecord?.processName || "",
    date: editRecord?.date || new Date().toISOString().split("T")[0],
    potentialFailure: editRecord?.potentialFailure || 0,
    description: editRecord?.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      processName: formData.processName,
      date: formData.date,
      potentialFailure: Number(formData.potentialFailure),
      description: formData.description,
    })
    setFormData({
      processName: "",
      date: new Date().toISOString().split("T")[0],
      potentialFailure: 0,
      description: "",
    })
    onClose()
  }

  const handleClose = () => {
    setFormData({
      processName: "",
      date: new Date().toISOString().split("T")[0],
      potentialFailure: 0,
      description: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editRecord ? "Edit FMEA Record" : "Create New FMEA Record"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="potentialFailure">Potential Failure Score</Label>
            <Input
              id="potentialFailure"
              type="number"
              min="0"
              max="100"
              value={formData.potentialFailure}
              onChange={(e) => setFormData({ ...formData, potentialFailure: Number(e.target.value) })}
              placeholder="Enter failure score (0-100)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter additional details about the failure mode"
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
