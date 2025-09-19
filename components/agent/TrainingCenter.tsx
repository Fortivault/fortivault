import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import {
  BookOpen,
  CheckCircle,
  Play,
  Star,
  Award,
  FileText,
  Video,
} from "lucide-react"
import { toast } from "sonner"

interface TrainingModule {
  id: string
  title: string
  description: string
  type: "video" | "document" | "quiz"
  duration: number
  level: "beginner" | "intermediate" | "advanced"
  required: boolean
  completed: boolean
  progress: number
  content_url: string
}

export function TrainingCenter() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchTrainingModules()
  }, [])

  const fetchTrainingModules = async () => {
    try {
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .order("level", { ascending: true })

      if (error) throw error
      setModules(data || [])
      calculateOverallProgress(data)
    } catch (error) {
      toast.error("Failed to fetch training modules")
      console.error("Error fetching training modules:", error)
    }
  }

  const calculateOverallProgress = (modules: TrainingModule[]) => {
    if (modules.length === 0) return
    const completed = modules.filter((m) => m.completed).length
    setOverallProgress((completed / modules.length) * 100)
  }

  const updateProgress = async (moduleId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from("training_modules")
        .update({ progress, completed: progress === 100 })
        .eq("id", moduleId)

      if (error) throw error
      fetchTrainingModules()
      toast.success("Progress updated")
    } catch (error) {
      toast.error("Failed to update progress")
      console.error("Error updating progress:", error)
    }
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />
      case "document":
        return <FileText className="w-5 h-5" />
      case "quiz":
        return <Star className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-500"
      case "intermediate":
        return "text-blue-500"
      case "advanced":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Training Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">Overall Completion</p>
                <p className="text-2xl font-bold">
                  {Math.round(overallProgress)}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {modules.filter((m) => m.completed).length} of{" "}
                  {modules.length} modules completed
                </p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Modules List */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Training Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedModule?.id === module.id
                        ? "bg-primary/10"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => setSelectedModule(module)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          module.completed
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary"
                        }`}
                      >
                        {module.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          getModuleIcon(module.type)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium">{module.title}</h4>
                          {module.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs font-medium capitalize ${getLevelColor(
                              module.level
                            )}`}
                          >
                            {module.level}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {module.duration} mins
                          </span>
                        </div>
                        <Progress
                          value={module.progress}
                          className="h-1 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Module Content */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedModule
                ? selectedModule.title
                : "Select a module to begin"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedModule ? (
              <div className="space-y-6">
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                  {selectedModule.type === "video" ? (
                    <iframe
                      src={selectedModule.content_url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {selectedModule.type === "document"
                          ? "Document content will appear here"
                          : "Quiz content will appear here"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    className="flex-1"
                    onClick={() =>
                      updateProgress(selectedModule.id, 100)
                    }
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {selectedModule.completed
                      ? "Restart Module"
                      : "Start Module"}
                  </Button>
                  {selectedModule.progress > 0 && !selectedModule.completed && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateProgress(
                          selectedModule.id,
                          Math.min(
                            selectedModule.progress + 25,
                            100
                          )
                        )
                      }
                    >
                      Continue ({selectedModule.progress}%)
                    </Button>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-secondary">
                  <h4 className="font-medium mb-2">Module Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">
                        {selectedModule.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {selectedModule.duration} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Level</p>
                      <p className="font-medium capitalize">
                        {selectedModule.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {selectedModule.completed
                          ? "Completed"
                          : `${selectedModule.progress}% Complete`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No module selected</p>
                  <p className="text-sm">
                    Choose a training module from the list to get started
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}