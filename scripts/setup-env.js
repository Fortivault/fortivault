#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps users configure their environment variables securely
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function generateSecureSecret(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function setupEnvironment() {
  console.log('🔧 Fortivault Environment Setup')
  console.log('================================\n')
  
  console.log('This script will help you configure your environment variables securely.')
  console.log('You will need to have accounts set up with:')
  console.log('- Supabase (database and auth)')
  console.log('- Email provider (SMTP)')
  console.log('- Formspree (form handling)')
  console.log('- Sentry (optional, for error tracking)\n')
  
  const proceed = await question('Do you want to continue? (y/N): ')
  if (proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.')
    rl.close()
    return
  }
  
  console.log('\n📋 Please provide the following information:\n')
  
  // Application settings
  const appUrl = await question('App URL (e.g., https://your-domain.com): ')
  const emailFrom = await question('Email "From" name (default: Fortivault Security): ') || 'Fortivault Security'
  
  // Supabase settings
  console.log('\n🗄️  Supabase Configuration:')
  const supabaseUrl = await question('Supabase URL: ')
  const supabaseAnonKey = await question('Supabase Anon Key: ')
  const supabaseServiceKey = await question('Supabase Service Role Key: ')
  
  // Generate JWT secret
  const jwtSecret = generateSecureSecret()
  console.log(`Generated JWT Secret: ${jwtSecret}`)
  
  // Database settings (auto-derived from Supabase)
  const supabaseProject = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  const dbPassword = await question('Database Password: ')
  
  // SMTP settings
  console.log('\n📧 SMTP Configuration:')
  const smtpHost = await question('SMTP Host: ')
  const smtpPort = await question('SMTP Port (default: 587): ') || '587'
  const smtpUser = await question('SMTP Username: ')
  const smtpPass = await question('SMTP Password: ')
  
  // Formspree
  const formspreeEndpoint = await question('Formspree Endpoint: ')
  
  // Sentry (optional)
  console.log('\n🐛 Sentry Configuration (optional):')
  const sentryDsn = await question('Sentry DSN (leave empty to skip): ')
  const sentryOrg = sentryDsn ? await question('Sentry Organization: ') : ''
  const sentryToken = sentryDsn ? await question('Sentry Auth Token: ') : ''
  
  // Generate .env.local content
  const envContent = `# Fortivault Environment Configuration
# Generated on ${new Date().toISOString()}
# DO NOT COMMIT THIS FILE TO VERSION CONTROL

# Application Configuration
ADMIN_FORCE_SETUP=false
EMAIL_FROM="${emailFrom}"
PORT=10000

# Public URLs and Endpoints
NEXT_PUBLIC_APP_URL=${appUrl}
NEXT_PUBLIC_FORMSPREE_ENDPOINT=${formspreeEndpoint}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
SUPABASE_JWT_SECRET="${jwtSecret}"
SUPABASE_URL=${supabaseUrl}

# Database Configuration
POSTGRES_DATABASE=postgres
POSTGRES_HOST=db.${supabaseProject}.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${dbPassword}
POSTGRES_PRISMA_URL="postgres://postgres.${supabaseProject}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL="postgres://postgres.${supabaseProject}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_URL_NON_POOLING="postgres://postgres.${supabaseProject}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# SMTP Email Configuration
SMTP_FROM=${smtpUser}
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}

${sentryDsn ? `# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=${sentryDsn}
SENTRY_DSN=${sentryDsn}
SENTRY_ORG=${sentryOrg}
SENTRY_AUTH_TOKEN=${sentryToken}` : '# Sentry Configuration (disabled)'}
`
  
  // Write .env.local file
  const envPath = path.join(process.cwd(), '.env.local')
  fs.writeFileSync(envPath, envContent)
  
  console.log('\n✅ Environment configuration complete!')
  console.log(`📁 Created: ${envPath}`)
  console.log('\n🔒 Security Reminders:')
  console.log('- Never commit .env.local to version control')
  console.log('- Use different credentials for production')
  console.log('- Enable 2FA on all service accounts')
  console.log('- Regularly rotate your credentials')
  console.log('- Monitor access logs for suspicious activity')
  
  rl.close()
}

// Run setup if called directly
if (require.main === module) {
  setupEnvironment().catch(console.error)
}

module.exports = { setupEnvironment }