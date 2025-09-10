import type { Tables } from "./database.types"

export type Profile = Tables<"profiles">

export type Agent = Tables<"agents">
export type AgentPublic = Omit<Agent, "password_hash">

export type AdminUser = Tables<"admin_users">
export type AdminUserPublic = Omit<AdminUser, "password_hash">

export type Case = Tables<"cases">
export type CaseNote = Tables<"case_notes">
export type CaseAssignment = Tables<"case_assignments">
export type CaseEscalation = Tables<"case_escalations">

export type ChatRoom = Tables<"chat_rooms">
export type Message = Tables<"messages">

export type AgentActivityLog = Tables<"agent_activity_logs">
