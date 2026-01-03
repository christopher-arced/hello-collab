# HelloCollab - Real-Time Collaborative Task Management

A real-time collaborative task management application similar to Trello, built with modern web technologies. Teams can organize work into boards, lists, and cards with instant updates across all connected clients.

> **📍 Current Status:** Infrastructure complete! Database configured, monorepo set up, ready for feature development.

## 🚀 Features

### ✅ Completed Setup
- ✅ Monorepo architecture with pnpm workspaces
- ✅ TypeScript strict mode configuration
- ✅ Database schema designed and deployed (Supabase)
- ✅ Shared type system across frontend and backend
- ✅ Development environment ready

### 🚧 In Progress (Phase 1 - MVP)
- ⏳ User authentication (JWT)
- ⏳ Board, List, and Card management
- ⏳ Real-time collaboration via WebSocket
- ⏳ Drag-and-drop interface
- ⏳ Dark/light theme
- ⏳ Responsive design

### Coming Soon (Phase 2)
- Team collaboration with role-based permissions
- Card assignments and labels
- File attachments
- Comments and mentions
- Activity timeline
- Email notifications

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Real-time:** Socket.io Client
- **Routing:** React Router v6
- **Drag & Drop:** @dnd-kit
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js
- **Real-time:** Socket.io
- **ORM:** Prisma 7.2.0 (with PostgreSQL adapter)
- **Database:** PostgreSQL (Supabase - ✅ Configured)
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Deployment:** Render.com

### Monorepo
- **Package Manager:** pnpm
- **Workspace Structure:**
  - `apps/web` - Frontend application
  - `apps/api` - Backend API
  - `packages/types` - Shared TypeScript types
  - `packages/validation` - Shared Zod schemas
  - `packages/database` - Prisma schema and client
  - `packages/config` - Shared configuration

## 📦 Project Structure

```
hello/
├── apps/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/              # Express backend
│       ├── src/
│       ├── .env.example
│       └── package.json
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── validation/       # Zod validation schemas
│   ├── database/         # Prisma schema & client
│   └── config/           # Shared constants
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspace config
├── tsconfig.base.json    # Base TypeScript config
├── .eslintrc.cjs         # ESLint config
├── .prettierrc           # Prettier config
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database (local or hosted)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hello
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in `apps/api/`:
```bash
cd apps/api
# Create .env file with your Supabase connection string
```

Example `.env`:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
```

Also copy the `.env` to the database package:
```bash
cp apps/api/.env packages/database/.env
```

4. **Set up the database**
```bash
# Generate Prisma client
pnpm prisma:generate

# Push schema to database (Prisma 7)
cd packages/database
pnpm prisma db push --url "$(grep '^DATABASE_URL=' .env | cut -d'=' -f2- | sed 's/^"//;s/"$//')"
cd ../..
```

5. **Start development servers**
```bash
# From root directory - runs both frontend and backend
pnpm dev

# Or run them separately:
pnpm dev:web   # Frontend on http://localhost:5173
pnpm dev:api   # Backend on http://localhost:3000
```

### Available Scripts

```bash
# Development
pnpm dev              # Run both frontend and backend
pnpm dev:web          # Run frontend only
pnpm dev:api          # Run backend only

# Building
pnpm build            # Build all apps
pnpm build:web        # Build frontend
pnpm build:api        # Build backend

# Code Quality
pnpm lint             # Lint all workspaces
pnpm format           # Format code with Prettier
pnpm type-check       # Type check all workspaces

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open Prisma Studio

# For schema changes (Prisma 7):
cd packages/database
pnpm prisma db push --url "$(grep '^DATABASE_URL=' .env | cut -d'=' -f2- | sed 's/^"//;s/"$//')"
```

## 🗄️ Database Schema

**Status:** ✅ Configured with Supabase PostgreSQL

The application uses PostgreSQL with the following main entities (5 tables created):

- **users**: User accounts with authentication
- **boards**: Top-level containers for organizing work
- **lists**: Vertical columns within boards
- **cards**: Individual task items within lists
- **board_members**: User permissions for boards (Phase 2)

See `packages/database/prisma/schema.prisma` for the complete schema.

**Prisma 7.2.0 Configuration:**
- Runtime: PostgreSQL adapter (`@prisma/adapter-pg`)
- CLI: Database URL via `--url` flag
- Connection pooling: `pg` driver

## 🔒 Environment Variables

### Backend (`apps/api/.env`)
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://user:password@localhost:5432/hellocollab"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## 🎨 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting
- Follow the existing code structure

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## 📚 API Documentation

API endpoints are organized as follows:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Boards
- `GET /api/boards` - Get all user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PATCH /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists & Cards
See the full API documentation in `SPECS.md` section 6.

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## 🚢 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `pnpm build:web`
3. Set output directory: `apps/web/dist`
4. Deploy

### Backend (Render.com)
1. Connect GitHub repository to Render
2. Set build command: `pnpm install && pnpm build:api`
3. Set start command: `node apps/api/dist/index.js`
4. Add environment variables
5. Deploy

### Database (Supabase)
✅ **Already configured!**

For new environments:
1. Create a Supabase PostgreSQL database
2. Copy connection string to `DATABASE_URL` in `.env` files
3. Push schema: `cd packages/database && pnpm prisma db push --url "..."`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Trello, Notion, and Linear
- Built with modern open-source technologies
- Designed for portfolio and learning purposes

---

## 📋 Project Status

**Infrastructure:** ✅ Complete
**Database:** ✅ Configured (Supabase PostgreSQL)
**Next:** Implementing authentication and core features

See `SPECS.md` for the complete technical specifications and detailed roadmap.
