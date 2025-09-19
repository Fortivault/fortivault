import { useState, useEffect } from "react"
import { useAgentAuth } from "@/hooks/use-agent-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { FileText, Upload, Trash2, Download } from "lucide-react"
import { toast } from "sonner"

interface LegalDocument {
  id: string
  title: string
  description: string
  file_url: string
  uploaded_by: string
  created_at: string
  file_type: string
  size: number
}

export function LegalResourcesManager() {
  const { agent } = useAgentAuth()
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("legal_resources")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      toast.error("Failed to fetch documents")
      console.error("Error fetching documents:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title || !description) {
      toast.error("Please fill in all fields")
      return
    }

    setIsUploading(true)
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("legal-resources")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from("legal-resources")
        .getPublicUrl(fileName)

      // Save document metadata
      const { error: dbError } = await supabase.from("legal_resources").insert({
        title,
        description,
        file_url: urlData.publicUrl,
        uploaded_by: agent?.id,
        file_type: file.type,
        size: file.size,
      })

      if (dbError) throw dbError

      toast.success("Document uploaded successfully")
      setTitle("")
      setDescription("")
      setFile(null)
      fetchDocuments()
    } catch (error) {
      toast.error("Failed to upload document")
      console.error("Error uploading document:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    try {
      // Delete from storage
      const fileName = fileUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("legal-resources").remove([fileName])
      }

      // Delete metadata
      const { error } = await supabase
        .from("legal_resources")
        .delete()
        .eq("id", docId)

      if (error) throw error

      toast.success("Document deleted successfully")
      fetchDocuments()
    } catch (error) {
      toast.error("Failed to delete document")
      console.error("Error deleting document:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Legal Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description"
              />
            </div>
            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium">{doc.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.file_url, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.file_url)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No documents found</p>
                  <p className="text-sm">Upload legal resources to get started.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}