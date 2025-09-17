"use client"

import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Message as DBMessage, ChatRoom as DBChatRoom } from "@/types/entities"

export type ChatMessage = DBMessage
export type ChatRoom = DBChatRoom

export class RealTimeChatService {
  private supabase = createClient()
  private channel: RealtimeChannel | null = null

  subscribeToMessages(
    chatRoomId: string,
    onMessage: (message: ChatMessage) => void,
    onTyping?: (data: { user: string; isTyping: boolean }) => void,
  ) {
    this.channel = this.supabase
      .channel(`chat_room_${chatRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage)
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (onTyping) {
          onTyping(payload)
        }
      })
      .subscribe()

    return this.channel
  }

  async sendMessage(
    chatRoomId: string,
    senderType: "victim" | "agent",
    senderId: string,
    senderName: string,
    content: string,
    messageType: "text" | "file" | "system" = "text",
  ) {
    const { data, error } = await this.supabase
      .from("messages")
      .insert({
        chat_room_id: chatRoomId,
        sender_type: senderType,
        sender_id: senderId,
        sender_name: senderName,
        content,
        message_type: messageType,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getChatRoom(caseId: string) {
    const { data, error } = await this.supabase
      .from("chat_rooms")
      .select(`
        *,
        cases!inner(case_id, victim_email, status),
        agents(name, role, is_online)
      `)
      .eq("cases.case_id", caseId)
      .single()

    if (error) throw error
    return data
  }

  async createOrGetChatRoom(casePublicId: string, victimEmail: string) {
    // Resolve internal case UUID by public case_id
    const { data: caseRow, error: caseErr } = await this.supabase
      .from("cases")
      .select("id, victim_email")
      .eq("case_id", casePublicId)
      .single()

    if (caseErr || !caseRow) throw caseErr || new Error("Case not found")

    // Try to get existing chat room by internal case UUID
    const { data: existingRoom } = await this.supabase
      .from("chat_rooms")
      .select("*")
      .eq("case_id", caseRow.id)
      .single()

    if (existingRoom) {
      return existingRoom
    }

    // Create new chat room (prefer victim email from case if present)
    const { data, error } = await this.supabase
      .from("chat_rooms")
      .insert({
        case_id: caseRow.id,
        victim_email: caseRow.victim_email || victimEmail,
        assigned_agent_id: null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMessages(chatRoomId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from("messages")
      .select("*")
      .eq("chat_room_id", chatRoomId)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  }

  sendTypingIndicator(chatRoomId: string, user: string, isTyping: boolean) {
    if (this.channel) {
      this.channel.send({
        type: "broadcast",
        event: "typing",
        payload: { user, isTyping },
      })
    }
  }

  async markMessagesAsRead(chatRoomId: string, senderId: string) {
    const { error } = await this.supabase
      .from("messages")
      .update({ is_read: true })
      .eq("chat_room_id", chatRoomId)
      .neq("sender_id", senderId)

    if (error) throw error
  }

  unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}
