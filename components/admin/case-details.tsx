"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, DollarSign, Mail, FileText, AlertTriangle } from "lucide-react"

interface AdminCase {
  id: string
  type: string
  amount: string
  currency: string
  status: string
  priority: string
  submissionDate: string
  lastUpdate: string
  contactEmail: string
  description: string
  recordId: string
  assignedAgentId: string | null
}

interface CaseDetailsPanelProps {
  selectedCase: AdminCase
}

export function CaseDetailsPanel({ selectedCase }: CaseDetailsPanelProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatAmount = (amount: string, currency: string) => {
    if (!amount) return "Not specified"
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return amount
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(numAmount)
  }

  return (
    <div className="space-y-6">
      {/* Case Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Case Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Case ID</div>
              <div className="font-mono text-sm">{selectedCase.id}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Fraud Type</div>
              <Badge variant="outline">{selectedCase.type}</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <Badge 
                variant={
                  selectedCase.status === "resolved" ? "default" :
                  selectedCase.status === "in-progress" ? "secondary" :
                  selectedCase.status === "pending" ? "outline" : "destructive"
                }
              >
                {selectedCase.status.replace("-", " ").toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Priority</div>
              <Badge 
                variant={
                  selectedCase.priority === "high" ? "destructive" :
                  selectedCase.priority === "medium" ? "secondary" : "outline"
                }
              >
                {selectedCase.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Amount Lost</div>
            <div className="text-2xl font-bold text-destructive">
              {formatAmount(selectedCase.amount, selectedCase.currency)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Victim Email</div>
            <div className="font-mono text-sm">{selectedCase.contactEmail}</div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Submitted</div>
            <div className="text-sm">{formatDate(selectedCase.submissionDate)}</div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
            <div className="text-sm">{formatDate(selectedCase.lastUpdate)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Case Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Case Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm whitespace-pre-wrap">
            {selectedCase.description || "No description provided."}
          </div>
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Assigned Agent</div>
            <div className="text-sm">
              {selectedCase.assignedAgentId ? (
                <Badge variant="secondary">Agent {selectedCase.assignedAgentId}</Badge>
              ) : (
                <Badge variant="outline">Unassigned</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}