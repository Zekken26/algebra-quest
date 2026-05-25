# Algebra Quest Forge

Algebra Quest Forge is a gamified algebra learning app with a teacher portal, student portal, quest guides, assigned quests, progress tracking, rewards, and leaderboards.

## Project Layout

- `backend/` - Express, Prisma, PostgreSQL, JWT/session API.
- `frontend/` - TanStack Start, React, Tailwind, teacher and student UI.

## Requirements

- Node.js 22+
- npm
- PostgreSQL

## Setup

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Create backend environment config:

   ```bash
   copy backend\.env.example backend\.env
   ```

3. Fill `backend/.env` with a PostgreSQL `DATABASE_URL` and a strong `JWT_SECRET`.

4. Run database migrations:

   ```bash
   npm --prefix backend run prisma:migrate
   ```

5. Optional seed data:

   ```bash
   npm --prefix backend run seed
   ```

## Development

Run the backend:

```bash
npm run dev:backend
```

Run the frontend:

```bash
npm run dev:frontend
```

By default, the frontend expects the API at `http://localhost:5000/api`. Set `VITE_API_URL` in a frontend `.env` file if needed.

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Main Flow

1. Teacher creates a class.
2. Teacher creates a quest guide and quest.
3. Teacher publishes/assigns the quest to the class.
4. Student joins with class code.
5. Student reads the guide, plays the quest, earns rewards, and appears in progress/leaderboard views.
