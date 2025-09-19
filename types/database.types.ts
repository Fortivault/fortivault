export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: "user" | "reviewer"
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: "user" | "reviewer"
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: "user" | "reviewer"
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          id: string
          email: string
          name: string
          specialization: string | null
          role: string | null
          status: "active" | "inactive"
          password_hash: string
          is_online: boolean | null
          last_seen: string | null
          created_at: string
          updated_at: string | null
          referral_code: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          specialization?: string | null
          role?: string | null
          status?: "active" | "inactive"
          password_hash: string
          is_online?: boolean | null
          last_seen?: string | null
          created_at?: string
          updated_at?: string | null
          referral_code?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          specialization?: string | null
          role?: string | null
          status?: "active" | "inactive"
          password_hash?: string
          is_online?: boolean | null
          last_seen?: string | null
          created_at?: string
          updated_at?: string | null
          referral_code?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          name: string | null
          status: "active" | "inactive"
          password_hash: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          status?: "active" | "inactive"
          password_hash: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          status?: "active" | "inactive"
          password_hash?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          id: string
          case_id: string
          victim_email: string
          victim_phone: string | null
          scam_type: string
          amount: number | null
          currency: string | null
          timeline: string | null
          description: string | null
          status: string
          priority: string
          assigned_agent_id: string | null
          estimated_recovery_amount: number | null
          recovery_probability: number | null
          last_agent_contact: string | null
          victim_satisfaction_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          victim_email: string
          victim_phone?: string | null
          scam_type: string
          amount?: number | null
          currency?: string | null
          timeline?: string | null
          description?: string | null
          status?: string
          priority?: string
          assigned_agent_id?: string | null
          estimated_recovery_amount?: number | null
          recovery_probability?: number | null
          last_agent_contact?: string | null
          victim_satisfaction_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          victim_email?: string
          victim_phone?: string | null
          scam_type?: string
          amount?: number | null
          currency?: string | null
          timeline?: string | null
          description?: string | null
          status?: string
          priority?: string
          assigned_agent_id?: string | null
          estimated_recovery_amount?: number | null
          recovery_probability?: number | null
          last_agent_contact?: string | null
          victim_satisfaction_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      case_notes: {
        Row: {
          id: string
          case_id: string
          agent_id: string
          note_type: string
          title: string | null
          content: string
          is_confidential: boolean
          priority: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          agent_id: string
          note_type?: string
          title?: string | null
          content: string
          is_confidential?: boolean
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          agent_id?: string
          note_type?: string
          title?: string | null
          content?: string
          is_confidential?: boolean
          priority?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      case_assignments: {
        Row: {
          id: string
          case_id: string
          agent_id: string
          assigned_by: string | null
          assignment_type: string
          assigned_at: string
          unassigned_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          case_id: string
          agent_id: string
          assigned_by?: string | null
          assignment_type?: string
          assigned_at?: string
          unassigned_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          case_id?: string
          agent_id?: string
          assigned_by?: string | null
          assignment_type?: string
          assigned_at?: string
          unassigned_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "case_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      case_escalations: {
        Row: {
          id: string
          case_id: string
          escalated_by: string
          escalated_to: string
          escalation_reason: string
          escalation_level: string
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          escalated_by: string
          escalated_to: string
          escalation_reason: string
          escalation_level?: string
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          escalated_by?: string
          escalated_to?: string
          escalation_reason?: string
          escalation_level?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_escalations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_rooms: {
        Row: {
          id: string
          case_id: string
          victim_email: string
          assigned_agent_id: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          victim_email: string
          assigned_agent_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          victim_email?: string
          assigned_agent_id?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          chat_room_id: string
          sender_type: "victim" | "agent"
          sender_id: string
          sender_name: string
          content: string
          message_type: "text" | "file" | "system"
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          sender_type: "victim" | "agent"
          sender_id: string
          sender_name: string
          content: string
          message_type?: "text" | "file" | "system"
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          sender_type?: "victim" | "agent"
          sender_id?: string
          sender_name?: string
          content?: string
          message_type?: "text" | "file" | "system"
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_activity_logs: {
        Row: {
          id: string
          agent_id: string
          activity_type: string
          case_id: string | null
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          activity_type: string
          case_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          activity_type?: string
          case_id?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activity_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          }
        ]
      }
      email_otp: {
        Row: {
          id: string
          email: string
          case_id: string
          code_hash: string
          expires_at: string
          attempts: number
          consumed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          case_id: string
          code_hash: string
          expires_at: string
          attempts?: number
          consumed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          case_id?: string
          code_hash?: string
          expires_at?: string
          attempts?: number
          consumed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type PublicTables = Database["public"]["Tables"]
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"]
export type Inserts<T extends keyof PublicTables> = PublicTables[T]["Insert"]
export type Updates<T extends keyof PublicTables> = PublicTables[T]["Update"]
