"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AdminCaseList } from "@/components/admin/admin-case-list"
import { AdminStats } from "@/components/admin/admin-stats"
import { AgentChatSystem } from "@/components/chat/agent-chat-system"
import { Shield, Users, FileText } from "lucide-react"

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
}

export default function AdminPage() {
  const [cases, setCases] = useState<AdminCase[]>([])
  const [selectedCase, setSelectedCase] = useState<AdminCase | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCases()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } finally {
      window.location.href = "/admin/login"
    }
  }

  const loadCases = () => {
    setIsLoading(true)
    const loadedCases: AdminCase[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("case_")) {
        const caseData = localStorage.getItem(key)
        if (caseData) {
          const parsedCase = JSON.parse(caseData)
          loadedCases.push({
            id: parsedCase.caseId,
            type:
              parsedCase.scamType === "crypto"
                ? "Cryptocurrency Fraud"
                : parsedCase.scamType === "fiat"
                  ? "Wire Transfer Fraud"
                  : "Other Fraud",
            amount: parsedCase.amount,
            currency: parsedCase.currency,
            status: parsedCase.status || "intake",
            priority: "high",
            submissionDate: parsedCase.submissionDate,
            lastUpdate: parsedCase.submissionDate,
            contactEmail: parsedCase.contactEmail,
            description: parsedCase.description,
          })
        }
      }
    }

    setCases(loadedCases)
    if (loadedCases.length > 0) {
      setSelectedCase(loadedCases[0])
    }
    setIsLoading(false)
  }

  const updateCaseStatus = (caseId: string, newStatus: string) => {
    const caseKey = `case_${caseId}`
    const caseData = localStorage.getItem(caseKey)
    if (caseData) {
      const parsedCase = JSON.parse(caseData)
      parsedCase.status = newStatus
      parsedCase.lastUpdate = new Date().toISOString()
      localStorage.setItem(caseKey, JSON.stringify(parsedCase))

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: caseKey,
          newValue: JSON.stringify(parsedCase),
        }),
      )

      loadCases()
    }
  }

  const addCaseNote = (caseId: string, note: string) => {
    const caseKey = `case_${caseId}`
    const caseData = localStorage.getItem(caseKey)
    if (caseData) {
      const parsedCase = JSON.parse(caseData)
      if (!parsedCase.notes) parsedCase.notes = []
      parsedCase.notes.push({
        id: Date.now().toString(),
        content: note,
        timestamp: new Date().toISOString(),
        author: "Admin",
      })
      parsedCase.lastUpdate = new Date().toISOString()
      localStorage.setItem(caseKey, JSON.stringify(parsedCase))

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: caseKey,
          newValue: JSON.stringify(parsedCase),
        }),
      )

      loadCases()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">CSRU Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Cyber Scam Recovery Unit Management</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AdminStats cases={cases} />
            <div className="mt-6">
              <AdminCaseList
                cases={cases}
                selectedCase={selectedCase}
                onSelectCase={(caseItem) => setSelectedCase(caseItem)}
                onUpdateStatus={updateCaseStatus}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedCase ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Case Management: {selectedCase.id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{selectedCase.status.replace("-", " ").toUpperCase()}</Badge>
                      <Badge variant="outline">{selectedCase.priority} priority</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Case Details</TabsTrigger>
                      <TabsTrigger value="management">Management</TabsTrigger>
                      <TabsTrigger value="chat" className="flex items-center gap-2">
                        Agent Chat
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Case Type</p>
                            <p className="text-sm text-muted-foreground mt-1">{selectedCase.type}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Amount Lost</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedCase.amount} {selectedCase.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Contact Email</p>
                            <p className="text-sm text-muted-foreground mt-1">{selectedCase.contactEmail}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Submission Date</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(selectedCase.submissionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Last Update</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(selectedCase.lastUpdate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Current Status</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedCase.status.replace("-", " ").toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                          {selectedCase.description}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="management" className="mt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Update Status</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p id="status" className="mb-2">Case Status</p>
                              <Select
                                value={selectedCase.status}
                                onValueChange={(value) => updateCaseStatus(selectedCase.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="intake">Intake</SelectItem>
                                  <SelectItem value="under-review">Under Review</SelectItem>
                                  <SelectItem value="action-recommended">Action Recommended</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Add Case Note</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                const note = formData.get("note") as string
                                if (note.trim()) {
                                  addCaseNote(selectedCase.id, note.trim())
                                  e.currentTarget.reset()
                                }
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label htmlFor="note" className="text-sm font-medium">Internal Note</label>
                                <Textarea id="note" name="note" placeholder="Add internal case notes..." rows={3} />
                              </div>
                              <Button type="submit" size="sm">
                                Add Note
                              </Button>
                            </form>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="chat" className="mt-6">
                      <AgentChatSystem caseId={selectedCase.id} victimName={selectedCase.contactEmail} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Cases Available</h3>
                  <p className="text-muted-foreground">
                    No fraud reports have been submitted yet. Cases will appear here once users submit reports.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
