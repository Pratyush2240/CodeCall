# CodeCall – Backend

Backend service for **CodeCall**, a real-time collaborative platform that enables friends to practice technical interviews together with live coding, whiteboard collaboration, and audio/video communication.

This repository currently implements **Phase 1 (Backend Foundations)** and **Phase 2 (Realtime Collaboration)**.

---

## 📌 Project Overview

CodeCall is designed as a **session-based collaborative interview platform** where users can:

- Authenticate securely
- Connect with friends
- Create and join practice sessions
- Collaborate in real time using:
  - Live code editor
  - Shared whiteboard
  - Audio/video (WebRTC signaling)
- Execute code securely on the backend

The backend follows a **clean separation of concerns** between REST APIs, realtime communication, and execution logic.

---

## 🧩 Phase Breakdown

### ✅ Phase 1 — Backend Foundations
Focus: **Core backend architecture and correctness**

- JWT-based authentication
- User & friend management
- Practice session lifecycle
- Database schema & migrations
- Clean REST API design

---

### ✅ Phase 2 — Realtime Collaboration
Focus: **Live, multi-user collaboration**

- Socket.IO based realtime layer
- Session-scoped presence
- Live collaborative code editing
- Secure backend code execution
- Shared whiteboard sync
- WebRTC signaling for audio/video

---

## 🚀 Features Implemented

### 🔐 Authentication
- User registration & login
- Password hashing with `bcrypt`
- JWT access tokens
- Protected REST routes
- JWT-authenticated socket connections

---

### 👥 Friend System
- Send & accept friend requests
- Prevent duplicate or invalid requests
- List accepted friends
- Authorization enforced at every step

---

### 🧩 Practice Sessions
- Create a practice session (host)
- Join a session (guest)
- Role-based rules:
  - Host cannot join as guest
  - Only host can end a session
- Session lifecycle states:
  - `WAITING`
  - `ACTIVE`
  - `ENDED`

---

### ⚡ Realtime Presence (Socket.IO)
- JWT-secured socket connections
- Session-based rooms
- User join/leave signaling
- REST + realtime separation

---

### 💻 Live Code Collaboration
- Realtime code sync across session participants
- Session-scoped broadcasting
- Late-join synchronization support

---

### 🧪 Code Execution Sandbox
- Secure JavaScript execution on backend
- Timeouts to prevent infinite loops
- Output capture (stdout / stderr)
- Stateless execution
- Auth-protected execution endpoint

---

### 🖊️ Whiteboard Sync
- Realtime drawing stroke synchronization
- Clear-board events
- Session-isolated whiteboards

---

### 🎥 WebRTC Signaling
- SDP offer / answer relay
- ICE candidate relay
- Peer leave signaling
- Backend acts as signaling server only (no media handling)

---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **Socket.IO**
- **JWT (jsonwebtoken)**
- **bcrypt**
- **WebRTC (signaling only)**
- **Nodemon**

---

## 📁 Project Structure

```

backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/          # Environment & Prisma config
│   ├── controllers/     # REST controllers
│   ├── services/        # Business logic
│   ├── routes/          # REST routes
│   ├── middlewares/     # Auth & error handling
│   ├── sockets/         # Realtime (Socket.IO)
│   │   ├── index.js
│   │   ├── code.socket.js
│   │   ├── whiteboard.socket.js
│   │   └── webrtc.socket.js
│   ├── utils/           # Helpers & response utils
│   ├── app.js           # Express app
│   └── server.js        # HTTP + Socket.IO bootstrap
├── .env.example
├── .gitignore
└── package.json

````

---

## ⚙️ Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/codecall
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
````

---

## 🧪 Running Locally

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Run database migrations

```bash
npx prisma migrate dev
```

### 3️⃣ Generate Prisma client

```bash
npx prisma generate
```

### 4️⃣ Start development server

```bash
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## 🔍 API Endpoints (Key)

### Authentication

* `POST /auth/register`
* `POST /auth/login`

### Friends

* `POST /friends/request`
* `POST /friends/accept/:id`
* `GET /friends`

### Practice Sessions

* `POST /sessions`
* `POST /sessions/join/:id`
* `POST /sessions/end/:id`

### Code Execution

* `POST /execute/run` (JWT protected)

---

## 🔐 Authentication Note

All protected routes and realtime socket connections require:

```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## 🧠 Architecture Highlights

* Clear separation between:

  * REST APIs
  * Realtime Socket.IO layer
  * Execution sandbox
* Session IDs created via REST, reused across realtime features
* Backend acts only as:

  * API provider
  * Signaling server
  * Execution sandbox
* No media processing or rendering on backend

---

## 🔜 Roadmap (Phase 3+)

* Frontend integration (React + Monaco + Canvas)
* Persistent session artifacts
* AI-powered post-session feedback
* Production hardening (Docker, Redis, TURN servers)
* Scaling WebSocket infrastructure

---

## 📄 License

MIT License

```

---


```
