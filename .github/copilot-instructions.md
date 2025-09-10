# Fortivault Codebase Instructions

This document provides essential knowledge for AI agents working with the Fortivault codebase.

## Project Architecture

This is a Next.js application with the following key architectural components:

- **Frontend UI**: Built with Next.js 14+ using the App Router pattern
- **Authentication**: Custom auth system with agent and user roles (`components/auth/`)
- **Database**: Supabase integration with schema migrations (`lib/supabase/`, `scripts/*.sql`)
- **Real-time Features**: Chat and case management systems (`components/chat/`)
- **Component Library**: Uses Radix UI primitives with custom styling

### Database Schema
The database is organized around these core entities:
- **Cases**: Tracks fraud cases with unique IDs (CSRU-XXXXXXXXX format)
- **Agents**: Manages recovery specialists and their online status
- **Chat Rooms**: Links cases with victims and agents
- **Messages**: Stores real-time communication history
- **User Profiles**: Maintains user data and preferences

Database conventions:
- All tables use UUID primary keys
- Timestamps include created_at/updated_at fields
- JSONB fields for flexible data (e.g., transaction_hashes)
- Proper foreign key relationships with ON DELETE CASCADE

### Real-time Communication
The system uses Supabase real-time features for:

1. **Chat System**:
```tsx
// Example from components/chat/real-time-chat-system.tsx
const chatService = new RealTimeChatService()
await chatService.createOrGetChatRoom(caseId, userId)
chatService.subscribeToMessages(roomId, handleNewMessage)
```

2. **Case Updates**:
- Real-time status changes via Supabase subscriptions
- Typing indicators in chat
- Agent online presence tracking

### Component Organization

1. **Feature Modules** (`components/`):
   - `admin/` - Administrative dashboards and tools
   - `chat/` - Real-time communication components
   - `auth/` - Authentication and authorization
   - `wizard-steps/` - Multi-step forms

2. **UI Components** (`components/ui/`):
   ```tsx
   // Example card component pattern
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>Content</CardContent>
   </Card>
   ```

3. **Page-specific Components**:
   - Co-located with routes in `app/` directory
   - Share common layouts and loading states

### Key Directories
- `app/` - Next.js routes and pages
- `components/` - Reusable UI components and feature modules
- `lib/` - Core utilities and service integrations
- `hooks/` - Custom React hooks for state and data management

## Development Workflow

1. **Setup**:
   ```bash
   pnpm install
   pnpm dev
   ```

2. **Database Migrations**: 
   - Migration scripts are in `scripts/*.sql`
   - Apply in numerical order when setting up new environments

## Project Conventions

### Component Organization
- Feature components go in feature-specific folders (e.g., `components/admin/`, `components/chat/`)
- Shared UI components go in `components/ui/`
- Pages use co-located components in their directories when specific to that route

### State Management
- Authentication state managed through `hooks/use-auth.tsx`
- Real-time updates handled via `hooks/use-real-time-cases.tsx`
- Agent-specific logic isolated in `hooks/use-agent-auth.tsx`

### Data Flow Patterns
- Database types defined in `types/database.types.ts`
- Entity interfaces in `types/entities.ts`
- API routes in `app/api/` follow REST conventions
- Real-time updates use Supabase subscriptions

## Integration Points

1. **Supabase Integration**
   - Configuration in `lib/supabase/`
   - Used for auth, database, and real-time features

2. **Email Service**
   - Email templates and sending logic in `components/auth/email-templates.tsx`
   - Configuration detailed in `SMTP_SETUP.md`

## Common Patterns

1. **Protected Routes**:
   ```tsx
   // See components/auth/protected-route.tsx for implementation
   <ProtectedRoute>
     {/* Protected content */}
   </ProtectedRoute>
   ```

2. **Role-Based Access**:
   - Agent routes under `app/agent/`
   - Admin routes under `app/admin/`
   - Reviewer routes under `app/reviewer/`

3. **Real-time Updates**:
   - Use `useRealTimeCases` hook for case updates
   - Chat systems implement real-time messaging via Supabase channels
