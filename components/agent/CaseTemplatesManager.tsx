import { useState, useEffect } from "react"
import { useAgentAuth } from "@/hooks/use-agent-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import {
  FileText,
  Plus,
  Copy,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface CaseTemplate {
  id: string
  title: string
  description: string
  category: string
  content: string
  created_by: string
  created_at: string
  last_updated: string
}

export function CaseTemplatesManager() {
  const { agent } = useAgentAuth()
  const [templates, setTemplates] = useState<CaseTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingTemplate, setEditingTemplate] = useState<CaseTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    content: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("case_templates")
        .select("*")
        .order("category")
        .order("title")

      if (error) throw error
      setTemplates(data || [])

      // Extract unique categories
      const uniqueCategories = [
        ...new Set(data?.map((t) => t.category) || []),
      ]
      setCategories(uniqueCategories)
    } catch (error) {
      toast.error("Failed to fetch templates")
      console.error("Error fetching templates:", error)
    }
  }

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("case_templates")
          .update({
            ...form,
            last_updated: new Date().toISOString(),
          })
          .eq("id", editingTemplate.id)

        if (error) throw error
        toast.success("Template updated successfully")
      } else {
        const { error } = await supabase.from("case_templates").insert({
          ...form,
          created_by: agent?.id,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
        })

        if (error) throw error
        toast.success("Template created successfully")
      }

      setEditingTemplate(null)
      setNewTemplate(false)
      setForm({
        title: "",
        description: "",
        category: "",
        content: "",
      })
      fetchTemplates()
    } catch (error) {
      toast.error("Failed to save template")
      console.error("Error saving template:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("case_templates")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast.success("Template deleted successfully")
      fetchTemplates()
    } catch (error) {
      toast.error("Failed to delete template")
      console.error("Error deleting template:", error)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Template copied to clipboard")
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Templates List */}
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Templates</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewTemplate(true)
                setEditingTemplate(null)
                setForm({
                  title: "",
                  description: "",
                  category: "",
                  content: "",
                })
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      editingTemplate?.id === template.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{template.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Category: {template.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(template.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template)
                              setNewTemplate(false)
                              setForm({
                                title: template.title,
                                description: template.description,
                                category: template.category,
                                content: template.content,
                              })
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Template Editor */}
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {newTemplate
                ? "Create New Template"
                : editingTemplate
                ? "Edit Template"
                : "Template Details"}
            </CardTitle>
            {(newTemplate || editingTemplate) && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(null)
                    setNewTemplate(false)
                    setForm({
                      title: "",
                      description: "",
                      category: "",
                      content: "",
                    })
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(newTemplate || editingTemplate) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Template Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Template Content</Label>
                <textarea
                  id="content"
                  className="w-full h-[400px] p-4 rounded-lg border bg-background"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center text-center text-muted-foreground">
              <div>
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No template selected</p>
                <p className="text-sm">
                  Select a template to view or edit, or create a new one
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}