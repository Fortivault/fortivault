# 🔒 Fortivault Security Setup Guide

## ⚠️ CRITICAL: Your Credentials Were Compromised

Your environment variables were exposed publicly and must be rotated immediately. Follow this guide to secure your application.

## 🚨 Immediate Actions Required

### 1. Rotate All Credentials

#### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Click **Reset** next to Service Role Key
5. Copy the new service role key
6. Go to **Settings** → **Database**
7. Change your database password

#### Email (GMX)
1. Log into your GMX account
2. Go to **Security Settings**
3. Change your password
4. Update SMTP credentials

#### Sentry
1. Go to [Sentry Dashboard](https://sentry.io/)
2. Go to **Settings** → **Auth Tokens**
3. Revoke the current token
4. Generate a new auth token

#### Formspree
1. Check your Formspree account for any suspicious activity
2. Consider creating a new form endpoint if needed

### 2. Secure Environment Setup

#### Option A: Interactive Setup (Recommended)
```bash
# Run the interactive setup script
node scripts/setup-env.js
```

#### Option B: Manual Setup
1. Copy the template:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your NEW credentials
3. Never commit `.env.local` to version control

### 3. Validate Configuration
```bash
# Test your environment setup
npm run dev
```

The app will validate all environment variables on startup.

## 🛡️ Security Best Practices

### Environment Variables
- ✅ Use `.env.local` for local development
- ✅ Use platform environment variables for production
- ❌ Never commit `.env` files to version control
- ❌ Never share environment variables publicly

### Credential Management
- 🔄 Rotate credentials every 90 days
- 🔐 Use strong, unique passwords
- 📱 Enable 2FA on all service accounts
- 📊 Monitor access logs regularly

### Development vs Production
- Use separate credentials for each environment
- Implement IP restrictions where possible
- Use different database instances
- Monitor all environments separately

## 🔍 Security Monitoring

### What to Monitor
- Unusual database activity
- Unexpected email sending
- Sentry error spikes
- Failed authentication attempts

### Access Logs to Check
- Supabase: Dashboard → Logs
- Email provider: Check sent items
- Sentry: Check project access logs
- Hosting platform: Check deployment logs

## 📋 Environment Variables Checklist

### Required Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - New Supabase URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - New anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - New service role key
- [ ] `SUPABASE_JWT_SECRET` - New JWT secret
- [ ] `POSTGRES_PASSWORD` - New database password
- [ ] `SMTP_PASS` - New email password
- [ ] `SENTRY_AUTH_TOKEN` - New Sentry token

### Optional Variables
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN
- [ ] `SENTRY_ORG` - Sentry organization
- [ ] `NEXT_PUBLIC_FORMSPREE_ENDPOINT` - Form endpoint

## 🚀 Deployment Security

### Hosting Platform Setup
1. **Never** use the compromised credentials in production
2. Set environment variables in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Render: Dashboard → Environment
3. Use different credentials for staging/production

### CI/CD Security
- Use encrypted secrets in GitHub Actions
- Never log environment variables
- Implement secret scanning
- Use least-privilege access tokens

## 🆘 Incident Response

If you suspect ongoing compromise:

1. **Immediately** change all passwords
2. **Review** all recent activity logs
3. **Check** for unauthorized database changes
4. **Monitor** for suspicious email activity
5. **Consider** temporarily disabling the application
6. **Document** any suspicious findings

## 📞 Support

If you need help with security setup:
1. Check the logs for specific error messages
2. Verify all credentials are correctly formatted
3. Test each service connection individually
4. Review the environment validation output

## ✅ Verification Steps

After setup, verify everything works:

```bash
# 1. Start the application
npm run dev

# 2. Test user registration
# 3. Test case submission
# 4. Test admin login
# 5. Check email delivery
# 6. Verify database connections
```

---

**Remember: Security is an ongoing process, not a one-time setup. Stay vigilant and keep your credentials secure!**