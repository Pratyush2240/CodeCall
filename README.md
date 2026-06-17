# CodeCall — Real-Time Collaborative Development & Coding Platform

<div align="center">

**A high-performance, real-time collaborative workspace for technical interviews, remote pair programming, and collaborative engineering.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🚀 Key Features

### Collaborative Development
- **Monaco Code Editor** — Multi-user synchronized code editing powered by Socket.IO with real-time cursor tracking, active presence indicators, and collaborative highlights. Built on the same editor engine behind VS Code.
- **Sandboxed Code Execution** — Secure remote execution for **JavaScript (Node.js)**, **Python**, **Java**, and **C++**. Payloads are proxied to an isolated **Judge0 CE** sandbox, preventing RCE vulnerabilities on the host server.
- **Interactive DSA Canvas** — Real-time synced whiteboard with a built-in Data Structure & Algorithm visualizer. Generate, manipulate, and animate live representations of **Arrays**, **Singly Linked Lists**, **Binary Search Trees (BST)**, and **Graphs**.

### Communication
- **P2P Video & Audio Calling** — Direct peer-to-peer streaming inside room sessions using **WebRTC**, with Socket.IO handling signaling to minimize server load.
- **Real-Time Live Chat** — Scoped, low-latency text messaging overlay for participants inside active rooms.
- **Room Invitation System** — Invite users to join rooms with time-bound invitations (24-hour expiry), accept/decline workflows, and sender/receiver tracking.

### Workspace Management
- **Project Spaces** — Organize multiple rooms under scoped project workspaces with tag-based categorization. Project rooms enforce automatic naming conventions (`[Project Name] - Room [CODE]`) with locked prefixes during renaming.
- **Inline Rename & Actions** — Rename projects and rooms inline with Enter-to-confirm/Escape-to-cancel UX patterns. Three-dot dropdown menus provide contextual actions (rename, delete) on all cards.
- **Dashboard Overview** — Unified view of recent rooms, active projects, and pending invitations.

### Authentication & Security
- **JWT Authentication with Token Rotation** — Stateless authorization using short-lived Access Tokens (15m) and database-backed Refresh Tokens (7d) with automatic rotation to mitigate replay attacks.
- **Federated OAuth** — One-click login via **Google** and **GitHub** OAuth 2.0 with automatic account linking and profile completion flows.
- **Password Reset Flow** — Secure email-based password recovery with tokenized reset links and expiry enforcement.
- **Production-Grade Hardening** — Helmet HTTP headers, CORS origin whitelisting, request body size limits (10KB), `express-rate-limit` + `express-slow-down` for brute-force protection.

### Observability
- **Prometheus Metrics** — HTTP request duration histograms and default Node.js runtime metrics exposed via `prom-client` at `/metrics`.
- **Sentry Error Tracking** — Automatic error capture and distributed tracing via `@sentry/node`.
- **Structured Logging** — Winston-based structured logging for server errors, HTTP requests, and socket events.
- **Swagger API Docs** — Auto-generated interactive API documentation available at `/api/docs`.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | Component-based SPA framework |
| **Vite 7** | Lightning-fast bundler and dev server |
| **React Router v7** | Client-side routing with authenticated guards |
| **Monaco Editor** | VS Code-grade browser code editor |
| **Socket.IO Client** | Bidirectional real-time communication |
| **Axios** | HTTP client with JWT interceptors |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | Modular REST API server |
| **Socket.IO** | WebSocket server with namespaced event handlers |
| **Prisma ORM** | Type-safe query builder, migrations, and schema design |
| **PostgreSQL** | Primary relational database |
| **Redis + IORedis** | In-memory caching for rate limiting and job queues |
| **BullMQ** | Redis-backed distributed task queue |
| **Passport.js** | Strategy-based auth (local, GitHub OAuth, Google OAuth) |
| **Zod** | Runtime schema validation for all API inputs |
| **Winston** | Structured logging with transport support |
| **prom-client** | Prometheus-compatible metrics collection |
| **@sentry/node** | Error tracking and distributed tracing |
| **Swagger (jsdoc + UI)** | Auto-generated API documentation |
| **Helmet** | HTTP security header enforcement |
| **Nodemailer** | Transactional email delivery (SMTP) |

---

## 📂 Project Structure

```
CodeCall/
├── README.md
├── ARCHITECTURE.md
├── .gitignore
│
├── backend/
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma           # Database models & relations
│   └── src/
│       ├── server.js               # HTTP server bootstrap + Socket.IO mount
│       ├── app.js                  # Express middleware pipeline & route mounting
│       ├── config/
│       │   ├── env.js              # Environment loader
│       │   ├── env.validation.js   # Zod-based env schema validation
│       │   ├── prisma.js           # Prisma client singleton
│       │   ├── redis.js            # Redis/IORedis client configuration
│       │   ├── passport.js         # Passport strategy registration
│       │   ├── swagger.js          # Swagger/OpenAPI configuration
│       │   ├── sentry.js           # Sentry error tracking initialization
│       │   └── metrics.js          # Prometheus metrics registry
│       ├── constants/
│       │   └── errorCodes.js       # Centralized application error codes
│       ├── middlewares/
│       │   ├── auth.middleware.js   # Passport JWT extraction
│       │   ├── requireAuth.js      # Route-level authentication guard
│       │   ├── requireRole.js      # Role-based access control (RBAC)
│       │   ├── validate.middleware.js   # Zod schema validation middleware
│       │   ├── rateLimiter.js      # express-rate-limit + express-slow-down
│       │   ├── cache.middleware.js  # Redis-backed response caching
│       │   ├── correlation.middleware.js # Request correlation ID injection
│       │   ├── metrics.middleware.js     # Prometheus HTTP duration tracking
│       │   ├── requestLogger.middleware.js # Winston HTTP request logging
│       │   └── error.middleware.js  # Global error handler
│       ├── modules/
│       │   ├── auth/               # Login, signup, OAuth, token refresh
│       │   ├── user/               # Profile management, settings, avatar
│       │   ├── project/            # CRUD operations, membership, tags
│       │   ├── room/               # Room lifecycle, participants, renaming
│       │   ├── invitation/         # Room invite send/accept/decline/expire
│       │   ├── execution/          # Judge0 code execution proxy
│       │   ├── friend/             # Friend request/accept/block system
│       │   ├── session/            # Legacy 1-on-1 session management
│       │   ├── health/             # Health check endpoint
│       │   └── metrics/            # Prometheus metrics endpoint
│       ├── sockets/
│       │   ├── index.js            # Socket.IO server setup & namespace routing
│       │   ├── code.socket.js      # Collaborative code sync events
│       │   ├── cursor.socket.js    # Remote cursor position broadcasting
│       │   ├── chat.socket.js      # In-room live chat messaging
│       │   ├── whiteboard.socket.js # Canvas drawing coordinate sync
│       │   ├── presence.socket.js  # User presence & activity tracking
│       │   ├── webrtc.socket.js    # WebRTC signaling (offer/answer/ICE)
│       │   └── execution.socket.js # Code execution result broadcasting
│       ├── queues/
│       │   └── job.queue.js        # BullMQ queue definitions
│       ├── workers/
│       │   └── job.workers.js      # Async background job processors
│       └── utils/
│           ├── jwt.js              # Token generation & verification
│           ├── hash.js             # bcrypt password hashing
│           ├── mailer.js           # Nodemailer email transport
│           ├── logger.js           # Winston logger instance
│           ├── response.js         # Standardized API response helpers
│           ├── appError.js         # Custom AppError class
│           └── catchAsync.js       # Express async error wrapper
│
├── frontend/
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   └── src/
│       ├── main.jsx                # React DOM render entry point
│       ├── App.jsx                 # Router, context providers, route definitions
│       ├── index.css               # Global CSS design tokens & resets
│       ├── api/
│       │   ├── axios.js            # Axios instance with JWT interceptors
│       │   ├── rooms.js            # Room API endpoints
│       │   ├── projects.js         # Project API endpoints
│       │   ├── invitations.js      # Invitation API endpoints
│       │   ├── execution.js        # Code execution API endpoints
│       │   └── users.js            # User profile API endpoints
│       ├── context/
│       │   └── UserContext.jsx     # Global auth state & user provider
│       ├── socket/
│       │   └── socket.js          # Socket.IO client singleton
│       ├── hooks/
│       │   ├── useWebRTC.js        # WebRTC P2P media connection lifecycle
│       │   ├── useCollaborativeCode.js  # Monaco editor change synchronization
│       │   ├── useCursors.js       # Remote cursor position rendering
│       │   ├── useWhiteboard.js    # Canvas drawing coordinate transmission
│       │   ├── useDSABoard.js      # DSA visualizer state synchronization
│       │   ├── useChat.js          # In-room live chat state management
│       │   ├── usePresence.js      # User online/away presence tracking
│       │   ├── useCodeExecution.js  # Code execution submission & results
│       │   └── useSocket.js        # Socket connection management hook
│       ├── components/
│       │   ├── Navbar.jsx / .css           # Top navigation bar
│       │   ├── Sidebar.jsx / .css          # Collapsible sidebar navigation
│       │   ├── ProjectCard.jsx / .css      # Project card with dropdown actions
│       │   ├── RoomCard.jsx / .css         # Room card with prefix-locked rename
│       │   ├── InvitationCard.jsx / .css   # Invitation accept/decline card
│       │   ├── CodeEditor.jsx / .css       # Monaco editor wrapper component
│       │   ├── DSACanvas.jsx / .css        # DSA visualizer canvas component
│       │   ├── ConfirmModal.jsx / .css     # Reusable confirmation dialog
│       │   ├── CreateProjectModal.jsx / .css # Project creation modal
│       │   ├── InviteModal.jsx / .css      # User invitation modal
│       │   ├── ProtectedRoute.jsx          # Auth-guarded route wrapper
│       │   ├── AuthCard.jsx                # OAuth login card component
│       │   ├── InputField.jsx              # Styled form input component
│       │   └── Button.jsx                  # Styled button component
│       └── pages/
│           ├── Login.jsx / .css            # Login with local + OAuth
│           ├── Signup.jsx / .css           # Registration with validation
│           ├── ForgotPassword.jsx          # Password reset request
│           ├── ResetPassword.jsx           # Token-based password reset
│           ├── CompleteProfile.jsx / .css   # OAuth post-signup profile setup
│           ├── OAuthCallback.jsx           # OAuth redirect handler
│           ├── Dashboard.jsx / .css        # Main dashboard overview
│           ├── Projects.jsx / .css         # Project listing & management
│           ├── ProjectDetail.jsx / .css    # Single project room listing
│           ├── Rooms.jsx                   # All rooms listing
│           ├── RoomSession.jsx / .css      # Active room workspace (editor, canvas, video, chat)
│           ├── Settings.jsx / .css         # User settings & account management
│           ├── ApiDocs.jsx                 # Interactive API documentation viewer
│           ├── Help.jsx                    # Help & support page
│           ├── Privacy.jsx                 # Privacy policy
│           ├── Terms.jsx                   # Terms of service
│           ├── Security.jsx               # Security information
│           └── StaticDoc.css               # Shared styling for static pages
```

---

## ⚙️ Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** database instance
- **Redis** server (for rate limiting, caching, and job queues)

### 1. Clone & Setup Backend

```bash
cd backend

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL, REDIS_URL, JWT secrets (min 32 chars), etc.

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the API server
npm run dev          # → http://localhost:5000

# (Optional) Start background workers in a separate terminal
npm run worker
```

### 2. Setup Frontend

```bash
cd frontend

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set VITE_API_URL (default: http://localhost:5000/api)

# Install dependencies
npm install

# Start the development server
npm run dev          # → http://localhost:5173
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Express server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Access token signing key (min 32 chars) | — |
| `JWT_REFRESH_SECRET` | Refresh token signing key (min 32 chars) | — |
| `JWT_ACCESS_EXPIRES` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token lifespan | `7d` |
| `REFRESH_TOKEN_EXPIRY_MS` | Refresh token lifetime in ms | `604800000` |
| `CLIENT_URL` | Frontend origin URL (CORS) | — |
| `JUDGE0_API_URL` | Code execution sandbox endpoint | `https://ce.judge0.com` |
| `SMTP_USER` | Outbound email address | — |
| `SMTP_PASS` | Outbound email app password | — |
| `SENTRY_DSN` | Sentry error tracking DSN | — |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | — |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | — |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend REST API base URL | `http://localhost:5000/api` |

---

## 📖 API Documentation

Interactive REST API documentation is auto-generated via **Swagger UI**.

Start the backend server and navigate to:
```
http://localhost:5000/api/docs
```

---

## 🏗️ Architecture

For a detailed breakdown of the system architecture, database ERD, real-time communication protocols, and security model, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
