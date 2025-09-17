# Admin Route Security Implementation

## Overview

This document outlines the comprehensive security measures implemented to protect admin routes in the Fortivault application.

## Security Layers

### 1. Server-Side Authentication (Layout Protection)
- **File**: `/app/admin/layout.tsx`
- **Protection**: Server-side authentication check before rendering any admin pages
- **Features**:
  - Validates user session with Supabase
  - Checks admin role in user metadata
  - Cross-references with `admin_users` table
  - Automatic redirect to login if unauthorized

### 2. Enhanced Middleware Protection
- **File**: `/lib/supabase/middleware.ts`
- **Protection**: Request-level authentication for all admin routes
- **Features**:
  - Validates user session and admin role
  - Database verification of admin status
  - Fallback email-based verification
  - Automatic redirect to login for unauthorized access

### 3. API Route Security
- **Files**: All `/app/api/admin/*` routes
- **Protection**: Individual API endpoint security
- **Features**:
  - Bearer token authentication
  - Admin context validation
  - Database-level admin verification
  - Proper error handling and logging

### 4. CSRF Protection
- **File**: `/lib/security/csrf.ts`
- **Protection**: Cross-Site Request Forgery prevention
- **Features**:
  - Secure token generation using crypto.randomBytes
  - Token hashing for secure storage
  - HTTP-only cookies with secure flags
  - Header-based token verification
  - Middleware wrapper for API routes

### 5. Rate Limiting
- **File**: `/lib/security/rate-limiter.ts`
- **Protection**: Prevents brute force and DoS attacks
- **Configurations**:
  - **Login**: 5 attempts per 15 minutes
  - **API**: 60 requests per minute
  - **Sensitive Operations**: 10 requests per 5 minutes
- **Features**:
  - IP-based identification
  - Sliding window rate limiting
  - Rate limit headers in responses
  - Automatic cleanup of old entries

## Security Features

### Authentication Flow
1. User attempts to access admin route
2. Middleware checks session and admin role
3. Layout component performs server-side verification
4. Database validation of admin status
5. API routes validate bearer tokens and admin context

### CSRF Protection Flow
1. Client requests CSRF token from `/api/csrf`
2. Token is hashed and stored in HTTP-only cookie
3. Client includes token in request headers
4. Server validates token hash against stored value
5. Request is processed or rejected based on validation

### Rate Limiting Flow
1. Extract client IP from request headers
2. Check request count against configured limits
3. Allow or deny request based on rate limit
4. Add rate limit headers to response
5. Clean up old entries periodically

## API Endpoints

### Protected Admin API Routes
- `GET /api/admin/cases` - List all cases (Rate limited: API)
- `PATCH /api/admin/cases/[id]/status` - Update case status (Rate limited: SENSITIVE, CSRF protected)
- `POST /api/admin/cases/[id]/notes` - Add case note (Rate limited: SENSITIVE, CSRF protected)

### Security Endpoints
- `GET /api/csrf` - Generate CSRF token
- `POST /api/admin/logout` - Admin logout

## Configuration

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

### Database Requirements
- `admin_users` table with columns: `id`, `email`, `status`
- Active admin users must have `status = 'active'`
- Admin users must have `role = 'admin'` in Supabase user metadata

## Security Best Practices Implemented

1. **Defense in Depth**: Multiple layers of security (middleware, layout, API)
2. **Server-Side Validation**: All critical checks performed server-side
3. **Secure Token Handling**: CSRF tokens are hashed and stored securely
4. **Rate Limiting**: Prevents brute force and DoS attacks
5. **Proper Error Handling**: No sensitive information leaked in error messages
6. **Session Management**: Secure cookie handling with appropriate flags
7. **Database Verification**: Cross-reference admin status in database
8. **Logging**: Security events are logged for monitoring

## Testing Security

### Manual Testing
1. **Unauthorized Access**: Try accessing `/admin` without authentication
2. **Role Verification**: Try accessing with non-admin user
3. **CSRF Protection**: Try API calls without CSRF token
4. **Rate Limiting**: Make rapid requests to test limits
5. **Session Validation**: Test with expired or invalid sessions

### Automated Testing
Consider implementing automated security tests for:
- Authentication bypass attempts
- CSRF token validation
- Rate limit enforcement
- Session management
- Admin role verification

## Monitoring and Alerts

### Security Events to Monitor
- Failed admin login attempts
- Rate limit violations
- CSRF token validation failures
- Unauthorized access attempts
- Admin session anomalies

### Recommended Alerts
- Multiple failed login attempts from same IP
- Rate limit violations exceeding threshold
- Admin access from unusual locations/times
- CSRF validation failures

## Maintenance

### Regular Security Tasks
1. Review admin user list and remove inactive accounts
2. Monitor security logs for suspicious activity
3. Update rate limiting thresholds based on usage patterns
4. Rotate CSRF token secrets periodically
5. Review and update security configurations

### Security Updates
- Keep dependencies updated
- Monitor security advisories for Next.js and Supabase
- Regular security audits of admin functionality
- Penetration testing of admin routes

## Compliance

This implementation addresses common security requirements:
- **OWASP Top 10**: Protection against common web vulnerabilities
- **CSRF Protection**: Prevents cross-site request forgery
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Authentication**: Strong multi-layer authentication
- **Authorization**: Proper role-based access control