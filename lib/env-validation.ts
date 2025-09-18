/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  // Application
  ADMIN_FORCE_SETUP: boolean
  EMAIL_FROM: string
  PORT: number
  
  // Public URLs
  NEXT_PUBLIC_APP_URL: string
  NEXT_PUBLIC_FORMSPREE_ENDPOINT: string
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_JWT_SECRET: string
  SUPABASE_URL: string
  
  // Database
  POSTGRES_DATABASE: string
  POSTGRES_HOST: string
  POSTGRES_USER: string
  POSTGRES_PASSWORD: string
  POSTGRES_PRISMA_URL: string
  POSTGRES_URL: string
  POSTGRES_URL_NON_POOLING: string
  
  // SMTP
  SMTP_FROM: string
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_USER: string
  SMTP_PASS: string
  
  // Sentry (Optional)
  NEXT_PUBLIC_SENTRY_DSN?: string
  SENTRY_DSN?: string
  SENTRY_ORG?: string
  SENTRY_AUTH_TOKEN?: string
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'POSTGRES_PASSWORD',
  'SMTP_PASS',
  'NEXT_PUBLIC_APP_URL'
] as const

function validateEnvironment(): EnvironmentConfig {
  const missing: string[] = []
  const invalid: string[] = []
  
  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  // Validate URL formats
  const urlVars = ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL']
  for (const urlVar of urlVars) {
    const value = process.env[urlVar]
    if (value && !isValidUrl(value)) {
      invalid.push(`${urlVar} (invalid URL format)`)
    }
  }
  
  // Validate email formats
  const emailVars = ['EMAIL_FROM', 'SMTP_FROM', 'SMTP_USER']
  for (const emailVar of emailVars) {
    const value = process.env[emailVar]
    if (value && !isValidEmail(value)) {
      invalid.push(`${emailVar} (invalid email format)`)
    }
  }
  
  // Validate numeric values
  const port = parseInt(process.env.PORT || '10000')
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  
  if (isNaN(port) || port < 1 || port > 65535) {
    invalid.push('PORT (must be a valid port number)')
  }
  
  if (isNaN(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
    invalid.push('SMTP_PORT (must be a valid port number)')
  }
  
  // Report errors
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(env => console.error(`  - ${env}`))
  }
  
  if (invalid.length > 0) {
    console.error('❌ Invalid environment variables:')
    invalid.forEach(env => console.error(`  - ${env}`))
  }
  
  if (missing.length > 0 || invalid.length > 0) {
    console.error('\n📋 Please check your .env.local file and ensure all required variables are set correctly.')
    console.error('📖 See .env.example for the expected format.')
    process.exit(1)
  }
  
  // Return validated config
  return {
    ADMIN_FORCE_SETUP: process.env.ADMIN_FORCE_SETUP === 'true',
    EMAIL_FROM: process.env.EMAIL_FROM || 'Fortivault Security',
    PORT: port,
    
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NEXT_PUBLIC_FORMSPREE_ENDPOINT: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT!,
    
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || 'postgres',
    POSTGRES_HOST: process.env.POSTGRES_HOST!,
    POSTGRES_USER: process.env.POSTGRES_USER || 'postgres',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL!,
    POSTGRES_URL: process.env.POSTGRES_URL!,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING!,
    
    SMTP_FROM: process.env.SMTP_FROM!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: smtpPort,
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Export validated environment config
export const env = validateEnvironment()

// Log successful validation in development
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Environment variables validated successfully')
}