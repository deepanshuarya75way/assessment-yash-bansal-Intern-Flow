# InternFlow 🚀

**InternFlow** is a feature-rich, full-stack Internship Management and Growth Platform designed to streamline the lifecycle of internships. It connects interns, mentors, and placement coordinators through interactive dashboards, project tracking, real-time collaboration, and developer stats integration.

---

## 🌐 Live Deployment Links

- 🎨 **Frontend Application (Vercel)**: [https://intern-flow-pnqh.vercel.app](https://intern-flow-pnqh.vercel.app)
- ⚙️ **Backend REST API (Vercel)**: [https://intern-flow-steel.vercel.app](https://intern-flow-steel.vercel.app)
- 🐘 **Database**: PostgreSQL (Hosted on [Neon.tech](https://neon.tech))

---

## 🎬 Demo Video

[![InternFlow Demo - Watch on YouTube](https://img.youtube.com/vi/ZoWRuA7NKjY/maxresdefault.jpg)](https://youtu.be/ZoWRuA7NKjY)

> 🎬 *Click the thumbnail above to watch the full InternFlow demo on YouTube.*

---

## 🌟 Key Features

### 1. Developer Portfolio & GitHub Integration
- **Activity Tracker:** Real-time extraction of developer metrics (repositories, languages, commits, PRs, issues) via the GitHub API to measure intern contributions.
- **Growth Tracker:** Track developer skills progression and map milestones.

### 2. Task & Project Management
- **Kanban Board:** Drag-and-drop task workflow system powered by `@hello-pangea/dnd`.
- **Sprint Management:** Group and track milestones within structured sprints.

### 3. Career & Placement Assistance
- **Resume Builder:** Automatically generate clean, downloadable PDF resumes via server-side rendering (`pdfkit`).
- **Placement Dashboard:** Manage and coordinate job listings, internship applications, and interviewer reviews.

### 4. Interactive Analytics & Communication
- **Data Visualization:** Charts analyzing performance, sprint velocities, and task progress using React and `Recharts`.
- **Real-Time Collaboration:** Instant feedback loops, comment systems, and live notifications driven by `Socket.io`.
- **System Actions:** Integrated email alerts utilizing `Nodemailer`.
- **Data Export:** Export intern records and evaluation data into spreadsheet formats (CSV via `json2csv`).

### 5. Enterprise-Grade Security
- **Role-Based Auth (RBAC):** Secure authentication using JWT and cryptographically hashed passwords (`bcryptjs`).
- **Resilience:** Express Rate Limiters block auth route brute-forcing.
- **Cloud Database Pooling:** PostgreSQL connection pool (`pg`) with automatic `?` to `$1` query wrapping and SSL encryption.
- **Security Headers:** Hardened Express security using `helmet` and `cors`.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core Framework:** React 18 (Vite SPA template)
- **State Management:** Redux Toolkit & React Query (TanStack Query)
- **UI Framework:** Material UI (MUI) & Emotion
- **Charts:** Recharts
- **Drag & Drop:** `@hello-pangea/dnd`
- **Real-Time Gateway:** Socket.io Client
- **Deployment:** Vercel

### Backend (`/server`)
- **Runtime:** Node.js (Express.js)
- **Database:** PostgreSQL (using `pg` driver with Neon cloud PostgreSQL)
- **Real-Time Server:** Socket.io
- **PDF Generation:** PDFKit
- **Validation:** Joi (Schema Validation)
- **Logger:** Winston & Morgan
- **Deployment:** Vercel / Render

---

## 📂 Project Structure

```text
├── client/                 # Frontend React application (Vite)
│   ├── src/
│   │   ├── api/            # API endpoints & integrations
│   │   ├── components/     # Reusable UI widgets
│   │   ├── contexts/       # Global contexts (Auth, Theme, etc.)
│   │   ├── pages/          # Full page views (Analytics, Auth, Dashboard, etc.)
│   │   ├── store/          # Redux slices
│   │   └── theme/          # Custom MUI styles
│   └── vercel.json         # Single Page App routing configuration for Vercel
│
├── server/                 # Backend Node Express application
│   ├── src/
│   │   ├── config/         # Server & PostgreSQL database connection adapter
│   │   ├── database/       # PostgreSQL Migrations and Seeds
│   │   ├── middleware/     # Security, rate limiter, & error-handling middleware
│   │   ├── modules/        # Module-based server controllers & services
│   │   └── server.js       # Main server entrypoint
│   └── vercel.json         # Vercel serverless deployment configuration
│
└── DEPLOYMENT.md           # In-depth Deployment & Operations guide
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance (Local or [Neon.tech](https://neon.tech) cloud PostgreSQL)

### Setup Backend
```bash
cd server
cp .env.example .env     # Fill in your DATABASE_URL and JWT credentials
npm install
npm run migrate          # Execute PostgreSQL migrations
npm run seed             # Seed initial skills and data
npm run dev              # Run server locally
```

### Setup Frontend
```bash
cd client
cp .env.example .env     # Set VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev              # Start Vite dev server
```

---

## 🌐 Deployment Overview

- **Frontend** → [Vercel](https://vercel.com) — Root Directory: `client`
- **Backend** → [Vercel](https://vercel.com) / [Render](https://render.com) — Root Directory: `server`
- **Database** → [Neon PostgreSQL](https://neon.tech)

---

## 👤 Author

**InternFlow Team**  
Built with ❤️ for streamlining the internship experience.
