# SkillSwap: A Peer-to-Peer Community Skill Exchange Platform

**Course:** CS619 Final Year Project  
**Group ID:** S26PROJECTCAC47  
**Student Name:** Shahbaz Ali  
**VU ID:** BC210210215  
**Supervisor:** Sir. Safid Ullah Shah  

---

## 📌 Abstract & Introduction

In traditional educational and upskilling environments, monetary cost is often the primary barrier preventing individuals from acquiring new capabilities. **SkillSwap** is a peer-to-peer web platform designed around a pure "knowledge barter" system. Users trade their expertise directly with one another without financial transactions. A member offering to teach a skill they master can exchange lessons with another member possessing the skill they want to learn.

The platform emphasizes community trust, reciprocal skill alignment, interactive real-time coordination, and administrative oversight to ensure a secure, structured, and collaborative environment.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Single Page Application (SPA) architecture |
| **Styling** | Tailwind CSS | Utility-first, responsive modern user interface |
| **Routing** | React Router v6 | Client-side routing with role-based route guards |
| **Icons** | Lucide React | Consistent vector iconography |
| **Backend** | Node.js & Express.js | RESTful API server & business logic controller layer |
| **Real-Time Layer** | Socket.io | Bidirectional WebSocket communication for chat & live alerts |
| **Database** | MongoDB | Document database for catalog, users, requests, and logs |
| **ODM** | Mongoose | Schema modeling, validation, and relationship population |
| **Authentication** | BCrypt.js + JWT | Salted password hashing & JSON Web Token session management |

---

## 📋 Functional Requirements Specification (FR1 – FR12)

The system implements all twelve core functional requirements specified in the project charter:

```
+-----------------------------------------------------------------------------------+
|                            SKILLSWAP SYSTEM ARCHITECTURE                          |
+-----------------------------------------------------------------------------------+
|  [ React.js + Tailwind Client ] <==== (JWT REST API) ====> [ Express.js Server ]  |
|                                 <== (WebSockets/WSS) ===> [ Socket.io Engine ]   |
|                                                                    |              |
|                                                                    v              |
|                                                           [( MongoDB Database )]  |
+-----------------------------------------------------------------------------------+
```

### 1. FR1: User Registration and Authentication

- **Secure Account Creation:** User registration with input validation, duplicate email prevention, and BCrypt salted password hashing.
- **JWT Session Handling:** Signed JSON Web Tokens issued on login and stored client-side for authenticated API requests.
- **Password Reset via Email Verification:** Multi-step reset workflow generating time-limited verification codes dispatched via email service to authenticate account owners before password updates.

### 2. FR2: Profile Management

- **Profile Customization:** User-managed profiles containing a bio, location, headline, avatar, and active exchange status.
- **Skill Sets Association:** Direct assignment of "Skills to Teach" (with expertise levels) and "Skills to Learn" to user records.
- **Public Profiles:** Public member views showcasing community statistics, completed swaps, and authentic review histories.

### 3. FR3: Skill Cataloging

- **Categorized Skill Database:** Structured categories including *Information Technology (IT)*, *Creative Arts*, *Music*, *Cooking*, *Languages*, *Business*, and *Sports*.
- **Expertise Classification:** Defined proficiency ratings (*Beginner*, *Intermediate*, *Advanced*, *Expert*) attached to each skill offering.
- **Dynamic Catalog Administration:** Admin CRUD capabilities for managing skills and categories.

### 4. FR4: Advanced Search Engine

- **Multi-Parameter Search:** Real-time query filtering by skill name, category domain, teaching vs. learning mode, proficiency tier, geographic proximity (city/location), and minimum trust score threshold.

### 5. FR5: Skill Matching Logic Engine

- **Reciprocal Matching Algorithm:** Automated engine that evaluates mutual skill overlap. When User A teaches what User B wants to learn *and* User B teaches what User A wants to learn, a high-compatibility reciprocal match is suggested with dedicated matching badges.

### 6. FR6: Exchange Request System

- **State Machine Pipeline:** Structured request lifecycle:  
  $$\text{Pending} \longrightarrow \text{Accepted} \longrightarrow \text{Completed} \quad \Big( \text{or } \text{Rejected} \,/\, \text{Cancelled} \Big)$$
- **Coordination Notes:** Optional scheduling availability and lesson objectives attached to exchange requests.

### 7. FR7: Real-Time Chat Interface

- **WebSocket Messaging:** Authenticated Socket.io communication channels created between matched/accepted partners.
- **Chat History & Indicators:** Persistent message history in MongoDB, live typing indicators, and read receipts (`readBy`).

### 8. FR8: Rating and Review System

- **Post-Exchange Feedback:** 1-to-5 star rating modal unlocked upon swap completion.
- **Attribute Tagging:** Qualitative feedback chips (*'Patient Teacher'*, *'Knowledgeable'*, *'Punctual'*, *'Great Communicator'*, etc.) to reinforce community trust.

### 9. FR9: Reputation Score Algorithm

- **Weighted Trust Index ($0 - 100$):** Dynamic score computed from four dimensions:
  1. Average Star Rating ($40\%$)
  2. Total Completed Swaps ($30\%$)
  3. Positive Review Ratio ($15\%$)
  4. Profile & Skill Completeness ($15\%$)
- **Tier Classification:** *New Swapper* ($<50$), *Verified Member* ($50-74$), *Trusted Partner* ($75-89$), and *Master Swapper* ($90-100$).

### 10. FR10: Centralized User Dashboard

- **Consolidated Metrics:** Active swaps counter, pending incoming/outgoing requests, completed swaps count, trust score breakdown, and recommended reciprocal partners.
- **Activity Tracking:** Recently viewed profiles history for quick reference.

### 11. FR11: Real-Time Notification System

- **Event-Driven Push Alerts:** Socket.io notifications triggered on new swap requests, acceptance, completion, messages, and feedback received.
- **Interactive Notification Center:** Navbar bell with unread badge counter, individual mark-read, mark-all-read, and email alert integration.

### 12. FR12: Administrative Control Panel

- **Role-Based Protection:** Admin-only routes secured by role middleware.
- **User Moderation:** System-wide user list, account suspension/reactivation with recorded reasons, role adjustments, and account deletion.
- **Skill Catalog CRUD:** Interface to add, modify, or archive skills and categories.
- **Report Resolution Queue:** Queue to review user-submitted moderation reports with actions (*Warning*, *Suspend*, *Dismiss*).

---

## 📂 Project Directory Structure

```
skill-swap/
├── client/                     # React.js Frontend (Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with JWT interceptors
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx          # Socket.io chat interface (FR7)
│   │   │   ├── Logo.jsx                # Vector brand emblem
│   │   │   ├── MatchCard.jsx           # Compatibility match display (FR5)
│   │   │   ├── Navbar.jsx              # Navigation & notification bell (FR11)
│   │   │   ├── NotificationDropdown.jsx # Real-time notification menu
│   │   │   ├── ReportModal.jsx         # User/content moderation report (FR12)
│   │   │   ├── ReviewModal.jsx         # 5-star rating submission (FR8)
│   │   │   ├── SkillSelector.jsx       # Categorized skill picker (FR3)
│   │   │   ├── SwapRequestCard.jsx     # Exchange pipeline actions (FR6)
│   │   │   ├── SwapRequestModal.jsx    # Swap initiation dialog
│   │   │   └── TrustBadge.jsx          # Trust score & tier badge (FR9)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Session state management
│   │   │   └── SocketContext.jsx       # WebSocket connection provider
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx          # Administrator dashboard (FR12)
│   │   │   ├── Dashboard.jsx           # Central user dashboard (FR10)
│   │   │   ├── ExploreSearch.jsx       # Advanced search engine (FR4)
│   │   │   ├── ForgotPassword.jsx      # Password reset flow (FR1)
│   │   │   ├── LandingPage.jsx         # Public landing page
│   │   │   ├── Login.jsx               # User sign in (FR1)
│   │   │   ├── PublicProfile.jsx       # Public profile & reviews (FR2, FR8)
│   │   │   ├── Register.jsx            # Account creation (FR1)
│   │   │   └── SwapChat.jsx            # Swaps pipeline & live chat (FR6, FR7)
│   │   ├── App.jsx                     # Route definitions & guards
│   │   ├── index.css                   # Tailwind styles
│   │   └── main.jsx                    # Application entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Express.js + Socket.io Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection configuration
│   ├── controllers/
│   │   ├── adminController.js          # Admin metrics, users, catalog (FR12)
│   │   ├── authController.js           # Auth & password reset (FR1)
│   │   ├── matchController.js          # Reciprocal matching engine (FR5)
│   │   ├── messageController.js        # Message history & rooms (FR7)
│   │   ├── notificationController.js   # Notification queries & actions (FR11)
│   │   ├── reportController.js         # Moderation reports (FR12)
│   │   ├── reviewController.js         # Ratings & reviews (FR8)
│   │   ├── skillController.js          # Skill catalog (FR3)
│   │   ├── swapController.js           # Exchange state system (FR6)
│   │   └── userController.js           # Profile & search engine (FR2, FR4)
│   ├── middleware/
│   │   └── auth.js             # JWT verification & role authorization
│   ├── models/
│   │   ├── Conversation.js     # Chat thread reference model
│   │   ├── Message.js          # Chat message schema
│   │   ├── Notification.js     # In-app notification schema
│   │   ├── Report.js           # Moderation report schema
│   │   ├── Review.js           # Rating & review schema
│   │   ├── Skill.js            # Categorized skill schema
│   │   ├── SwapRequest.js      # Exchange request state schema
│   │   └── User.js             # User account & reputation schema
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── skillRoutes.js
│   │   ├── swapRoutes.js
│   │   └── userRoutes.js
│   ├── seed/
│   │   └── seed.js             # Full database seed script
│   ├── services/
│   │   ├── emailService.js     # Verification & alert dispatcher
│   │   └── trustScoreService.js # Reputation calculation algorithm
│   ├── sockets/
│   │   └── chatSocket.js       # Real-time WebSocket event handler
│   ├── package.json
│   ├── server.js               # Application entry point
│   └── test_all_fr.js          # Comprehensive API verification test suite
│
└── database/                   # JSON seed exports for reference
```

---

## ⚡ Installation & Setup Guide

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** Local instance (`mongodb://127.0.0.1:27017/skillswap`) or a MongoDB Atlas connection string

---

### Step 1: Backend Configuration

1. Navigate to the server folder:

   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/skillswap
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. Seed the database with demo users, skills, completed swaps, and reviews:

   ```bash
   npm run seed
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

   *The Express API and Socket.io server will be active at `http://localhost:5000`.*

---

### Step 2: Frontend Configuration

1. Open a separate terminal and navigate to the client folder:

   ```bash
   cd client
   npm install
   ```

2. Verify environment configuration in `client/.env`:

   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. Launch the Vite development server:

   ```bash
   npm run dev
   ```

   *The application interface will be accessible at `http://localhost:5173`.*

---

## 👥 Seeded Demonstration Accounts

All pre-seeded demo accounts share the default password: **`password123`**

| Account Email | Name | System Role | Profile Overview |
| :--- | :--- | :---: | :--- |
| `admin@skillswap.test` | Admin Supervisor | `admin` | **System Administrator** with full moderation & catalog access |
| `hira@skillswap.test` | Hira Aslam | `user` | Teaches Guitar & Design; has active chat & completed swap |
| `ali@skillswap.test` | Ali Khan | `user` | Teaches Python & Web Dev; has active chat with Hira |
| `sarah@skillswap.test` | Sarah Noor | `user` | Teaches Photography & Video Editing; reviewed Hira (5★) |
| `bilal@skillswap.test` | Bilal Ahmed | `user` | Teaches Calligraphy; seeking Web Development |
| `tariq@skillswap.test` | Chef Tariq | `user` | Teaches Pakistani Cuisine & Chess; completed swap with Ayesha |
| `ayesha@skillswap.test` | Ayesha Siddiqui | `user` | Teaches English IELTS & Digital Marketing; reviewed Tariq (5★) |

---

## 🔌 API Endpoint Reference

### Authentication & Account (`/api/v1/auth`)

- `POST /register` — Register a new account
- `POST /login` — Authenticate and receive JWT
- `GET  /me` — Retrieve current authenticated user profile
- `POST /forgot-password` — Generate & dispatch password reset verification code
- `POST /reset-password` — Validate verification code and update password

### Profiles & Advanced Search (`/api/v1/users`)

- `GET /search` — Multi-filter partner search engine (FR4)
- `GET /me/recently-viewed` — Fetch recently viewed profiles (FR10)
- `PUT /me` — Update personal profile details (bio, location, headline, avatar)
- `PUT /me/skills` — Update taught skills & learning wishlist
- `GET /:id` — Public profile view with reviews and trust score

### Skill Catalog (`/api/v1/skills`)

- `GET  /` — Fetch active skills catalog with search filtering
- `GET  /categories` — Retrieve standard skill categories
- `POST /` — Add a new skill to the catalog

### Matching Engine (`/api/v1/matches`)

- `GET /` — Fetch reciprocal and direct matches scored for current user (FR5)

### Swap Exchanges (`/api/v1/swaps`)

- `POST  /` — Create and send a new swap request
- `GET   /` — List user's incoming and outgoing swap requests
- `GET   /:id` — Retrieve specific swap request details
- `PATCH /:id` — Update swap status (`accepted`, `rejected`, `cancelled`, `completed`)

### Real-Time Chat (`/api/v1/conversations`)

- `GET /` — List active conversations for current user
- `GET /:id/messages` — Fetch message history for a specific exchange thread

### Ratings & Reviews (`/api/v1/reviews`)

- `POST /` — Submit a rating, feedback, and tags for a completed swap (FR8)
- `GET  /user/:userId` — List reviews received by a user
- `GET  /swap/:swapId` — Retrieve review status for a specific swap

### Notifications (`/api/v1/notifications`)

- `GET    /` — List user notifications and unread counter (FR11)
- `PATCH  /read-all` — Mark all notifications as read
- `PATCH  /:id/read` — Mark single notification as read
- `DELETE /:id` — Delete notification record

### Administration Panel (`/api/v1/admin`)

- `GET    /stats` — Platform overview analytics & category distribution (FR12)
- `GET    /users` — Moderate all user accounts
- `PATCH  /users/:id/status` — Suspend, unsuspend, or modify user roles
- `DELETE /users/:id` — Remove user and associated data
- `GET    /skills` & `POST /skills` — Admin catalog management
- `PUT    /skills/:id` & `DELETE /skills/:id` — Update or delete skills
- `GET    /reports` & `PATCH /reports/:id` — Manage and resolve user reports

---

## 🧪 Automated Verification Suite

To run the automated verification script testing all 12 Functional Requirement endpoints end-to-end:

```bash
cd server
node test_all_fr.js
```

---

## 🔒 Security & Best Practices

- **Password Hashing:** Passwords encrypted using BCrypt with adaptive salting.
- **Stateless Authorization:** Secure JWT access tokens validated on every protected REST route and WebSocket handshake.
- **Role Guards:** Administrative endpoints protected by multi-tier authorization middleware (`requireAuth` + `requireAdmin`).
- **Input Sanitization & Validation:** Mongoose schemas enforce types, required fields, and enumerations to prevent injection attacks.
- **Centralized Error Handling:** Standardized API error responses following `{ success: false, error: { code, message } }`.

---

## 🌿 Git Branches & Version Control (Client & Server)

This repository manages both the **Client (React + Vite frontend)** and **Server (Node.js + Express + Socket.io backend)** within a unified monorepo branching structure.

### Active Repository Branches

| Branch Name | Scope | Status | Description |
| :--- | :---: | :---: | :--- |
| **`main`** | `client/` & `server/` | **Default / Production** | Contains the complete, stable full-stack implementation, including the Express/Socket.io backend initialization (`server/`), database seeds (`database/`), clean production UI views, and favicon assets (`client/`). |
| **`fixes-fr-text-frontend`** | `client/` | **Frontend Refinement** | Dedicated client-side branch for removing bugs from UI headings across `LandingPage`, `Dashboard`, `ExploreSearch`, `PublicProfile`, `SwapChat`, `AdminPanel`, `Login`, `Register`, and `ForgotPassword` for a cleaner end-user presentation. |

---

## 📄 License & Attribution

Developed as a Final Year Project for **CS619 — Virtual University of Pakistan**.  
*All rights reserved &copy; 2026 Shahbaz Ali (BC210210215).*
