# Nexus — Enterprise Project Management

A full-stack project management application with a Kanban board, team collaboration, activity tracking, and more. Built with pure JavaScript — React frontend, Express + MongoDB backend.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Express, Mongoose, JWT auth, bcryptjs |
| Database | MongoDB (MongoDB Memory Server for development) |

## Features

- **Authentication** — Register, login, JWT-based sessions, profile editing
- **Dashboard** — Overview of projects, task counts, recent activity
- **Projects** — Create, edit, delete projects; add/remove team members
- **Kanban Board** — Drag-and-drop tasks across Todo / In Progress / Done columns
- **Tasks** — Create, assign, prioritize, comment on, and delete tasks
- **Team** — View all users, manage project membership
- **Activity Feed** — Automatic tracking of project and task actions
- **Settings** — Update name, email, and avatar

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (or use the bundled in-memory server)

### Install & Run

**Backend** (port 5000):

```bash
cd server
npm install
npm start
```

The server connects to `mongodb://127.0.0.1:27019/nexus` by default. Override with `MONGO_URI` in a `server/.env` file if needed.

**Frontend** (port 5173):

```bash
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:5000` so the frontend and backend share one origin in development.

### Environment Variables

Create `server/.env` (optional):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27019/nexus
JWT_SECRET=your_secret_here
```

The frontend uses a single variable in `.env`:

```
VITE_API_URL=/api
```

## API Reference

All `/api` routes except `/auth/register` and `/auth/login` require a `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (`name`, `email`, `password`) |
| POST | `/api/auth/login` | Login (`email`, `password`) → returns JWT |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update profile (`name`, `email`) |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project (`name`, `description`, `color`) |
| GET | `/api/projects/:id` | Get single project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/members` | List project members |
| POST | `/api/projects/:id/members` | Add member (`userId`) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/:projectId` | List tasks for a project |
| POST | `/api/tasks/:projectId` | Create task (`title`, `status`, `priority`, `assigneeId`) |
| PATCH | `/api/tasks/:projectId/:taskId` | Update task (status, title, etc.) |
| DELETE | `/api/tasks/:projectId/:taskId` | Delete task |
| GET | `/api/tasks/counts` | Get task counts by status across all projects |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:taskId` | List comments on a task |
| POST | `/api/comments/:taskId` | Add comment (`text`) |
| DELETE | `/api/comments/:commentId` | Delete comment |

### Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity/:projectId` | Get activity feed for a project |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all registered users |

## Project Structure

```
project/
├── server/                   # Express + MongoDB backend
│   ├── config/               # DB connection & app config
│   ├── controllers/          # Request handlers
│   ├── middleware/           # JWT auth & error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route definitions
│   └── server.js             # Entry point
├── src/                      # React frontend
│   ├── components/           # Layout & reusable UI components
│   ├── contexts/             # Auth context provider
│   ├── hooks/                # Data-fetching hooks
│   ├── lib/                  # API client, constants, utils
│   ├── pages/                # Dashboard, Board, Projects, etc.
│   ├── App.jsx               # Root component with routing
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind + global styles
├── vite.config.js            # Vite config with API proxy
└── package.json              # Frontend dependencies
```

## Build

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## License

Private project. All rights reserved.
