# ClassDjib

**Your classroom, in your pocket.**

Phone-first classroom command center for Djiboutian teachers and students.

## Included in this build
- Responsive mobile-first React + TypeScript + Vite UI
- Teacher/student demo mode with role switching
- French / English / Arabic UI with live Arabic RTL
- Teacher dashboard, class cards, quick actions, student dashboard, tasks, notifications and profile
- PWA manifest + service worker foundation
- Supabase client bootstrap
- PostgreSQL schema with core classroom entities, indexes and initial RLS policies

## Run
```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add your Supabase URL/anon key to connect the client. The UI currently falls back to demo data when Supabase variables are absent.

## Next implementation phase
Wire the existing UI to Supabase Auth and the schema, then implement real class creation/joining, lessons, assignments, submissions, quizzes, attendance, grading, notifications and AI Edge Functions according to `docs/CLASSDJIB_MASTER_BUILD_PROMPT.md`.
