# CodeCall – Backend (Phase 1)

Backend service for **CodeCall**, a collaborative platform that enables friends to practice technical interviews together through structured practice sessions.

This repository contains **Phase 1** of the backend, focused on building a robust foundation with authentication, friend management, and practice session lifecycle management.

---

## 📌 Phase 1 Scope

Phase 1 focuses strictly on core backend foundations:

- Secure authentication
- User relationship management (friends)
- Practice session lifecycle
- Clean architecture with proper separation of concerns
- Database schema design and migrations

No realtime, code editor, or media features are included in this phase.

---

## 🚀 Features (Implemented)

### 🔐 Authentication
- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Protected routes via authentication middleware
- Secure token-based user identification

### 👥 Friend System
- Send friend requests
- Accept friend requests
- Prevent invalid operations (self requests, duplicates)
- List accepted friends
- Authorization enforced at every step

### 🧩 Practice Sessions
- Create a practice session (host)
- Join a session (guest)
- Role-based enforcement:
  - Host cannot join as guest
  - Only host can end the session
- Session lifecycle states:
  - WAITING
  - ACTIVE
  - ENDED
- Clean validation and error handling

---

## 🛠 Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT (jsonwebtoken)
- bcrypt
- Nodemon

---

## 📁 Project Structure

```

backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/        # Prisma & app configuration
│   ├── controllers/  # HTTP request handlers
│   ├── services/     # Business logic
│   ├── routes/       # API routes
│   ├── middlewares/  # Auth & error handling
│   ├── utils/        # Helpers (JWT, responses)
│   ├── app.js        # Express app setup
│   └── server.js     # Server bootstrap
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

> `.env` is excluded from version control.

---

## 🧪 Running the Backend Locally

### Install dependencies

```bash
npm install
```

### Run database migrations

```bash
npx prisma migrate dev
```

### Generate Prisma client

```bash
npx prisma generate
```

### Start the development server

```bash
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## 🔍 API Endpoints (Phase 1)

### Authentication

* POST `/auth/register`
* POST `/auth/login`

### Friends

* POST `/friends/request`
* POST `/friends/accept/:id`
* GET `/friends`

### Practice Sessions

* POST `/sessions` — create session (host)
* POST `/sessions/join/:id` — join session (guest)
* POST `/sessions/end/:id` — end session (host only)

All protected routes require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## ✅ Phase 1 Status

* Authentication implemented
* Friend system implemented
* Practice session lifecycle implemented
* Database schema & migrations stable
* Clean backend architecture

**Phase 1 is complete and stable.**

---

## 👤 Author

Pratyush Kumar

---

## 📜 License

MIT License

````

---

