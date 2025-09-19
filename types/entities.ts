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



// New tables from schema
export type AgentMessage = Tables<"agent_messages">
export type AgentPerformanceMetric = Tables<"agent_performance_metrics">
export type AgentSpecialization = Tables<"agent_specializations">
export type CaseTemplate = Tables<"case_templates">
export type EmailOtp = Tables<"email_otp">
export type LegalResource = Tables<"legal_resources">
export type Notification = Tables<"notifications">
export type RecoveryResult = Tables<"recovery_results">
export type TrainingModule = Tables<"training_modules">
export type Victim = Tables<"victims">

export type AgentActivityLog = Tables<"agent_activity_logs">
