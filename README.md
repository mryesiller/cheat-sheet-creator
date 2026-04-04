# Cheat Sheet Creator

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Database-3ecf8e)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

Create clean, printable, shareable cheat sheets in minutes.

This project is a small web app for people who want to turn scattered notes into something structured and easy to use. Instead of keeping shortcuts, commands, reference notes, or quick reminders in messy documents, you can build them visually, organize them by section, and publish them with a simple public link.

## What It Does

Cheat Sheet Creator lets you:

- create cheat sheets with a drag-and-drop editor
- group content into color-coded sections
- share sheets with a public URL
- keep private sheets in your own dashboard
- use ready-made templates to start faster
- generate print-friendly layouts
- switch shortcut display behavior for OS-specific viewing

## Why It Feels Useful

This app is built for practical, everyday reference material:

- keyboard shortcuts
- Git and terminal commands
- CSS and frontend references
- internal team onboarding notes
- study summaries
- process checklists

The goal is speed and clarity. You should be able to go from idea to usable reference sheet without fighting a heavy editor.

## Product Flow

1. Sign up or log in
2. Open your dashboard
3. Start from scratch or choose a template
4. Rearrange sections and content visually
5. Adjust layout and visibility
6. Share the public page or print it

## Core Experience

### Visual editor

The editor is designed around direct manipulation. You can add sections, reorder them, change layout columns, and edit content inline without moving through a complicated CMS-style workflow.

### Template-first creation

Templates are there to help users start quickly instead of staring at an empty screen. They are especially useful for common reference formats like Git, VS Code shortcuts, or CSS layout notes.

### Shareable output

Every public cheat sheet gets its own slug-based route, so the final result is easy to bookmark, print, or send to someone else.

### Auth and ownership

Users manage their own sheets through Supabase authentication and row-level security. Public viewers can only access sheets that were explicitly shared.

## Built With

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase
- Zustand
- dnd-kit
- TypeScript

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Apply the Supabase schema

Run the SQL migrations in `supabase/migrations`.

At minimum, apply:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_api_rate_limits.sql`

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Routes

- `/` - landing page
- `/signup` - account creation
- `/login` - sign in
- `/dashboard` - private sheet list
- `/editor/[id]` - sheet editor
- `/sheet/[slug]` - public viewer

## Notes For Deployment

- Supabase Auth redirect URLs should include your deployed callback URL, for example:
  - `https://your-domain.com/callback`
- Google OAuth should still point to your Supabase callback endpoint:
  - `https://<your-project-ref>.supabase.co/auth/v1/callback`
- The app currently enforces a free-tier style sheet limit and API rate limits

## Current Highlights

- public/private visibility support
- drag-and-drop editing
- print-friendly viewer
- dashboard-level feedback and notifications
- dark mode support
- free-plan limits and rate limiting

## Future-Friendly Areas

This project is already a solid base for:

- richer template packs
- collaborative editing
- export formats
- team workspaces
- monetization tiers

## License

Add the license you want before publishing publicly.
