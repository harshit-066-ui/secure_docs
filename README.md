# Secure Cloud Document Management System

A full-stack document management application built with React, Node.js, Express, and Supabase.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth (JWT) |
| File Storage | Supabase Storage |

## Project Structure

```
intern_project/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase client setup
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers
│   │   └── server.js        # Express entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── lib/             # Supabase & API clients
│   │   ├── pages/           # Route pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── supabase/
│   └── schema.sql           # Database schema & RLS policies
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) account (free tier works)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning.

### 2. Set Up the Database

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Copy the contents of `supabase/schema.sql` and run it.
4. This creates the `users` and `documents` tables, RLS policies, and a storage bucket.

### 3. Configure Authentication

1. In Supabase, go to **Authentication → Providers**.
2. Ensure **Email** provider is enabled.
3. For local development, go to **Authentication → URL Configuration** and add:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
4. Optionally disable **Confirm email** under **Authentication → Providers → Email** for easier local testing.

### 4. Get Supabase API Keys

1. Go to **Project Settings → API**.
2. Copy:
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only, keep secret)

### 5. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials

npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### 6. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your Supabase credentials

npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (`development` / `production`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:5173) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_URL` | Backend API URL (default: http://localhost:5000/api) |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/users/me` | Yes | Get current user profile |
| GET | `/api/users/dashboard` | Yes | Get dashboard data & stats |
| GET | `/api/documents` | Yes | List user documents |
| POST | `/api/documents/upload` | Yes | Upload a document |
| GET | `/api/documents/:id/download` | Yes | Get signed download URL |
| DELETE | `/api/documents/:id` | Yes | Delete a document |

All protected routes require a `Authorization: Bearer <jwt_token>` header.

## Features

- User registration and login via Supabase Auth
- JWT-based protected routes (frontend & backend)
- User dashboard with document count and storage stats
- Document upload, download, and delete
- Row Level Security on database tables
- Per-user file isolation in Supabase Storage

## Running Locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Visit `http://localhost:5173` in your browser.

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.
- The service role key bypasses RLS and is used only on the backend.
- RLS policies ensure users can only access their own data.
- File uploads are limited to 10 MB per file.

## License

MIT
