/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_APP_URL?: string
    NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?: string
    SMTP_HOST?: string
    SMTP_PORT?: string
    SMTP_USER?: string
    SMTP_PASS?: string
    SMTP_FROM?: string
    EMAIL_FROM?: string
  }
}
