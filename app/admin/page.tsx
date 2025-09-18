"use client"

import { useState, useEffect, useCallback } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AdminCaseList } from "@/components/admin/admin-case-list"
import { AdminStats } from "@/components/admin/admin-stats"
import { RealTimeChatSystem } from "@/components/chat/real-time-chat-system"
import { CaseDetailsPanel } from "@/components/admin/case-details"
import { CaseManagementPanel } from "@/components/admin/case-management"
import { Shield, Users, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAdminRealtime } from "@/hooks/useAdminRealtime"

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

export default function AdminPage() {

  const [cases, setCases] = useState<AdminCase[]>([])
  const [selectedCase, setSelectedCase] = useState<AdminCase | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [csrfToken, setCsrfToken] = useState<string>("")
  const [adminId, setAdminId] = useState<string>("")
  const [adminName, setAdminName] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const supabase = createClient()

  // Auth is enforced server-side in layout; avoid client-side delays
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setAdminId(user.id)
          setAdminName(user.user_metadata?.name || user.email || "Admin")
        }
      } catch {}
      setIsAuthenticating(false)
    })()
  }, [supabase])

  const loadCases = useCallback(async (targetPage: number) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch(`/api/admin/cases?page=${targetPage}&pageSize=${pageSize}`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = json?.error || json?.message || "Failed to fetch cases"
        console.error("loadCases error:", message)
        window.alert(message)
        setCases([])
        setSelectedCase(null)
        return
      }

      const loadedCases: AdminCase[] = (json.cases || []).map((c: any) => ({
        id: c.case_id,
        type:
          c.scam_type === "crypto"
            ? "Cryptocurrency Fraud"
            : c.scam_type === "fiat"
            ? "Wire Transfer Fraud"
            : c.scam_type,
        amount: (c.amount ?? "").toString(),
        currency: c.currency || "",
        status: c.status,
        priority: c.priority,
        submissionDate: c.created_at,
        lastUpdate: c.updated_at,
        contactEmail: c.victim_email,
        description: c.description || "",
        recordId: c.id,
        assignedAgentId: c.assigned_agent_id,
      }))

      setCases(loadedCases)
      setSelectedCase((prev) => (prev && loadedCases.find((x) => x.id === prev.id) ? prev : loadedCases[0] || null))
      setPage(json.page || targetPage)
      setTotal(json.total || loadedCases.length)
    } catch (e) {
      console.error(e)
      window.alert("Failed to load cases")
      setCases([])
      setSelectedCase(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, pageSize])

  useEffect(() => {
    loadCases(1)
    fetch("/api/csrf")
      .then((r) => r.json())
      .then((j) => setCsrfToken(j.token))
      .catch(() => {})
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAdminId(user.id)
        setAdminName(user.user_metadata?.name || user.email || "Admin")
      }
    })()
  }, [loadCases, supabase])

  // Reload on realtime events
  useAdminRealtime(() => {
    loadCases(page)
  })

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      await fetch("/api/admin/logout", { method: "POST" })
    } finally {
      window.location.href = "/admin-login"
    }
  }

  const updateCaseStatus = async (caseId: string, newStatus: string) => {
    const target = cases.find((c) => c.id === caseId)
    if (!target) return
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const res = await fetch(`/api/admin/cases/${encodeURIComponent(target.recordId)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), "x-csrf-token": csrfToken },
      body: JSON.stringify({ status: newStatus }),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = json?.error || json?.message || "Failed to update status"
      console.error(msg)
      window.alert(msg)
      return
    }

    await loadCases(page)
  }

  const addCaseNote = async (caseId: string, note: string) => {
    const target = cases.find((c) => c.id === caseId)
    if (!target) return
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    const res = await fetch(`/api/admin/cases/${encodeURIComponent(target.recordId)}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), "x-csrf-token": csrfToken },
      body: JSON.stringify({ content: note }),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = json?.error || json?.message || "Failed to add note"
      console.error(msg)
      window.alert(msg)
      return
    }

    await loadCases(page)
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

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Admin Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="intake">Intake</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="action-recommended">Action Recommended</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Search case ID or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <Button variant="outline" onClick={async () => {
                    try {
                      const { data: { session } } = await supabase.auth.getSession()
                      const token = session?.access_token
                      let all: any[] = []
                      let p = 1
                      const size = 100
                      while (true) {
                        const res = await fetch(`/api/admin/cases?page=${p}&pageSize=${size}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
                        const j = await res.json()
                        const arr = j.cases || []
                        all = all.concat(arr)
                        if (!arr.length || arr.length < size) break
                        p++
                      }
                      const headers = ["case_id","victim_email","scam_type","amount","currency","status","priority","created_at","updated_at","assigned_agent_id"]
                      const csv = [headers.join(",")].concat(all.map((c:any) => headers.map(h => JSON.stringify(c[h] ?? "")).join(","))).join("\n")
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `cases_export_${Date.now()}.csv`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                    } catch (e) {
                      console.error(e)
                      window.alert("Failed to export cases")
                    }
                  }}>Export Cases (CSV)</Button>

                  <Button variant="destructive" onClick={async () => {
                    if (!csrfToken) { window.alert("Missing CSRF token"); return }
                    const confirmText = window.prompt("Type RESET to wipe all cases, messages, chat rooms, notes and victim profiles tied to cases. This cannot be undone.")
                    if (confirmText !== "RESET") return
                    try {
                      const { data: { session } } = await supabase.auth.getSession()
                      const token = session?.access_token
                      const res = await fetch("/api/admin/reset", { method: "POST", headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ confirm: "RESET" }) })
                      const j = await res.json().catch(() => ({}))
                      if (!res.ok) {
                        window.alert(j?.error || j?.message || "Reset failed")
                        return
                      }
                      window.alert("Database reset complete")
                      await loadCases(1)
                    } catch (e) {
                      console.error(e)
                      window.alert("Reset failed")
                    }
                  }}>Reset Database</Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <AdminCaseList
                cases={cases.filter(c => (statusFilter === "all" || c.status === statusFilter) && (priorityFilter === "all" || c.priority === priorityFilter) && ((c.id + " " + c.contactEmail).toLowerCase().includes(search.toLowerCase())))}
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
                      <CaseDetailsPanel selectedCase={selectedCase} />
                    </TabsContent>

                    <TabsContent value="management" className="mt-6 space-y-6">
                      <CaseManagementPanel selectedCase={{ id: selectedCase.id, status: selectedCase.status }} onUpdateStatus={updateCaseStatus} onAddNote={addCaseNote} />
                    </TabsContent>

                    <TabsContent value="chat" className="mt-6">
                      {adminId && (
                        <RealTimeChatSystem
                          caseId={selectedCase.id}
                          userType="agent"
                          userId={adminId}
                          userName={adminName}
                          victimEmail={selectedCase.contactEmail}
                          otherPartyName={selectedCase.contactEmail}
                          isOtherPartyOnline={false}
                        />
                      )}
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

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Page {page} • {cases.length} / {total}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => loadCases(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page * pageSize >= total || isLoading} onClick={() => loadCases(page + 1)}>Next</Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
