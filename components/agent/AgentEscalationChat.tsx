import { useState, useEffect, useRef } from "react"
import { useAgentAuth } from "@/hooks/use-agent-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { MessageCircle, SendHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  content: string
  sender_id: string
  sender_name: string
  sender_role: string
  created_at: string
}

interface Agent {
  id: string
  name: string
  role: string
  online: boolean
  last_seen: string
}

export function AgentEscalationChat() {
  const { agent } = useAgentAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchAgents()
    subscribeToMessages()
    subscribeToAgentPresence()

    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  useEffect(() => {
    if (selectedAgent) {
      fetchMessages(selectedAgent)
    }
  }, [selectedAgent])

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .neq("id", agent?.id)
        .order("name")

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      toast.error("Failed to fetch agents")
      console.error("Error fetching agents:", error)
    }
  }

  const fetchMessages = async (recipientId: string) => {
    try {
      const { data, error } = await supabase
        .from("agent_messages")
        .select("*")
        .or(`sender_id.eq.${agent?.id},recipient_id.eq.${agent?.id}`)
        .order("created_at")

      if (error) throw error
      setMessages(data || [])
      scrollToBottom()
    } catch (error) {
      toast.error("Failed to fetch messages")
      console.error("Error fetching messages:", error)
    }
  }

  const subscribeToMessages = () => {
    supabase
      .channel("agent-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_messages",
        },
        (payload) => {
          const message = payload.new as ChatMessage
          if (
            message.sender_id === selectedAgent ||
            message.sender_id === agent?.id
          ) {
            setMessages((prev) => [...prev, message])
            scrollToBottom()
          }
        }
      )
      .subscribe()
  }

  const subscribeToAgentPresence = () => {
    supabase
      .channel("agent-presence")
      .on(
        "presence",
        { event: "sync" },
        () => {
          fetchAgents() // Refresh agent list with updated presence
        }
      )
      .subscribe()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedAgent) return

    try {
      const { error } = await supabase.from("agent_messages").insert({
        content: newMessage,
        sender_id: agent?.id,
        sender_name: agent?.name,
        sender_role: agent?.role,
        recipient_id: selectedAgent,
      })

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      toast.error("Failed to send message")
      console.error("Error sending message:", error)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6 h-[600px]">
      {/* Agents List */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[520px]">
            <div className="space-y-2">
              {agents.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAgent === a.id
                      ? "bg-primary/10"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => setSelectedAgent(a.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {a.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{a.name}</p>
                        <Badge
                          variant={a.online ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {a.online ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {a.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedAgent
              ? `Chat with ${
                  agents.find((a) => a.id === selectedAgent)?.name
                }`
              : "Select an agent to start chatting"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAgent ? (
            <div className="space-y-4 h-[520px] flex flex-col">
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === agent?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === agent?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {message.sender_name}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <Button type="submit" size="icon">
                  <SendHorizontal className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="h-[520px] flex items-center justify-center text-center text-muted-foreground">
              <div>
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No conversation selected</p>
                <p className="text-sm">Choose an agent from the list to start chatting</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}