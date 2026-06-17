# CodeCall — System Architecture & Design Document

CodeCall is a real-time collaborative platform with coding, whiteboard, DSA board and communication tools. This document details the system architecture, data model, communication protocols, and security design.

---

## 1. System Overview

CodeCall operates on a **hybrid architecture** combining a REST API layer, persistent bidirectional WebSockets, and direct Peer-to-Peer (P2P) WebRTC streaming.

```mermaid
graph TD
    Client["Browser Client"]

    subgraph Frontend ["React 19 Frontend (Vite)"]
        Router["React Router v7<br/>Auth Guards"]
        Hooks["Custom Sync Hooks<br/>(code, cursor, whiteboard, chat, presence)"]
        API["Axios HTTP Client<br/>JWT Interceptors"]
        Sockets["Socket.IO Client<br/>Singleton Instance"]
        WebRTC["WebRTC Media Engine<br/>P2P Streams"]
    end

    subgraph Backend ["Node.js + Express Server"]
        Middleware["Middleware Pipeline<br/>(Auth, Rate Limit, Zod, CORS, Helmet)"]
        API_Layer["REST Controller Layer<br/>(auth, user, project, room, invitation, execution, friend, session)"]
        Socket_Layer["Socket.IO Namespaces<br/>(code, cursor, chat, whiteboard, presence, webrtc, execution)"]
        Services["Service Layer<br/>Business Logic"]
        Jobs["BullMQ Queue<br/>Async Workers"]
        Observability["Observability<br/>(Sentry, Prometheus, Winston)"]
    end

    subgraph Storage ["Data Layer"]
        Postgres[("PostgreSQL<br/>Relational DB")]
        Redis[("Redis<br/>Cache & Job Store")]
    end

    subgraph Sandbox ["Execution Sandbox"]
        Judge0["Judge0 CE<br/>Isolated Container"]
    end

    Client --> Router
    Router --> Hooks
    Hooks --> API
    Hooks --> Sockets
    Hooks -.-> WebRTC
    WebRTC -.-> Client

    API --> Middleware
    Middleware --> API_Layer
    API_Layer --> Services
    Services --> Postgres

    Sockets --> Socket_Layer
    Socket_Layer --> Services

    Services --> Jobs
    Jobs --> Redis
    Services --> Judge0
    Services --> Redis

    Services --> Observability
```

---

## 2. Component Architecture

### 2.1 Frontend Architecture (Vite + React 19)

The frontend uses a **modular hook-based architecture** that isolates the presentation layer (components/pages) from real-time state synchronization and network communication.

#### View Layer
- **Pages** render route-level views (Dashboard, RoomSession, Settings, etc.)
- **Components** are reusable UI elements (ProjectCard, RoomCard, ConfirmModal, CodeEditor, DSACanvas)
- All interactive elements use inline rename patterns with Enter-to-confirm/Escape-to-cancel UX

#### Custom Hooks (State Synchronization)
| Hook | Responsibility |
|---|---|
| `useCollaborativeCode` | Intercepts Monaco `onChange` events, debounces changes, and synchronizes edits across participants |
| `useCursors` | Broadcasts and renders remote cursor positions with per-user color coding |
| `useWhiteboard` | Handles HTML5 canvas drawing and coordinate transmission |
| `useDSABoard` | Manages data structure creation, manipulation, and animation state |
| `useWebRTC` | Coordinates camera/mic streams, P2P mesh connections, and ICE candidate exchange |
| `useChat` | Manages scoped in-room live chat message state |
| `usePresence` | Tracks user online/away status and activity indicators |
| `useCodeExecution` | Submits code to the execution API and receives results |
| `useSocket` | Manages socket connection lifecycle and auto-reconnection |

#### Core Services
- **`api/axios.js`** — Axios instance with interceptors that inject `Authorization: Bearer` headers and trigger automatic token refresh on 401 responses
- **`socket/socket.js`** — Singleton Socket.IO client managing connection lifecycle, auto-reconnect logic, and event channel routing
- **`context/UserContext.jsx`** — React Context providing global authentication state, user profile data, and login/logout actions

### 2.2 Backend Architecture (Node.js + Express + Prisma)

The backend follows a **Controller → Service → Repository** modular pattern with domain-driven feature modules.

```mermaid
graph LR
    subgraph Request Pipeline
        Req["Incoming Request"] --> Helmet["Helmet Headers"]
        Helmet --> CORS["CORS Check"]
        CORS --> BodyParser["Body Parser (10KB limit)"]
        BodyParser --> Correlation["Correlation ID"]
        Correlation --> Logger["Request Logger"]
        Logger --> RateLimit["Rate Limiter"]
        RateLimit --> Metrics["Metrics Capture"]
        Metrics --> Auth["JWT Auth"]
        Auth --> Zod["Zod Validation"]
        Zod --> Controller["Route Controller"]
        Controller --> Service["Service Layer"]
        Service --> Prisma["Prisma ORM"]
        Prisma --> DB[("PostgreSQL")]
    end
```

#### Module Organization
Each domain module follows the same structure: `controller.js` → `service.js` → `routes.js` (+ optional `validators.js`)

| Module | Endpoints | Description |
|---|---|---|
| **auth** | `/api/auth/*` | Login, signup, OAuth callbacks, token refresh, password reset |
| **user** | `/api/users/*` | Profile retrieval, settings update, avatar management |
| **project** | `/api/projects/*` | CRUD operations, membership management, tag categorization |
| **room** | `/api/rooms/*` | Room lifecycle (create, join, rename, end), participant tracking |
| **invitation** | `/api/invitations/*` | Send, accept, decline room invitations with 24h expiry |
| **execution** | `/api/execution/*` | Code submission proxy to Judge0 sandbox |
| **friend** | `/api/friends/*` | Friend request, accept, block system |
| **session** | `/api/sessions/*` | Legacy 1-on-1 session management |
| **health** | `/api/health` | Server health check |
| **metrics** | `/metrics` | Prometheus metrics endpoint |

#### Socket.IO Event Namespaces
| Handler | Events | Description |
|---|---|---|
| `code.socket` | `code-change`, `code-sync` | Collaborative editor content synchronization |
| `cursor.socket` | `cursor-move`, `cursor-leave` | Remote cursor position broadcasting |
| `chat.socket` | `chat-message` | Scoped in-room text messaging |
| `whiteboard.socket` | `draw-start`, `draw-move`, `draw-end`, `clear` | Canvas vector coordinate transmission |
| `presence.socket` | `user-join`, `user-leave`, `typing` | User presence and activity indicators |
| `webrtc.socket` | `offer`, `answer`, `ice-candidate` | WebRTC signaling for P2P connections |
| `execution.socket` | `execution-result` | Code execution result broadcasting |

#### Background Processing
- **BullMQ** (`queues/job.queue.js`) defines Redis-backed queues for asynchronous tasks
- **Workers** (`workers/job.workers.js`) process jobs including email dispatch and maintenance operations

---

## 3. Database Entity Relationship Diagram

Prisma ORM manages all relational models. The schema includes user accounts, authentication tokens, social features, project workspaces, rooms, and invitations.

```mermaid
erDiagram
    User ||--o{ RefreshToken : "issues"
    User ||--o{ PasswordResetToken : "requests"
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMember : "joins"
    User ||--o{ Room : "creates"
    User ||--o{ RoomParticipant : "attends"
    User ||--o{ RoomInvitation : "sends"
    User ||--o{ RoomInvitation : "receives"

    Project ||--o{ ProjectMember : "has"
    Project ||--o{ Room : "contains"

    Room ||--o{ RoomParticipant : "has"
    Room ||--o{ RoomInvitation : "requires"

    User {
        string id PK
        string email UK
        string username UK
        string password "nullable (OAuth users)"
        string fullName "nullable"
        string role "USER | ADMIN"
        string provider "github | google | null"
        string providerId "OAuth provider ID"
        string githubId UK "nullable"
        string googleId UK "nullable"
        string avatar "nullable"
        boolean isOAuthUser
        boolean isProfileComplete
        boolean hasPassword
        datetime createdAt
    }

    RefreshToken {
        string id PK
        string tokenHash UK
        string userId FK
        datetime expiresAt
        datetime createdAt
    }

    PasswordResetToken {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
        boolean used
        datetime createdAt
    }

    Friend {
        string id PK
        string requesterId
        string receiverId
        string status "PENDING | ACCEPTED | BLOCKED"
        datetime createdAt
    }

    Session {
        string id PK
        string hostId
        string guestId "nullable"
        string status "WAITING | ACTIVE | ENDED"
        datetime createdAt
        datetime endedAt "nullable"
    }

    Project {
        string id PK
        string name
        string description "nullable"
        string[] tags
        string ownerId FK
        datetime createdAt
        datetime updatedAt
    }

    ProjectMember {
        string id PK
        string userId FK
        string projectId FK
        string role "OWNER | ADMIN | MEMBER"
        datetime joinedAt
    }

    Room {
        string id PK
        string name
        string code UK
        string status "ACTIVE | ENDED"
        string createdById FK
        string projectId FK "nullable"
        datetime createdAt
        datetime updatedAt
        datetime lastActivityAt
        datetime endedAt "nullable"
    }

    RoomParticipant {
        string id PK
        string userId FK
        string roomId FK
        datetime joinedAt
    }

    RoomInvitation {
        string id PK
        string roomId FK
        string senderId FK
        string receiverId FK
        string status "PENDING | ACCEPTED | DECLINED | EXPIRED"
        datetime createdAt
        datetime expiresAt "24h TTL"
    }
```

---

## 4. Real-Time Communication Protocols

### 4.1 Monaco Code Editor Synchronization

Collaborative typing is synchronized via Socket.IO room-scoped broadcasts. Change deltas and cursor positions are debounced to reduce network overhead.

```mermaid
sequenceDiagram
    participant A as User A (Monaco)
    participant HA as Client A Hook
    participant S as Socket.IO Server
    participant HB as Client B Hook
    participant B as User B (Monaco)

    A->>HA: Keystroke Event (change delta)
    HA->>HA: Debounce & Buffer Input
    HA->>S: EMIT "code-change" {delta, cursorPosition}
    S->>HB: BROADCAST "code-change" {delta, cursorPosition}
    HB->>B: Apply change delta at cursor index
    HB->>B: Update User A remote cursor position
```

### 4.2 WebRTC Peer-to-Peer Video/Audio

WebRTC connections bypass the server during active streaming. Socket.IO rooms serve as the **signaling channel** to negotiate connection terms (SDP offers/answers and ICE candidates).

```mermaid
sequenceDiagram
    participant A as Peer A (Host)
    participant S as Socket.IO Signaling
    participant B as Peer B (Joiner)

    B->>S: Join Room Session
    S-->>A: User Joined Notification
    A->>S: EMIT "webrtc-offer" {SDP}
    S->>B: Forward Offer SDP
    B->>S: EMIT "webrtc-answer" {SDP}
    S->>A: Forward Answer SDP
    Note over A,B: ICE Candidate discovery & exchange via Sockets
    A-->B: P2P WebRTC Stream Established (Direct)
```

### 4.3 DSA Canvas Synchronization

Data structure operations (create, insert, delete, traverse) are broadcast to all room participants. The DSA visualizer supports Arrays, Linked Lists, BSTs, and Graphs with animated step-through.

```mermaid
sequenceDiagram
    participant A as User A (Canvas)
    participant HA as DSA Board Hook
    participant S as Socket.IO Server
    participant HB as Client B Hook
    participant B as User B (Canvas)

    A->>HA: Create BST / Insert Node
    HA->>S: EMIT "dsa-update" {type, operation, data}
    S->>HB: BROADCAST "dsa-update" {type, operation, data}
    HB->>B: Animate operation on canvas
```

### 4.4 Whiteboard Drawing Sync

Canvas drawing events are transmitted as vector coordinates with optimized point batching for smooth rendering across peers.

---

## 5. Authentication & Authorization Flow

### 5.1 JWT Token Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Express API
    participant DB as PostgreSQL

    C->>API: POST /auth/login {email, password}
    API->>DB: Verify credentials (bcrypt)
    DB-->>API: User record
    API->>API: Generate Access Token (15m) + Refresh Token (7d)
    API->>DB: Store hashed Refresh Token
    API-->>C: {accessToken, refreshToken}

    Note over C,API: After 15 minutes...

    C->>API: GET /rooms (expired access token)
    API-->>C: 401 Unauthorized

    C->>API: POST /auth/refresh {refreshToken}
    API->>DB: Verify & invalidate old Refresh Token
    API->>API: Generate new Access + Refresh Token pair
    API->>DB: Store new hashed Refresh Token
    API-->>C: {newAccessToken, newRefreshToken}
```

### 5.2 OAuth Flow (Google / GitHub)

1. Client redirects to provider authorization URL
2. Provider redirects back with authorization code
3. Backend exchanges code for provider access token
4. Backend fetches user profile from provider API
5. If user exists (matched by provider ID or email) → link account & issue JWTs
6. If new user → create account, mark `isProfileComplete: false` → redirect to profile completion page

---

## 6. Security Architecture

CodeCall implements a **defense-in-depth** strategy across all system layers:

### 6.1 Code Execution Isolation
User code is treated as **untrusted data**. Instead of local execution, payloads are proxied to **Judge0 CE** sandbox containers that enforce:
- Hard execution timeouts
- Memory limit constraints
- Disabled network adapters
- Process isolation (neutralizes fork bombs, command injection, and malware)

### 6.2 Network Security
| Layer | Mechanism | Configuration |
|---|---|---|
| **HTTP Headers** | Helmet.js | XSS protection, frame options, referrer policy, HSTS |
| **CORS** | Express CORS | Origin locked to `CLIENT_URL` in production |
| **Request Size** | Body Parser | 10KB limit to prevent buffer overflow payloads |
| **Rate Limiting** | express-rate-limit | Request count caps per IP window |
| **Speed Limiting** | express-slow-down | Progressive delay on repeated requests |
| **Input Validation** | Zod schemas | All API inputs validated before entering business logic |

### 6.3 Authentication Security
| Feature | Implementation |
|---|---|
| **Password Hashing** | bcrypt with auto-generated salt rounds |
| **Access Tokens** | Short-lived JWT (15m), stateless verification |
| **Refresh Tokens** | Long-lived (7d), hashed in database, single-use with rotation |
| **Token Rotation** | Old refresh token invalidated on every refresh, preventing replay attacks |
| **Password Reset** | Time-bound tokens with one-time use enforcement |
| **OAuth Account Linking** | Provider IDs prevent duplicate accounts (`@@unique([provider, providerId])`) |

### 6.4 Error Handling & Observability
- **Sentry** captures unhandled exceptions with full stack traces and distributed tracing
- **Winston** logs structured JSON with correlation IDs for request tracing
- **Prometheus** exposes HTTP duration histograms and Node.js runtime metrics at `/metrics`
- **Custom `AppError` class** with centralized error codes ensures consistent API error responses

---

## 7. Middleware Pipeline

Every incoming HTTP request passes through the following middleware chain in order:

```
Helmet → CORS → Body Parser (10KB) → Correlation ID → Request Logger → Rate Limiter → Speed Limiter → Metrics Capture → JWT Authentication → Zod Validation → Route Controller → Error Handler
```

Socket.IO connections authenticate via the JWT token passed during the initial handshake, granting access to room-scoped event namespaces.

---

## 8. Deployment Considerations

### Required Services
- **PostgreSQL** — Primary database (managed or self-hosted)
- **Redis** — Required for rate limiting, response caching, and BullMQ job queues
- **Judge0 CE** — Self-hosted or third-party sandbox for code execution
- **SMTP Server** — For transactional emails (password reset, invitations)

### Optional Integrations
- **Sentry** — Error monitoring (configure via `SENTRY_DSN`)
- **Prometheus + Grafana** — Metrics dashboard (scrape `/metrics` endpoint)
- **GitHub / Google OAuth** — Federated login (configure client ID/secret pairs)