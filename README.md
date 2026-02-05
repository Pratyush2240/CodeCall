# CodeCall – Backend

CodeCall is a real-time collaborative interview practice platform that enables friends to practice technical interviews together with **secure authentication**, **live coding**, **shared sessions**, and **AI-powered feedback** (upcoming).

This repository contains the **backend service**, built with a clean, scalable, production-ready architecture.

---

## 🚀 Tech Stack

- **Node.js** (ES Modules)
- **Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **JWT (Access & Refresh Tokens)**
- **bcrypt**
- **Nodemon**
- **Socket.IO** (planned – Phase 4)

---

## 📂 Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   │   ├── prisma.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── services/
│   │   └── auth.service.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── test.routes.js
│   │   ├── friend.routes.js
│   │   ├── session.routes.js
│   │   └── codeExecution.routes.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/
│   │   └── jwt.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
````

---

## ✅ Features Implemented (Phase 3)

### 🔐 Authentication & Authorization

* User registration with required fields (`name`, `email`, `password`)
* Secure password hashing using **bcrypt**
* JWT-based authentication

  * Access Token
  * Refresh Token
* Middleware-protected routes
* Decoded user context attached to requests

### 🧱 Backend Architecture

* Controller–Service–Middleware separation
* Prisma ORM for database access
* Centralized environment configuration
* Proper error handling with HTTP status codes
* ES Module–based Node.js setup

---

## 🗄️ Database Schema (User)

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/codecall
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> ⚠️ Never commit `.env` to GitHub.

---

## 🛠️ Setup & Run Locally

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Run Prisma Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## 🧪 API Endpoints (Tested)

### 🔹 Health Check

```
GET /health
```

---

### 🔹 Register User

```
POST /auth/register
```

**Body:**

```json
{
  "name": "Test User",
  "email": "test@codecall.dev",
  "password": "StrongPass123"
}
```

---

### 🔹 Login User

```
POST /auth/login
```

**Body:**

```json
{
  "email": "test@codecall.dev",
  "password": "StrongPass123"
}
```

**Response:**

```json
{
  "success": true,
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

### 🔹 Protected Route (JWT Test)

```
GET /api/test/protected
```

**Headers:**

```
Authorization: Bearer <ACCESS_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "message": "Protected route accessed",
  "user": {
    "userId": "...",
    "email": "test@codecall.dev"
  }
}
```

---

## 🧠 Security Notes

* Passwords are never stored in plain text
* JWT secrets are stored in environment variables
* Access tokens are short-lived
* Refresh tokens are generated for session continuity
* Middleware ensures protected route access

---

## 🧩 Phase Roadmap

### ✅ Phase 1

* Project setup
* Express server
* Prisma configuration

### ✅ Phase 2

* Database schema
* Base routing structure

### ✅ Phase 3 (Current)

* Authentication & Authorization
* JWT middleware
* Protected routes

### 🔜 Phase 4 (Next)

* Socket.IO integration
* Real-time interview rooms
* Authenticated WebSocket connections
* User presence & session lifecycle

---

## 👨‍💻 Author

**Pratyush Kumar**
Backend-focused SDE Intern aspirant
Project: **CodeCall**

---

## 📜 License

MIT License

````

---


````

