# Real-Time Collaborative Task Management System - Technical Specifications

## 1. Project Overview

### 1.1 Project Name

**HelloCollab**

### 1.2 Description

A real-time collaborative task management application similar to Trello, where teams can organize work into boards, lists, and cards. Multiple users can collaborate simultaneously with instant updates across all connected clients.

### 1.3 Target Audience

- Small to medium-sized development teams
- Project managers
- Freelancers managing multiple projects
- Recruiters evaluating full-stack capabilities

### 1.4 Core Objectives

- Demonstrate full-stack development skills
- Showcase real-time WebSocket implementation
- Display complex state management
- Prove database design capabilities
- Deploy 100% free for live demos

---

## 2. Feature Requirements

### 2.1 MVP Features (Phase 1 - Build First)

#### 2.1.1 User Authentication

- Email/password registration
- Login with JWT tokens
- Password reset via email
- Basic user profile (name, email, avatar URL)

#### 2.1.2 Board Management

- Create new boards
- View list of user's boards
- Edit board name and description
- Delete boards (owner only)
- Board background color customization

#### 2.1.3 List Management

- Create lists within boards
- Rename lists
- Delete lists
- Reorder lists (drag-and-drop)

#### 2.1.4 Card Management

- Create cards within lists
- Edit card title and description
- Delete cards
- Move cards between lists (drag-and-drop)
- Reorder cards within a list

#### 2.1.5 Real-Time Collaboration

- Live updates when other users:
  - Create/edit/delete boards, lists, or cards
  - Move cards between lists
  - Reorder lists or cards
- Show active users on current board
- Visual indicators when others are editing

#### 2.1.6 Basic UI

- Responsive design (desktop + mobile)
- Dark/light theme toggle
- Drag-and-drop interface
- Loading states and error handling

### 2.2 Phase 2 Features (Post-MVP)

#### 2.2.1 Team Collaboration

- Invite users to boards via email
- Role-based permissions:
  - **Owner:** Full control
  - **Editor:** Can edit, cannot delete board
  - **Viewer:** Read-only access
- Remove users from boards

#### 2.2.2 Card Enhancements

- Add due dates with visual indicators
- Assign users to cards
- Add labels/tags with colors
- Card cover images
- Checklist items within cards
- Card comments with mentions

#### 2.2.3 File Attachments

- Upload files to cards
- Image preview
- Download attachments
- File size limits (within free tier)

#### 2.2.4 Activity Timeline

- Board activity feed
- Filter by user or action type
- "Who did what and when"

#### 2.2.5 Notifications

- In-app notifications
- Email notifications (optional)
- Notification preferences

### 2.3 Future Enhancements (Phase 3)

- Card templates
- Board templates
- Advanced search and filters
- Card dependencies
- Time tracking
- Calendar view
- Export boards (JSON, CSV)
- Keyboard shortcuts
- Mobile apps (React Native)

---

## 3. User Stories

### 3.1 Core User Stories

**As a project manager, I want to:**

- Create multiple boards for different projects
- Organize tasks into categorized lists (To Do, In Progress, Done)
- See real-time updates when team members make changes
- Assign tasks to team members
- Track project progress at a glance

**As a team member, I want to:**

- See all boards I'm collaborating on
- Move cards between lists as I work on them
- Add details and comments to tasks
- Get notified when I'm assigned to a task
- Work simultaneously with teammates without conflicts

**As a recruiter viewing the demo, I want to:**

- Quickly understand the application's purpose
- See real-time collaboration in action
- Experience smooth drag-and-drop interactions
- View the application on my mobile device

---

## 4. Technical Architecture

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + Tailwind CSS                   │  │
│  │  - React DnD (drag-and-drop)                         │  │
│  │  - Zustand/Redux (state management)                  │  │
│  │  - Socket.io Client (real-time)                      │  │
│  │  - React Router (navigation)                         │  │
│  │  - React Query (data fetching)                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER TIER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express + TypeScript                      │  │
│  │  - Socket.io Server (real-time)                      │  │
│  │  - JWT Authentication                                │  │
│  │  - Express Middleware (auth, validation, error)      │  │
│  │  - Prisma ORM (database access)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ TCP
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE TIER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                          │  │
│  │  - User data                                         │  │
│  │  - Boards, Lists, Cards                              │  │
│  │  - Permissions & Activity logs                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Phase 2)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       STORAGE TIER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloudinary / Supabase Storage                       │  │
│  │  - User avatars                                      │  │
│  │  - Card attachments                                  │  │
│  │  - Board cover images                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack (Free Deployment)

#### Frontend

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Drag & Drop:** @dnd-kit/core (modern alternative to react-dnd)
- **State Management:** Zustand (lightweight) or Redux Toolkit
- **Data Fetching:** TanStack Query (React Query)
- **Real-time:** Socket.io Client
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Vercel (free tier)

#### Backend

- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js
- **Real-time:** Socket.io
- **ORM:** Prisma 7.2.0 (with PostgreSQL adapter)
- **Authentication:** JWT (jsonwebtoken, bcrypt)
- **Validation:** Zod
- **Email:** Resend (free tier: 3,000 emails/month)
- **Deployment:** Render.com or Railway (free tier)

#### Database

- **Primary DB:** PostgreSQL
- **Hosting:** ✅ Supabase (free tier: 500MB) - **CONFIGURED**

#### Storage (Phase 2)

- **Option 1:** Cloudinary (free tier: 25GB storage, 25GB bandwidth/month)
- **Option 2:** Supabase Storage (1GB free)

#### DevOps

- **Monorepo:** ✅ pnpm workspaces - **CONFIGURED**
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Vitest (unit), Playwright (E2E)
- **Code Quality:** ESLint, Prettier
- **Type Checking:** TypeScript strict mode

---

## 5. Database Schema

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id              │──────┐
│ email           │      │
│ password_hash   │      │
│ name            │      │
│ avatar_url      │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
                         │
                         │ 1:N
                         │
                         ▼
              ┌─────────────────┐
              │  board_members  │
              ├─────────────────┤
              │ id              │
              │ board_id        │──────┐
              │ user_id         │      │
              │ role            │      │ N:1
              │ joined_at       │      │
              └─────────────────┘      │
                                       │
                         ┌─────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │     boards      │
              ├─────────────────┤
              │ id              │──────┐
              │ title           │      │
              │ description     │      │
              │ bg_color        │      │
              │ owner_id        │      │ 1:N
              │ created_at      │      │
              │ updated_at      │      │
              └─────────────────┘      │
                                       │
                         ┌─────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │      lists      │
              ├─────────────────┤
              │ id              │──────┐
              │ title           │      │
              │ board_id        │      │
              │ position        │      │ 1:N
              │ created_at      │      │
              │ updated_at      │      │
              └─────────────────┘      │
                                       │
                         ┌─────────────┘
                         │
                         ▼
              ┌─────────────────┐
              │      cards      │
              ├─────────────────┤
              │ id              │
              │ title           │
              │ description     │
              │ list_id         │
              │ position        │
              │ due_date        │ (nullable, Phase 2)
              │ cover_url       │ (nullable, Phase 2)
              │ created_at      │
              │ updated_at      │
              └─────────────────┘
                       │
                       │ 1:N (Phase 2)
                       │
       ┌───────────────┴───────────────┬────────────────┐
       ▼                               ▼                ▼
┌─────────────┐              ┌──────────────┐  ┌─────────────┐
│card_members │              │   comments   │  │ attachments │
├─────────────┤              ├──────────────┤  ├─────────────┤
│ id          │              │ id           │  │ id          │
│ card_id     │              │ card_id      │  │ card_id     │
│ user_id     │              │ user_id      │  │ filename    │
│ assigned_at │              │ content      │  │ file_url    │
└─────────────┘              │ created_at   │  │ file_size   │
                             │ updated_at   │  │ uploaded_at │
                             └──────────────┘  └─────────────┘
```

### 5.2 Prisma Schema (MVP)

**Note:** Using Prisma 7.2.0 with PostgreSQL adapter for runtime connections.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Required for Prisma CLI commands
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String         @map("password_hash")
  name          String
  avatarUrl     String?        @map("avatar_url")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  ownedBoards   Board[]        @relation("BoardOwner")
  boardMembers  BoardMember[]

  @@map("users")
}

model Board {
  id            String         @id @default(cuid())
  title         String
  description   String?
  bgColor       String         @default("#0079BF") @map("bg_color")
  ownerId       String         @map("owner_id")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  owner         User           @relation("BoardOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members       BoardMember[]
  lists         List[]

  @@index([ownerId])
  @@map("boards")
}

model BoardMember {
  id        String    @id @default(cuid())
  boardId   String    @map("board_id")
  userId    String    @map("user_id")
  role      Role      @default(EDITOR)
  joinedAt  DateTime  @default(now()) @map("joined_at")

  board     Board     @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([boardId, userId])
  @@index([userId])
  @@map("board_members")
}

enum Role {
  OWNER
  EDITOR
  VIEWER
}

model List {
  id        String    @id @default(cuid())
  title     String
  boardId   String    @map("board_id")
  position  Int
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  board     Board     @relation(fields: [boardId], references: [id], onDelete: Cascade)
  cards     Card[]

  @@index([boardId])
  @@map("lists")
}

model Card {
  id          String    @id @default(cuid())
  title       String
  description String?   @db.Text
  listId      String    @map("list_id")
  position    Int
  dueDate     DateTime? @map("due_date")
  coverUrl    String?   @map("cover_url")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  list        List      @relation(fields: [listId], references: [id], onDelete: Cascade)

  @@index([listId])
  @@map("cards")
}
```

---

## 6. API Design

### 6.1 REST API Endpoints

#### Authentication

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
GET    /api/auth/me                - Get current user profile
PATCH  /api/auth/me                - Update user profile
```

#### Boards

```
GET    /api/boards                 - Get all user's boards
POST   /api/boards                 - Create new board
GET    /api/boards/:id             - Get board details with lists and cards
PATCH  /api/boards/:id             - Update board
DELETE /api/boards/:id             - Delete board
```

#### Board Members (Phase 2)

```
GET    /api/boards/:id/members     - Get board members
POST   /api/boards/:id/members     - Add member to board
PATCH  /api/boards/:id/members/:userId  - Update member role
DELETE /api/boards/:id/members/:userId  - Remove member from board
```

#### Lists

```
POST   /api/boards/:boardId/lists         - Create list
PATCH  /api/lists/:id                     - Update list
DELETE /api/lists/:id                     - Delete list
PATCH  /api/lists/:id/reorder             - Reorder lists
```

#### Cards

```
POST   /api/lists/:listId/cards           - Create card
GET    /api/cards/:id                     - Get card details
PATCH  /api/cards/:id                     - Update card
DELETE /api/cards/:id                     - Delete card
PATCH  /api/cards/:id/move                - Move card to different list
PATCH  /api/cards/:id/reorder             - Reorder card within list
```

### 6.2 WebSocket Events

#### Client -> Server

```javascript
// Connection
'join-board' { boardId: string }
'leave-board' { boardId: string }

// Board events
'board:update' { boardId: string, updates: Partial<Board> }
'board:delete' { boardId: string }

// List events
'list:create' { boardId: string, list: List }
'list:update' { listId: string, updates: Partial<List> }
'list:delete' { listId: string }
'list:reorder' { boardId: string, listIds: string[] }

// Card events
'card:create' { listId: string, card: Card }
'card:update' { cardId: string, updates: Partial<Card> }
'card:delete' { cardId: string }
'card:move' { cardId: string, fromListId: string, toListId: string, position: number }
'card:reorder' { listId: string, cardIds: string[] }

// Presence
'user:typing' { cardId: string, userId: string }
'user:editing' { cardId: string, userId: string }
```

#### Server -> Client

```javascript
// Board events
'board:updated' { boardId: string, board: Board, userId: string }
'board:deleted' { boardId: string, userId: string }

// List events
'list:created' { list: List, userId: string }
'list:updated' { list: List, userId: string }
'list:deleted' { listId: string, userId: string }
'list:reordered' { boardId: string, lists: List[], userId: string }

// Card events
'card:created' { card: Card, userId: string }
'card:updated' { card: Card, userId: string }
'card:deleted' { cardId: string, listId: string, userId: string }
'card:moved' { card: Card, fromListId: string, userId: string }
'card:reordered' { listId: string, cards: Card[], userId: string }

// Presence
'users:active' { boardId: string, users: User[] }
'user:joined' { user: User }
'user:left' { userId: string }
'user:typing' { cardId: string, user: User }
'user:editing' { cardId: string, user: User }

// Errors
'error' { message: string, code: string }
```

---

## 7. UI/UX Design

### 7.1 Pages & Routes

```
/                           - Landing page (public)
/login                      - Login page
/register                   - Registration page
/forgot-password            - Password reset request
/reset-password/:token      - Password reset form

/dashboard                  - User's boards list
/board/:id                  - Board view (main app interface)
/board/:id/settings         - Board settings (Phase 2)
/profile                    - User profile settings
```

### 7.2 Key UI Components

#### Board View Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] Board Title                    [Invite] [Settings] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ To Do    │  │ In Prog  │  │ Review   │  │ Done     │  │
│  │ [+ Card] │  │ [+ Card] │  │ [+ Card] │  │ [+ Card] │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤  │
│  │ Card 1   │  │ Card 3   │  │ Card 5   │  │          │  │
│  │ Card 2   │  │ Card 4   │  │          │  │          │  │
│  │          │  │          │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  [+ Add List]                                              │
└────────────────────────────────────────────────────────────┘
```

#### Component Hierarchy

```
App
├── AuthPages
│   ├── LoginPage
│   ├── RegisterPage
│   └── ForgotPasswordPage
├── Dashboard
│   ├── Header
│   ├── BoardsList
│   │   ├── BoardCard
│   │   └── CreateBoardButton
│   └── UserMenu
└── BoardView
    ├── BoardHeader
    │   ├── BoardTitle (editable)
    │   ├── ActiveUsers
    │   ├── InviteButton
    │   └── SettingsButton
    ├── BoardCanvas
    │   ├── List (draggable)
    │   │   ├── ListHeader (editable)
    │   │   ├── CardList
    │   │   │   └── Card (draggable)
    │   │   │       ├── CardTitle
    │   │   │       ├── CardLabels
    │   │   │       ├── CardMembers
    │   │   │       └── CardDueDate
    │   │   └── AddCardButton
    │   └── AddListButton
    └── CardModal (when card clicked)
        ├── CardDetails
        ├── CardDescription (editable)
        ├── CardComments (Phase 2)
        ├── CardAttachments (Phase 2)
        └── CardActions
```

### 7.3 Design System

#### Colors (Tailwind)

```javascript
// Primary palette
primary: {
  50: '#eff6ff',
  500: '#3b82f6',  // Main blue
  700: '#1d4ed8',
}

// Status colors
success: '#10b981',
warning: '#f59e0b',
danger: '#ef4444',
info: '#06b6d4',

// Neutrals (dark mode support)
gray: { ...tailwind grays }
```

#### Typography

- **Headings:** Inter, sans-serif
- **Body:** Inter, sans-serif
- **Code:** JetBrains Mono

#### Spacing

- Use Tailwind's spacing scale (4px base unit)
- Consistent padding: cards (p-4), lists (p-3), modals (p-6)

---

## 8. Development Phases

### 8.1 Phase 1: MVP (Week 1-3)

**Week 1: Setup & Authentication**

- [x] Initialize frontend (Vite + React + TypeScript)
- [x] Initialize backend (Express + TypeScript)
- [x] Set up PostgreSQL database (Supabase)
- [x] Configure Prisma ORM (v7.2.0 with PostgreSQL adapter)
- [x] Set up pnpm monorepo with workspaces
- [x] Create shared packages (types, validation, config, database)
- [ ] Implement user registration
- [ ] Implement login with JWT
- [ ] Create protected routes
- [ ] Basic UI layout with routing

**Week 2: Core Features**

- [ ] Board CRUD operations
- [ ] List CRUD operations
- [ ] Card CRUD operations
- [ ] Drag-and-drop for lists
- [ ] Drag-and-drop for cards
- [ ] Position/ordering logic
- [ ] Board detail view with nested data

**Week 3: Real-Time & Polish**

- [ ] Set up Socket.io (client + server)
- [ ] Implement WebSocket events for all operations
- [ ] Real-time updates across clients
- [ ] Active users indicator
- [ ] Loading states & error handling
- [ ] Responsive design
- [ ] Dark/light theme
- [ ] Deploy to Vercel (frontend) + Render (backend)

### 8.2 Phase 2: Enhanced Collaboration (Week 4-5)

- [ ] Board member invitations
- [ ] Role-based permissions
- [ ] Card assignments
- [ ] Card labels/tags
- [ ] Card due dates
- [ ] File attachments (Cloudinary)
- [ ] Comments on cards
- [ ] Activity timeline
- [ ] Email notifications

### 8.3 Phase 3: Polish & Optimization (Week 6+)

- [ ] Performance optimization
- [ ] E2E testing with Playwright
- [ ] Comprehensive error handling
- [ ] SEO optimization
- [ ] Onboarding tour
- [ ] Keyboard shortcuts
- [ ] Export/import boards
- [ ] Analytics dashboard

---

## 9. Free Deployment Strategy

### 9.1 Hosting Plan

| Service  | Provider   | Free Tier Limits                             | Purpose                |
| -------- | ---------- | -------------------------------------------- | ---------------------- |
| Frontend | Vercel     | Unlimited sites, 100GB bandwidth             | React app hosting      |
| Backend  | Render.com | 750 hours/month, sleeps after 15min inactive | API + WebSocket server |
| Database | Supabase   | 500MB storage, 2GB bandwidth                 | PostgreSQL database    |
| Storage  | Cloudinary | 25GB storage, 25GB bandwidth/month           | File uploads (Phase 2) |
| Email    | Resend     | 3,000 emails/month                           | Transactional emails   |

**Total Monthly Cost: $0**

### 9.2 Limitations & Workarounds

#### Backend Sleep Issue (Render Free Tier)

- **Problem:** Server sleeps after 15 minutes of inactivity, causing 30s cold start
- **Solutions:**
  1. Add loading state: "Waking up server..." message
  2. Use UptimeRobot (free) to ping server every 5 minutes (keeps it alive)
  3. Mention in README: "Demo may take 30s to load on first visit"

#### Database Size (Supabase 500MB)

- **Limit:** Enough for demo (thousands of cards)
- **Workaround:** Add cleanup script to delete old demo data
- **Monitor:** Set up alerts at 80% capacity

#### File Storage

- **Cloudinary 25GB** is generous for demo
- Alternative: Store small files as base64 in DB (not recommended for production)

### 9.3 Deployment Checklist

**Frontend (Vercel)**

- [ ] Connect GitHub repository
- [ ] Set environment variables (API_URL, SOCKET_URL)
- [ ] Configure build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Enable automatic deployments on push

**Backend (Render)**

- [ ] Connect GitHub repository
- [ ] Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Configure start command: `npm run start`
- [ ] Set Node version: 18.x
- [ ] Enable auto-deploy on push

**Database (Supabase)**

- [ ] Create project
- [ ] Copy connection string
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Enable Row Level Security (optional)

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Initial page load: < 3 seconds
- Real-time update latency: < 500ms
- Drag-and-drop response: < 100ms
- API response time: < 200ms (avg)

### 10.2 Security

- Passwords hashed with bcrypt (cost factor: 10)
- JWT tokens with 7-day expiration
- HTTP-only cookies for refresh tokens
- Input validation on all endpoints (Zod schemas)
- SQL injection protection (Prisma ORM)
- XSS protection (React auto-escaping + DOMPurify for rich text)
- CORS configuration (whitelist frontend domain)
- Rate limiting (express-rate-limit): 100 req/15min per IP

### 10.3 Scalability Considerations

- Optimistic updates for better UX
- Debounced auto-save for descriptions
- Paginated activity feeds (Phase 2)
- WebSocket room-based broadcasting (only to board members)
- Database indexing on foreign keys
- N+1 query prevention (Prisma includes)

### 10.4 Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader friendly (ARIA labels)
- Focus indicators
- Color contrast ratio > 4.5:1
- Skip to main content link

### 10.5 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## 11. Testing Strategy

### 11.1 Unit Tests

- **Frontend:** Vitest + React Testing Library
  - Component rendering
  - User interactions
  - State management logic
  - Custom hooks
- **Backend:** Vitest
  - API endpoint logic
  - Authentication middleware
  - Validation schemas
  - Database queries

### 11.2 Integration Tests

- API endpoint testing with Supertest
- Database operations with test database
- WebSocket event handling

### 11.3 E2E Tests

- Playwright for critical user flows:
  - User registration and login
  - Create board, list, and card
  - Drag-and-drop operations
  - Real-time updates (multi-tab testing)

### 11.4 Manual Testing

- Cross-browser testing
- Mobile responsiveness
- Real-time collaboration (multiple users)
- Edge cases (slow network, server disconnect)

---

## 12. Documentation Requirements

### 12.1 README.md

```markdown
# HelloCollab - Real-Time Collaborative Task Manager

## Live Demo

🔗 [https://hellocollab.vercel.app](URL)

## Features

- ✅ Real-time collaboration
- ✅ Drag-and-drop interface
- ✅ Board, List, Card management
- ✅ User authentication

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Socket.io
**Backend:** Node.js, Express, Prisma, PostgreSQL
**Deployment:** Vercel + Render + Supabase (100% free)

## Screenshots

[Include 3-4 screenshots]

## Local Development

[Setup instructions]

## Architecture

[Diagram or explanation]

## What I Learned

[Key takeaways and challenges]

## Future Improvements

[Roadmap]
```

### 12.2 API Documentation

- Auto-generated Swagger/OpenAPI docs
- Endpoint descriptions
- Request/response examples
- Authentication requirements

### 12.3 Code Documentation

- JSDoc comments for complex functions
- Inline comments for business logic
- Component prop descriptions (TypeScript interfaces)

---

## 13. Success Metrics

### 13.1 Technical Metrics

- [ ] 90%+ test coverage (critical paths)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] Zero critical security vulnerabilities (npm audit)
- [ ] < 500ms average API response time
- [ ] WebSocket connection uptime > 99%

### 13.2 Demo Metrics (for recruiters)

- [ ] Clean, intuitive UI
- [ ] Working real-time updates (testable with multiple tabs)
- [ ] Mobile-responsive
- [ ] Fast loading (despite free tier limitations)
- [ ] Comprehensive README with architecture diagram
- [ ] Clean, well-organized code on GitHub

---

## 14. Risk Assessment

| Risk                        | Impact | Probability | Mitigation                                    |
| --------------------------- | ------ | ----------- | --------------------------------------------- |
| Render free tier sleeps     | High   | High        | UptimeRobot pinging + loading message         |
| Database size limit         | Medium | Low         | Cleanup scripts + monitoring                  |
| WebSocket connection issues | High   | Medium      | Reconnection logic + fallback to polling      |
| Drag-and-drop bugs          | Medium | Medium      | Extensive testing + use battle-tested library |
| CORS issues in production   | High   | Low         | Proper CORS configuration from start          |
| JWT token theft             | High   | Low         | HTTP-only cookies + short expiration          |

---

## 15. Next Steps

### Immediate Actions (Before Coding)

1. [x] Review and approve these specifications
2. [x] Set up GitHub repository
3. [x] Create project board (GitHub Projects)
4. [x] Design mockups (Figma or sketch)
5. [x] Choose final name and branding (HelloCollab)

### First Code Commit

1. [x] Initialize monorepo with pnpm workspaces
2. [x] Set up linting and formatting (ESLint, Prettier)
3. [x] Configure TypeScript strict mode
4. [x] Create basic folder structure (apps/, packages/)
5. [x] Set up development environment
6. [x] Configure Supabase database
7. [x] Set up Prisma 7.2.0 with PostgreSQL adapter

---

## 16. Resources & References

### Documentation

- [Socket.io Docs](https://socket.io/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [React Query Docs](https://tanstack.com/query/latest)

### Similar Projects (for inspiration)

- Trello
- Notion boards
- Linear
- Monday.com

### Design Inspiration

- [Dribbble - Project Management](https://dribbble.com/search/project-management)
- [Mobbin - Task Management](https://mobbin.com/)

---

**Document Version:** 1.1
**Last Updated:** 2026-01-02
**Status:** ✅ Infrastructure Complete - Active Development
