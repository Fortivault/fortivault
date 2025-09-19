export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          password_hash: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          name: string
          password_hash: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_activity_logs: {
        Row: {
          activity_type: string
          agent_id: string | null
          case_id: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          agent_id?: string | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          agent_id?: string | null
          case_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_activity_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_activity_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          recipient_id: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          recipient_id: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          recipient_id?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_metrics: {
        Row: {
          agent_id: string | null
          avg_response_time_minutes: number | null
          cases_handled: number | null
          cases_resolved: number | null
          created_at: string | null
          id: string
          metric_date: string | null
          recovery_success_rate: number | null
          victim_satisfaction_score: number | null
        }
        Insert: {
          agent_id?: string | null
          avg_response_time_minutes?: number | null
          cases_handled?: number | null
          cases_resolved?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string | null
          recovery_success_rate?: number | null
          victim_satisfaction_score?: number | null
        }
        Update: {
          agent_id?: string | null
          avg_response_time_minutes?: number | null
          cases_handled?: number | null
          cases_resolved?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string | null
          recovery_success_rate?: number | null
          victim_satisfaction_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_specializations: {
        Row: {
          agent_id: string | null
          certification_date: string | null
          created_at: string | null
          experience_level: string | null
          id: string
          specialization: string
        }
        Insert: {
          agent_id?: string | null
          certification_date?: string | null
          created_at?: string | null
          experience_level?: string | null
          id?: string
          specialization: string
        }
        Update: {
          agent_id?: string | null
          certification_date?: string | null
          created_at?: string | null
          experience_level?: string | null
          id?: string
          specialization?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_specializations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avg_response_time_minutes: number | null
          created_at: string | null
          email: string
          id: string
          is_online: boolean | null
          is_supervisor: boolean | null
          last_seen: string | null
          name: string
          password_hash: string | null
          role: string | null
          specialization: string | null
          status: string | null
          success_rate: number | null
          total_cases_handled: number | null
        }
        Insert: {
          avg_response_time_minutes?: number | null
          created_at?: string | null
          email: string
          id?: string
          is_online?: boolean | null
          is_supervisor?: boolean | null
          last_seen?: string | null
          name: string
          password_hash?: string | null
          role?: string | null
          specialization?: string | null
          status?: string | null
          success_rate?: number | null
          total_cases_handled?: number | null
        }
        Update: {
          avg_response_time_minutes?: number | null
          created_at?: string | null
          email?: string
          id?: string
          is_online?: boolean | null
          is_supervisor?: boolean | null
          last_seen?: string | null
          name?: string
          password_hash?: string | null
          role?: string | null
          specialization?: string | null
          status?: string | null
          success_rate?: number | null
          total_cases_handled?: number | null
        }
        Relationships: []
      }
      case_assignments: {
        Row: {
          agent_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          assignment_type: string | null
          case_id: string | null
          id: string
          is_active: boolean | null
          unassigned_at: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_type?: string | null
          case_id?: string | null
          id?: string
          is_active?: boolean | null
          unassigned_at?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_type?: string | null
          case_id?: string | null
          id?: string
          is_active?: boolean | null
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_escalations: {
        Row: {
          case_id: string | null
          created_at: string | null
          escalated_by: string | null
          escalated_to: string | null
          escalation_level: string | null
          escalation_reason: string
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          escalated_by?: string | null
          escalated_to?: string | null
          escalation_level?: string | null
          escalation_reason: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          escalated_by?: string | null
          escalated_to?: string | null
          escalation_level?: string | null
          escalation_reason?: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_escalations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_escalations_escalated_by_fkey"
            columns: ["escalated_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_escalations_escalated_to_fkey"
            columns: ["escalated_to"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          agent_id: string | null
          case_id: string | null
          content: string
          created_at: string | null
          id: string
          is_confidential: boolean | null
          note_type: string | null
          priority: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          case_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_confidential?: boolean | null
          note_type?: string | null
          priority?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          case_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_confidential?: boolean | null
          note_type?: string | null
          priority?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_updated: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_updated?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_updated?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          amount: number | null
          assigned_agent_id: string | null
          bank_references: Json | null
          case_id: string
          created_at: string | null
          currency: string | null
          description: string | null
          estimated_recovery_amount: number | null
          evidence_file_count: number | null
          id: string
          last_agent_contact: string | null
          priority: string | null
          recovery_probability: number | null
          scam_type: string
          status: string | null
          timeline: string | null
          transaction_hashes: Json | null
          updated_at: string | null
          victim_email: string
          victim_phone: string | null
          victim_satisfaction_rating: number | null
        }
        Insert: {
          amount?: number | null
          assigned_agent_id?: string | null
          bank_references?: Json | null
          case_id: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_recovery_amount?: number | null
          evidence_file_count?: number | null
          id?: string
          last_agent_contact?: string | null
          priority?: string | null
          recovery_probability?: number | null
          scam_type: string
          status?: string | null
          timeline?: string | null
          transaction_hashes?: Json | null
          updated_at?: string | null
          victim_email: string
          victim_phone?: string | null
          victim_satisfaction_rating?: number | null
        }
        Update: {
          amount?: number | null
          assigned_agent_id?: string | null
          bank_references?: Json | null
          case_id?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_recovery_amount?: number | null
          evidence_file_count?: number | null
          id?: string
          last_agent_contact?: string | null
          priority?: string | null
          recovery_probability?: number | null
          scam_type?: string
          status?: string | null
          timeline?: string | null
          transaction_hashes?: Json | null
          updated_at?: string | null
          victim_email?: string
          victim_phone?: string | null
          victim_satisfaction_rating?: number | null
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          assigned_agent_id: string | null
          case_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          victim_email: string
        }
        Insert: {
          assigned_agent_id?: string | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          victim_email: string
        }
        Update: {
          assigned_agent_id?: string | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          victim_email?: string
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
          },
        ]
      }
      email_otp: {
        Row: {
          attempts: number | null
          case_id: string
          code_hash: string
          consumed_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
        }
        Insert: {
          attempts?: number | null
          case_id: string
          code_hash: string
          consumed_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
        }
        Update: {
          attempts?: number | null
          case_id?: string
          code_hash?: string
          consumed_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      legal_resources: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_room_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string
          sender_name: string
          sender_type: string
        }
        Insert: {
          chat_room_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
          sender_name: string
          sender_type: string
        }
        Update: {
          chat_room_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          target_id: string | null
          target_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          metadata: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_admin?: boolean | null
          last_name?: string | null
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recovery_results: {
        Row: {
          agent_id: string
          amount: number
          created_at: string | null
          estimated_amount: number
          fraud_type: string
          has_communication: boolean | null
          has_evidence: boolean | null
          id: string
          payment_method: string
          probability: number
          risk_level: string
          time_since_incident: number
          timeframe: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string | null
          estimated_amount: number
          fraud_type: string
          has_communication?: boolean | null
          has_evidence?: boolean | null
          id?: string
          payment_method: string
          probability: number
          risk_level: string
          time_since_incident: number
          timeframe: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string | null
          estimated_amount?: number
          fraud_type?: string
          has_communication?: boolean | null
          has_evidence?: boolean | null
          id?: string
          payment_method?: string
          probability?: number
          risk_level?: string
          time_since_incident?: number
          timeframe?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_results_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          completed: boolean | null
          content_url: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          level: string
          progress: number | null
          required: boolean | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          level?: string
          progress?: number | null
          required?: boolean | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          level?: string
          progress?: number | null
          required?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      victims: {
        Row: {
          agent_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          metadata: Json | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          metadata?: Json | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "victims_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
