# CodeCall — Real-Time Collaborative Development & Coding Platform

CodeCall is a high-performance, real-time collaborative development workspace designed for technical interviews, remote pair programming, and collaborative engineering. The platform unites a shared VS Code-powered editor, real-time interactive whiteboard, synchronized data structure visualizer, peer-to-peer WebRTC video/audio calls, and scoped project/room management.

---

## 🚀 Key Features

*   **Collaborative Monaco Editor** — Multi-user synchronized code editing with real-time cursor tracking, active presence cues, and code highlights, powered by Socket.IO.
*   **Sandboxed Code Execution** — Secure remote code execution for JavaScript (Node.js), Python, Java, and C++. Execution payloads are proxied to an isolated **Judge0 CE** sandbox environment, preventing RCE vulnerabilities on the host server.
*   **Interactive DSA Canvas** — Real-time synced whiteboard canvas featuring a built-in Data Structure and Algorithm (DSA) visualizer. Users can generate, manipulate, and animate live representations of Arrays, Singly Linked Lists, Binary Search Trees (BST), and Graphs.
*   **P2P Video & Audio Calling** — Direct peer-to-peer video/audio overlay inside room sessions using WebRTC, utilizing WebSockets for signaling to minimize server load.
*   **Real-Time Live Chat** — Scoped, low-latency text messaging overlay for participants inside active rooms.
*   **Collaborative Project Spaces** — Organise multiple rooms under scoped project workspaces. Project workspaces feature automatic room naming constraints (e.g. `[Project Name] - Room [CODE]`) and lock in project prefixes to maintain clean workspaces.
*   **Robust JWT Authentication & OAuth** — Stateless authorization using short-lived Access Tokens (15m) and database-backed Refresh Tokens (7d) with automatic rotation. Supports Google and GitHub Federated OAuth logins.
*   **Production-Grade Security** — Implements Helmet HTTP header protections, CORS origin controls, request size limit bounds (10KB to block buffer overflows), and express-rate-limit + express-slow-down to prevent brute-force attacks.

---

## 🛠️ Technology Stack

### Frontend
*   **React 19** — Single-page application UI structure.
*   **Vite** — Optimized frontend bundler and dev server.
*   **React Router v7** — Scoped client-side routing.
*   **Monaco Editor** — The browser-based editor engine behind VS Code.
*   **Socket.IO Client** — WebSocket wrapper for real-time bidirectional communication.
*   **Axios** — HTTP client with interceptors for automatic JWT header injection.

### Backend
*   **Node.js + Express** — Modular REST API backend server.
*   **Socket.IO** — WebSocket server engine with modular namespace handlers.
*   **Prisma ORM** — Type-safe client query builder, migration manager, and schema design.
*   **PostgreSQL** — Primary relational database.
*   **Redis** — In-memory caching layer for rate limiting and background queues.
*   **BullMQ** — Redis-backed distributed task queue for asynchronous background jobs.
*   **Passport.js** — Modular strategy manager for local credentials and GitHub/Google OAuth.
*   **Zod** — Strict runtime schema validation for requests and environment configurations.
*   **Winston** — Structured logs tracking server errors, requests, and socket events.

---

## 📂 Project Structure

```
CodeCall/
├── backend/
│   ├── prisma/             # Database schema configuration & migration logs
│   ├── src/
│   │   ├── config/         # Database client, env, swagger, and sentry configs
│   │   ├── constants/      # Global constants and custom error codes
│   │   ├── middlewares/    # Authentication, rate limiting, and global error handlers
│   │   ├── modules/        # Domain-driven features (auth, room, project, execution)
│   │   ├── sockets/        # Real-time WebSocket event namespace controllers
│   │   ├── utils/          # Token utilities, logging, response helpers, and mailers
│   │   ├── workers/        # Asynchronous BullMQ background worker controllers
│   │   ├── app.js          # Express middleware and routing configuration
│   │   └── server.js       # HTTP server bootstrap and Socket.IO mount
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios endpoint definitions and interceptors
│   │   ├── assets/         # Stylesheets and visual assets
│   │   ├── components/     # Reusable UI elements (cards, modals, inputs)
│   │   ├── context/        # React Context states (auth, sockets)
│   │   ├── hooks/          # Custom hooks (WebRTC, chat, canvas, Monaco sync)
│   │   ├── pages/          # Route-level views (Dashboard, Workspace, RoomSession)
│   │   ├── routes/         # Authenticated route guards
│   │   ├── socket/         # Socket client initialization singleton
│   │   └── App.jsx         # App router and global context injection
```

---

## ⚙️ Quick Start Setup

### Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL Database
*   Redis Server (for rate-limiting/workers)

### 1. Setup Backend Server
```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Open .env and populate DATABASE_URL, Redis, and JWT secrets (min 32 chars)
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev # Launches API server at http://localhost:5000
```

### 2. Setup Frontend Application
```bash
# Navigate to frontend directory
cd ../frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start development build server
npm run dev # Launches local Vite client at http://localhost:5173
```

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)
*   `NODE_ENV` — Application environment (`development`, `production`, `test`).
*   `PORT` — Port for the backend Express server (default: `5000`).
*   `DATABASE_URL` — PostgreSQL connection string.
*   `REDIS_URL` — Redis host connection string (default: `redis://localhost:6379`).
*   `JWT_ACCESS_SECRET` — Cryptographic secret key for access tokens (min 32 characters).
*   `JWT_REFRESH_SECRET` — Cryptographic secret key for refresh tokens (min 32 characters).
*   `JWT_ACCESS_EXPIRES` — Access token lifespan format (e.g., `15m`).
*   `JWT_REFRESH_EXPIRES` — Refresh token lifespan format (e.g., `7d`).
*   `REFRESH_TOKEN_EXPIRY_MS` — Refresh token lifetime in milliseconds (e.g., `604800000`).
*   `CLIENT_URL` — The URL of the frontend (for CORS configuration).
*   `JUDGE0_API_URL` — Host endpoint for code execution sandbox (default: `https://ce.judge0.com`).
*   `SMTP_USER` — Outbound transaction email address.
*   `SMTP_PASS` — Outbound transaction app password.
*   `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — Optional client keys for GitHub OAuth.
*   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Optional client keys for Google OAuth.

### Frontend (`frontend/.env`)
*   `VITE_API_URL` — Backend REST API base URL (default: `http://localhost:5000/api`).

---

## 📖 API & Documentation
Full REST API endpoints and payload schemas are documented and interactive via **Swagger UI**.
Start the backend server and navigate to:
```
http://localhost:5000/api/docs
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
