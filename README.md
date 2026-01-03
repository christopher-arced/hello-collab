# HelloCollab - Real-Time Collaborative Task Management

A real-time collaborative task management application similar to Trello, built with modern web technologies. Teams can organize work into boards, lists, and cards with instant updates across all connected clients.

## 🚀 Features

### MVP (Phase 1)
- ✅ User authentication (JWT)
- ✅ Board, List, and Card management
- ✅ Real-time collaboration via WebSocket
- ✅ Drag-and-drop interface
- ✅ Dark/light theme
- ✅ Responsive design

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
- **ORM:** Prisma
- **Database:** PostgreSQL
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

Backend (.env):
```bash
cd apps/api
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. **Set up the database**
```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
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
pnpm prisma:migrate   # Run database migrations
pnpm prisma:studio    # Open Prisma Studio
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts with authentication
- **Boards**: Top-level containers for organizing work
- **Lists**: Vertical columns within boards
- **Cards**: Individual task items within lists
- **BoardMembers**: User permissions for boards (Phase 2)

See `packages/database/prisma/schema.prisma` for the complete schema.

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

### Database (Supabase/Neon)
1. Create a PostgreSQL database
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `pnpm prisma:migrate`

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

**Note:** This project is currently in active development. See `SPECS.md` for the complete technical specifications and roadmap.
