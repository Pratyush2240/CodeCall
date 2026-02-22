---

# CodeCall Backend Architecture

This document outlines the structured development of the backend from Phase 1 to Phase 7.

---

# Phase 1 — Backend Foundation

Objective: Establish modular Express structure.

### Implemented

* Express server setup
* Modular folder architecture
* Health check endpoint
* CORS integration
* `app.js` / `server.js` separation

Result: Scalable backend structure.

---

# Phase 2 — Database Integration (Prisma)

Objective: Connect PostgreSQL using Prisma ORM.

### Implemented

* Prisma configuration
* Database schema design
* Migration system
* Centralized Prisma client

Result: Structured and maintainable data access layer.

---

# Phase 3 — Authentication (JWT)

Objective: Implement secure authentication.

### Implemented

* User registration
* Login
* Password hashing (bcrypt)
* Access token generation
* Refresh token generation
* Token expiration configuration
* Auth service abstraction

Result: Secure token-based authentication.

---

# Phase 4 — Authorization & RBAC

Objective: Protect restricted routes.

### Implemented

* JWT verification middleware
* Role-based access enforcement
* Route-level protection

Result: Controlled resource access.

---

# Phase 5 — Request Validation & Error Handling

Objective: Enforce strict API contracts.

### Implemented

* Zod-based validation middleware
* Module-specific validation schemas
* Custom `AppError` class
* Centralized global error handler
* Structured error responses
* Production-safe error masking

Result: Reliable and predictable API behavior.

---

# Phase 6 — Rate Limiting & Abuse Protection

Objective: Protect against API abuse and brute-force attacks.

### Implemented

* Global rate limiter (100 requests / 15 min)
* Auth-specific limiter (5 attempts / 10 min)
* Progressive login slowdown
* Helmet security headers
* JSON payload size limiting

Result: Hardened backend security.

---

# Phase 7 — Environment Variable Validation

Objective: Fail-fast configuration validation.

### Implemented

* Zod schema for `process.env`
* Startup-time validation
* Minimum secret length enforcement
* NODE_ENV strict validation
* Immediate process termination on invalid configuration

Startup sequence:

```text
dotenv.config()
      ↓
Environment Validation
      ↓
Application Boot
```