# AI Study Tutor

AI Study Tutor is a personalized learning platform in active development. It provides a responsive Next.js application shell, secure email/password authentication, a private study-material library, document extraction, semantic retrieval, and a protected student dashboard.

## Current capabilities

- Account registration and login with validated credentials and bcrypt password hashes
- Secure, `httpOnly`, server-side sessions stored as SHA-256 token hashes
- PostgreSQL/Prisma user and session models with referential integrity and indexes
- Secure PDF, DOCX, PPTX, and TXT upload with 15 MB size limits
- Server-side text extraction, cleanup, overlapping chunks, OpenAI embeddings, and pgvector storage
- Ownership-scoped semantic search that never searches another user's material
- AI Tutor chat with beginner, intermediate, advanced, and exam explanation modes
- Source-grounded responses and persistent per-user chat sessions
- Protected dashboard and navigation shell for materials, tutor, quizzes, flashcards, plans, progress, and settings
- Responsive Tailwind UI with reusable shadcn-compatible component conventions

The material-processing, RAG, quiz, flashcard, study-plan, and analytics workflows are intentionally presented as upcoming work until their real persistence and AI integrations are implemented.

## Architecture

```text
Browser -> Next.js App Router -> API routes -> Prisma -> PostgreSQL
                              -> secure httpOnly session cookie
```

The application keeps authentication and database operations server-side. Browser code only calls the authentication endpoints; it never receives database credentials or application secrets.

## Tech stack

- Next.js with TypeScript and App Router
- Tailwind CSS and reusable UI primitives
- PostgreSQL with Prisma
- Zod validation
- OpenAI embeddings and pgvector
- Vitest

## Run locally

### 1. Prerequisites

Install Node.js 20.9 or later, npm, PostgreSQL 15 or later, and the [pgvector](https://github.com/pgvector/pgvector) PostgreSQL extension.

### 2. Configure environment variables

Copy `.env.example` to `.env` and provide values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_study_tutor?schema=public"
AUTH_SECRET="replace-with-a-random-32-byte-secret"
OPENAI_API_KEY=""
```

`AUTH_SECRET` must contain at least 32 random characters. `OPENAI_API_KEY` is required to process uploads and run semantic search. Never commit `.env`.

### 3. Install and initialize the database

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
```

### 4. Start the application

```bash
npm run dev
```

Open `http://localhost:3000`, create an account, and you will be redirected to the protected dashboard.

## Deploy (Vercel)

1. Create a Postgres database with pgvector (Neon or Supabase) and run `CREATE EXTENSION IF NOT EXISTS vector;`.
2. Import this repository at [vercel.com/new](https://vercel.com/new). `vercel.json` sets the build command to generate the Prisma client, apply migrations, and build.
3. Add environment variables in Vercel: `DATABASE_URL` (use a direct, non-pooled connection so migrations can run), `AUTH_SECRET` (32+ random characters, e.g. `openssl rand -base64 32`), and `OPENAI_API_KEY`.
4. Deploy, then open the generated URL or attach a custom domain.

## Database and pgvector

The initial migration enables `vector`, then creates `User`, `Session`, `Document`, and `DocumentChunk` models. `DocumentChunk.embedding` uses `vector(1536)` and an ivfflat cosine-distance index, matching `text-embedding-3-small`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run linting |
| `npm run build` | Create a production build |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:push` | Synchronize the schema without creating a migration |
| `npm test` | Run tests |

## Project structure

```text
prisma/                 Prisma schema
src/app/                Pages and API route handlers
src/components/         UI, authentication, and dashboard components
src/lib/                Prisma, authentication, validation, and utilities
```

## API overview

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/register` | `POST` | Validates input, creates an account, and begins a session |
| `/api/auth/login` | `POST` | Validates credentials and begins a session |
| `/api/auth/logout` | `POST` | Revokes the current server-side session |

## Roadmap

1. Quiz generation, evaluation, and progress persistence.
2. Flashcards, adaptive study plans, analytics, and recommendations.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
