# Cheat Sheet Creator

Create, customize, and share printable cheat sheets.

This app uses `Next.js 16`, `React 19`, `Supabase`, `Tailwind CSS 4`, `Zustand`, and `dnd-kit` to power a drag-and-drop editor, public sheet viewer, auth flows, and dashboard management.

## Features

- Drag-and-drop cheat sheet editor with reorderable sections and items
- Color-coded sections and multiple layout column options
- Public share links via slug-based sheet URLs
- Print-friendly sheet viewer
- Toggle variants for content like `Mac` vs `Windows`
- Supabase auth, persistence, and row-level security
- Starter templates in `src/lib/data/templates.ts`

## Stack

- App framework: `Next.js 16` App Router
- UI: `React 19`, `Tailwind CSS 4`, `lucide-react`
- Data: `Supabase`
- State: `Zustand`
- Drag and drop: `@dnd-kit/*`

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Apply the database schema

Run the SQL in `supabase/migrations/001_initial_schema.sql:1` against your Supabase project.

This creates:

- `cheat_sheets`
- `sections`
- `items`
- row-level security policies for owners and public viewers

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` — start the local dev server
- `npm run build` — create a production build
- `npm run start` — run the production server
- `npm run lint` — run ESLint

## App Routes

- `/` — marketing home page
- `/signup` — sign up
- `/login` — sign in
- `/dashboard` — authenticated sheet list
- `/editor/[id]` — authenticated sheet editor
- `/sheet/[slug]` — public sheet viewer
- `/api/sheets` — list/create sheets
- `/api/sheets/[id]` — update/delete a sheet

## Project Structure

- `src/app` — App Router pages, API routes, auth callback
- `src/components/editor` — editor UI
- `src/components/viewer` — public sheet viewer UI
- `src/components/dashboard` — dashboard UI
- `src/lib/store/editor-store.ts` — editor state
- `src/lib/data/templates.ts` — starter templates
- `src/lib/supabase` — browser/server auth clients and proxy helpers
- `src/proxy.ts` — route protection and auth redirects
- `supabase/migrations` — database schema

## Notes

- The app protects `/dashboard` and `/editor/*` via `src/proxy.ts:1`.
- Public sheet access is controlled by the `is_public` flag and Supabase RLS policies.
- This repo uses Next.js 16 conventions, including `proxy.ts` instead of deprecated middleware naming.
