# CodeCall

Real-time collaborative coding platform with integrated IDE, whiteboard, video calling, and project management.

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **Vite** | Build tool and dev server |
| **React Router v7** | Client-side routing |
| **Monaco Editor** | VS Code-powered code editor with syntax highlighting, IntelliSense |
| **Socket.IO Client** | Real-time bidirectional communication |
| **Axios** | HTTP client for REST API calls |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **Socket.IO** | WebSocket server for real-time collaboration |
| **PostgreSQL** | Primary relational database |
| **Prisma ORM** | Type-safe database access, migrations, schema management |
| **JWT** | Stateless authentication (access + refresh tokens) |
| **bcrypt** | Password hashing |
| **Zod** | Runtime request validation |
| **Helmet** | Security HTTP headers |
| **express-rate-limit** | API rate limiting and brute-force protection |
| **Winston** | Structured logging |
| **Swagger** | Auto-generated API documentation |
| **Axios** | Server-side HTTP client (Judge0 API proxy) |
| **prom-client** | Prometheus metrics |
| **BullMQ + Redis** | Background job processing |

### External Services

| Service | Purpose |
|---|---|
| **Judge0 CE** | Remote code execution engine (JS, Python, Java, C++) |
| **WebRTC** | Peer-to-peer video/audio calling |

## Features

- **Collaborative Code Editor** — Real-time synchronized editing via Monaco + Socket.IO
- **Code Execution** — Run code in 4 languages with shared terminal output
- **Whiteboard** — Freehand drawing canvas synced across participants
- **DSA Board** — Interactive data structure visualization (arrays, linked lists, trees, graphs)
- **Video/Audio Calling** — WebRTC-based peer-to-peer communication
- **Live Chat** — In-room text messaging
- **Project Management** — Create projects, organize rooms under projects, track activity
- **Room System** — Create/join rooms by invite code, persistent room history
- **Authentication** — JWT-based with refresh token rotation

## Project Structure

```
CodeCall/
├── backend/
│   ├── prisma/              # Schema & migrations
│   └── src/
│       ├── config/          # DB, env, swagger config
│       ├── middlewares/     # Auth, rate-limit, logging, error handling
│       ├── modules/         # Feature modules (auth, room, project, execution, etc.)
│       ├── sockets/         # Socket.IO event handlers
│       ├── utils/           # JWT, AppError, helpers
│       ├── app.js           # Express app setup
│       └── server.js        # HTTP + Socket.IO server entry
├── frontend/
│   └── src/
│       ├── api/             # Axios API clients
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks (chat, code, whiteboard, WebRTC)
│       ├── pages/           # Route-level pages
│       ├── socket/          # Socket.IO client instance
│       └── App.jsx          # Router setup
```

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env        # Configure DATABASE_URL, JWT secrets
npm install
npx prisma migrate dev
npm run dev                  # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### Environment Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/codecall
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
JUDGE0_API_URL=https://ce.judge0.com
```

## API Endpoints

| Module | Routes | Auth |
|---|---|---|
| Auth | `POST /api/auth/register`, `/login`, `/refresh`, `/logout` | No |
| Rooms | `GET/POST /api/rooms`, `POST /join`, `PATCH /:id/end` | Yes |
| Projects | `GET/POST /api/projects`, `PATCH/DELETE /:id` | Yes |
| Execution | `POST /api/execute` | Yes |
| Users | `GET /api/user/me` | Yes |
| Health | `GET /api/health`, `/api/metrics` | No |

Full API docs available at `/api/docs` (Swagger UI).

## License

MIT
