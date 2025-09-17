"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface CaseManagementPanelProps {
  selectedCase: {
    id: string
    status: string
  }
  onUpdateStatus: (caseId: string, newStatus: string) => Promise<void>
  onAddNote: (caseId: string, note: string) => Promise<void>
}

export function CaseManagementPanel({ selectedCase, onUpdateStatus, onAddNote }: CaseManagementPanelProps) {
  const [newNote, setNewNote] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const statusOptions = [
    { value: "intake", label: "Intake", icon: Clock, color: "outline" },
    { value: "under-review", label: "Under Review", icon: AlertCircle, color: "secondary" },
    { value: "action-recommended", label: "Action Recommended", icon: CheckCircle, color: "default" },
    { value: "closed", label: "Closed", icon: CheckCircle, color: "destructive" },
  ]

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === selectedCase.status) return
    
    setIsUpdatingStatus(true)
    try {
      await onUpdateStatus(selectedCase.id, newStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    setIsAddingNote(true)
    try {
      await onAddNote(selectedCase.id, newNote.trim())
      setNewNote("")
    } catch (error) {
      console.error("Failed to add note:", error)
    } finally {
      setIsAddingNote(false)
    }
  }

  const currentStatus = statusOptions.find(option => option.value === selectedCase.status)

  return (
    <div className="space-y-6">
      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Status Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Current Status</div>
            <div className="flex items-center gap-2">
              {currentStatus && (
                <>
                  <currentStatus.icon className="w-4 h-4" />
                  <Badge variant={currentStatus.color as any}>
                    {currentStatus.label}
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Update Status</div>
            <Select 
              value={selectedCase.status} 
              onValueChange={handleStatusUpdate}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {isUpdatingStatus && (
            <div className="text-sm text-muted-foreground">Updating status...</div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusUpdate("in-progress")}
              disabled={selectedCase.status === "in-progress" || isUpdatingStatus}
            >
              Start Investigation
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusUpdate("resolved")}
              disabled={selectedCase.status === "resolved" || isUpdatingStatus}
            >
              Mark Resolved
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusUpdate("closed")}
              disabled={selectedCase.status === "closed" || isUpdatingStatus}
            >
              Close Case
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusUpdate("pending")}
              disabled={selectedCase.status === "pending" || isUpdatingStatus}
            >
              Reset to Pending
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Case Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Add Case Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Internal Note (visible to agents only)
            </div>
            <Textarea
              placeholder="Add investigation notes, updates, or observations..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              disabled={isAddingNote}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAddingNote}
            >
              {isAddingNote ? "Adding Note..." : "Add Note"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Case Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Case Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Additional case management features will be available here, such as:
          </div>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Assign to specific agent</li>
            <li>• Set priority level</li>
            <li>• Schedule follow-up</li>
            <li>• Generate case report</li>
            <li>• Contact victim</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
