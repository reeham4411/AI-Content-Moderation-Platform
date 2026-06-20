# Muhafiz — AI Content Moderation Platform

Muhafiz is a full-stack AI-powered image content moderation platform where users can upload images, receive policy-based moderation verdicts, file appeals, and track review outcomes. Admins can configure moderation policies, review appeals, override verdicts, and view analytics.

**Live Demo:** https://ai-content-moderation-platform.vercel.app/

---

## Features

### User
- Register and log in
- Upload one or more images
- Receive AI moderation verdicts: `APPROVED`, `FLAGGED`, or `BLOCKED`
- View submission history
- Filter submissions by verdict, category, and date
- View detailed category-level reasoning
- File appeals for flagged or blocked images
- Track appeal status
- Download moderation reports

### Admin
- View all submissions
- Review and resolve appeals
- Manually override verdicts
- Configure moderation policies
- View analytics and user activity

---

## Moderation Categories

Muhafiz screens images against:

- Graphic Violence
- Hate Symbols
- Self-Harm
- Extremist Propaganda
- Weapons & Contraband
- Harassment & Humiliation

Each category has configurable policy settings:

- enabled / disabled
- confidence threshold
- enforcement behavior: `AUTO_BLOCK` or `FLAG_FOR_REVIEW`

---

## Verdict Logic

A category contributes to the final verdict only when:

```text
violationDetected === true
AND
confidenceScore >= confidenceThreshold
```

Verdict priority:

```text
BLOCKED > FLAGGED > APPROVED
```

Every image stores a policy snapshot, so future policy changes do not alter old verdicts.

---

## Tech Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Radix UI
- lucide-react
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- multer
- Gemini Vision API
- Docker

---

## Architecture

frontend/
  Next.js UI, auth flow, dashboards, upload, appeals, admin pages

backend/
  Express REST API, MongoDB models, moderation service, policies, appeals, analytics

The frontend communicates with the backend through REST APIs.

```
User/Admin → Next.js Frontend → Express API → Gemini/Mock Provider → MongoDB
```

---

## AI Moderation Provider

Muhafiz uses a provider-based moderation layer.

- If `GEMINI_API_KEY` exists, Gemini Vision is used.
- If `GEMINI_API_KEY` is empty, a mock provider is used automatically.

This makes the app testable even without an AI API key and allows future providers such as YOLO, AWS Rekognition, Azure Content Safety, or Google Cloud Vision.

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd AI-Content-Moderation-Platform
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on:

```
http://localhost:5001
```

Example backend `.env`:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/content_moderation
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
MAX_UPLOAD_MB=8
UPLOAD_DIR=uploads
```

For Docker MongoDB, use:

```env
MONGO_URI=mongodb://mongo:27017/content_moderation
```

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

Example frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

## Docker Backend Setup

From the `backend` folder:

```bash
docker compose up --build
```

Useful Docker commands:

```bash
docker compose up -d --build
docker compose logs -f backend
docker compose down
docker compose down -v
```

---

## Create Admin User

There is no public admin signup route. Create an admin using the CLI script.

### Local backend

```bash
cd backend
npm run create-admin -- admin@example.com StrongPass123 "Admin Name"
```

### Docker backend

```bash
cd backend
docker compose exec backend node dist/utils/createAdmin.js admin@example.com StrongPass123 "Admin Name"
```

Then log in through the frontend using those credentials.

---

## Main API Routes

### Auth

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Submissions

```
POST /api/submissions
GET  /api/submissions/my
GET  /api/submissions/:id
```

### Appeals

```
POST  /api/appeals
GET   /api/appeals/my
GET   /api/admin/appeals
PATCH /api/admin/appeals/:id/resolve
```

### Policies

```
GET   /api/policies
PATCH /api/admin/policies/:id
```

### Admin

```
GET   /api/admin/submissions
PATCH /api/admin/submissions/:id/override
GET   /api/admin/analytics/overview
```

---

## Frontend Pages

### Public

- Landing page
- Login
- Register

### User

- Dashboard
- Upload images
- Submission history
- Submission detail
- My appeals

### Admin

- Admin dashboard
- All submissions
- Appeals queue
- Policy configuration
- Analytics

---

## Key Architecture Decisions

- The project is split into separate `frontend` and `backend` folders to keep the UI and API layers independent.
- The backend follows a layered structure: routes, controllers, services, models, and providers.
- The moderation system uses a provider pattern, so Gemini Vision can be replaced later with YOLO, AWS Rekognition, Azure Content Safety, or another AI provider without changing the main business logic.
- Each image stores a policy snapshot at the time of moderation, so future policy changes do not affect old verdicts.
- JWT authentication and role-based access control are used to separate normal user features from admin-only features.
- The frontend uses reusable components and protected routes to keep the UI clean, consistent, and secure.

---

## Project Highlights

- Real AI image moderation with Gemini Vision
- Mock fallback for local testing
- Role-based user/admin system
- Policy snapshotting for auditability
- Structured appeal workflow
- Manual admin overrides
- Analytics dashboard
- Light premium SaaS UI
- Dockerized backend setup

---

## Git Safety

Never commit:

```
.env
.env.local
node_modules
dist
uploads
.DS_Store
```

Use `.env.example` and `.env.local.example` instead.

---

## Author

Built by Adeena Reeham
