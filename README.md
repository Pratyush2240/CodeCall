Excellent. This is the correct time to update documentation — after a stable tagged release (`v1.4.0`).

Below is a **production-grade README update** covering everything up to Phase 5.6.
You can paste this directly into your `README.md`.

---

# CodeCall – Backend

CodeCall is a real-time collaborative interview practice platform that enables friends to practice technical interviews together with secure authentication, shared sessions, and AI-powered feedback (upcoming).

This repository contains the **backend service**, built with a clean, scalable, production-ready architecture.

---

# 🚀 Current Release

**Latest Version:** `v1.4.0`
**Phase:** 5.6 – Structured Error Code System
**Status:** Production-ready backend foundation

---

# 🏗 Architecture Overview

The backend follows a layered, modular architecture:

```
src/
 ├── config/            # Environment & Prisma config
 ├── middlewares/       # Auth, RBAC, validation, logging, error handling
 ├── modules/           # Feature modules (auth, user, etc.)
 ├── utils/             # Logger, JWT, AppError, helpers
 ├── app.js
 └── server.js
```

Design principles:

* Separation of concerns
* Centralized error handling
* Structured logging
* Environment-aware responses
* Secure authentication flow
* Scalable modular structure

---

# 🛠 Tech Stack

* Node.js (ES Modules)
* Express.js
* Prisma ORM
* PostgreSQL
* JWT (Access + Refresh Tokens)
* bcrypt
* Zod (Validation)
* Winston (Structured Logging)

---

# 🔐 Authentication System (Phase 4)

### Access Token

* Short-lived
* Used for API authentication
* Sent via `Authorization: Bearer <token>`

### Refresh Token

* Long-lived
* Used to issue new access tokens
* Supports rotation & secure logout

### Features

* Secure password hashing (bcrypt)
* Token verification
* Refresh rotation
* Logout invalidation

---

# 🛡 Role-Based Access Control (RBAC)

`requireAuth` → Ensures authenticated user
`requireRole(["ADMIN"])` → Restricts by role

Behavior:

* `401` → Unauthenticated
* `403` → Forbidden (insufficient role)

---

# 🧾 Validation Layer (Zod)

All incoming requests pass through schema validation middleware.

If validation fails:

* Returns `400`
* Uses structured error format
* Integrated with global error handler

---

# ⚙️ Centralized Error Handling (Phase 5)

All errors flow through `error.middleware.js`.

### Development Mode

* Full stack trace
* Detailed error message

### Production Mode

* No stack trace
* Generic message for unknown errors
* Operational errors return safe messages

---

# 🧩 Structured Error Code System (Phase 5.6)

All errors now follow a unified structure:

```json
{
  "status": "fail",
  "code": "AUTH_INVALID_TOKEN",
  "message": "Invalid or expired token"
}
```

### Error Categories

| Category       | Example Codes                          |
| -------------- | -------------------------------------- |
| Authentication | AUTH_INVALID_TOKEN, AUTH_TOKEN_MISSING |
| Authorization  | AUTH_FORBIDDEN                         |
| Validation     | VALIDATION_ERROR                       |
| Server         | INTERNAL_SERVER_ERROR                  |

This ensures:

* Consistent frontend handling
* Predictable API behavior
* Enterprise-grade error contracts

---

# 📊 Structured Logging (Winston)

Request-level logging:

```
POST /api/auth/login
GET /api/user/profile
```

Error logging:

* Unexpected errors logged internally
* Production-safe responses returned to client

---

# 🌍 Environment-Based Configuration

Environment variables handled via `env.js`.

Important variables:

```
PORT=
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=
JWT_REFRESH_EXPIRES=
NODE_ENV=
```

---

# 📦 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Error Response

```json
{
  "status": "fail",
  "code": "ERROR_CODE",
  "message": "Human readable message"
}
```

---

# 🧪 Testing

Use Postman or similar tool.

Test flows:

1. Register
2. Login → get access token
3. Access protected route
4. Test role-based route
5. Test invalid token
6. Test validation error
7. Test production vs development behavior

---

# 🏷 Version History

* `v1.2.0` → Logging system + stability improvements
* `v1.3.0` → Authentication & authorization hardening
* `v1.4.0` → Structured error code system

---

# 🔮 Upcoming Phases

* Rate limiting & abuse protection
* Token revocation store
* Audit logging
* Session management
* WebSocket integration (real-time collaboration)

---

# 👨‍💻 Author

Pratyush Kumar
Backend Architecture & Security Focused Implementation

---

# 📄 License

MIT

---

# ✅ What You Should Do Now

1. Replace your current README with this.
2. Commit:

   ```bash
   git add README.md
   git commit -m "docs: update README up to Phase 5.6"
   git push origin main
   git checkout dev
   git merge main
   git push origin dev
   ```

---

If you want, I can now:

* Make it **more concise and recruiter-friendly**
* Or make it **enterprise-style documentation**
* Or create a **separate ARCHITECTURE.md** file

Your backend is now at a very respectable level.
