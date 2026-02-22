---

# CodeCall Backend

Secure, modular, production-ready backend built with Node.js, Express, PostgreSQL, and Prisma.

Designed using layered architecture, security-first principles, and structured development phases.

---

##  Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Prisma ORM**
* **Zod (Validation)**
* **JWT (Authentication)**
* **Winston (Logging)**
* **Helmet (Security Headers)**
* **express-rate-limit (API Protection)**

---

##  Architecture Overview

```text
Client Request
      ↓
Request Logger (Winston)
      ↓
Rate Limiter
      ↓
Validation (Zod)
      ↓
Authentication (JWT)
      ↓
Authorization (RBAC)
      ↓
Controller
      ↓
Service Layer
      ↓
Database (Prisma)
      ↓
Global Error Handler
```

Project structure:

```
backend/src/
 ├── config/
 ├── middlewares/
 ├── modules/
 ├── utils/
 ├── app.js
 └── server.js
```

---

##  Security & Stability Highlights

* JWT Access & Refresh Token Authentication
* Role-Based Access Control (RBAC)
* Global Rate Limiting
* Auth-specific brute-force protection
* Progressive login slowdown
* Secure HTTP headers via Helmet
* Payload size limiting
* Zod-based request validation
* Fail-fast environment variable validation
* Centralized error handling
* Structured logging with Winston

---

##  Environment Setup

Create a `.env` file:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password%40encoded@localhost:5432/codecall

JWT_ACCESS_SECRET=your_super_long_access_secret_min_32_characters
JWT_REFRESH_SECRET=your_super_long_refresh_secret_min_32_characters

JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

> If your DB password contains special characters (e.g. `@`), URL-encode them (`@` → `%40`).

---

##  Running the Project

Install dependencies:

```bash
npm install
```

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```
GET /health
```

---

##  Branching Strategy

```
feature/* → dev → main
```

* `feature/*` → Feature development
* `dev` → Integration branch
* `main` → Stable release branch

Issues close when merged into `main`.

---

##  Detailed Architecture & Development Phases

For full architectural breakdown and phase-by-phase development:

 See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

##  Roadmap

* Refresh Token Rotation
* Correlation ID Logging
* Audit Logging
* Advanced Prisma Transactions
* Log File Rotation

---

##  License

MIT License

---


