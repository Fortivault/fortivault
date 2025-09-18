# 🔧 Environment Setup Guide

## Quick Start

### 1. Interactive Setup (Recommended)
```bash
npm run setup:env
```

### 2. Manual Setup
```bash
# Copy the template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

### 3. Validate Configuration
```bash
npm run validate:env
npm run dev
```

## Required Services

### Supabase (Database & Auth)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get your project URL and keys from Settings → API
4. Set up database schema (see `/lib/supabase/schema.sql`)

### Email Provider (SMTP)
- **Recommended**: Gmail, GMX, or dedicated email service
- **Required**: SMTP credentials (host, port, username, password)

### Formspree (Form Handling)
1. Create account at [formspree.io](https://formspree.io)
2. Create new form
3. Get form endpoint URL

### Sentry (Optional - Error Tracking)
1. Create account at [sentry.io](https://sentry.io)
2. Create new project
3. Get DSN and auth token

## Environment Variables

### Required
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POSTGRES_PASSWORD=your-db-password
SMTP_PASS=your-email-password
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Optional
```bash
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-token
```

## Security Checklist

- [ ] All credentials are new and secure
- [ ] 2FA enabled on all service accounts
- [ ] `.env.local` is not committed to git
- [ ] Different credentials for dev/staging/prod
- [ ] Regular credential rotation scheduled

## Troubleshooting

### Common Issues
1. **Database connection failed**: Check Supabase credentials
2. **Email not sending**: Verify SMTP settings
3. **Form submission failed**: Check Formspree endpoint
4. **Build errors**: Run `npm run validate:env`

### Getting Help
1. Check the console for specific error messages
2. Verify all required environment variables are set
3. Test each service connection individually
4. Review the security setup guide

## Production Deployment

### Hosting Platforms
- **Vercel**: Set environment variables in project settings
- **Netlify**: Configure in site settings
- **Render**: Set in dashboard environment section

### Security Notes
- Never use development credentials in production
- Use platform-specific environment variable management
- Enable monitoring and alerting
- Implement proper backup strategies