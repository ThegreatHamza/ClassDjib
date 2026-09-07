# ClassDjib

**Your classroom, in your pocket.**

Phone-first classroom command center for Djiboutian teachers and students.

## Completed classroom MVP
- Responsive mobile-first React + TypeScript + Vite UI
- French / English / Arabic switching with Arabic RTL
- Supabase Auth with persistent sessions and teacher/student onboarding
- Live PostgreSQL data protected by RLS
- Teacher class creation with generated join codes
- Student class joining
- Lessons, assignments, announcements
- Assignment submissions with optional file upload
- Teacher submission grading and feedback
- Multiple-choice quiz builder
- Server-side quiz auto-grading through a protected Supabase RPC
- Attendance roster with present/absent/late
- Gradebook data for students and teachers
- Realtime notification refresh
- Supabase Storage buckets for avatars, lesson resources, assignment submissions and school assets
- Installable PWA with offline shell
- GitHub Actions build verification workflow

## Supabase
The app is connected to the dedicated `ClassDjib` Supabase project in EU West 3 (Paris). The browser uses the Supabase publishable key and relies on RLS for authorization. Never put a service-role key in the frontend.

### AI teacher assistant
A JWT-protected Edge Function named `ai-teacher-assistant` is deployed. It uses Gemini when the Supabase secret `GEMINI_API_KEY` is configured. The function accepts `{ "prompt": "...", "language": "fr" }` and returns generated teacher material. The frontend API wrapper is ready at `teacherAI()`.

For another environment, copy `.env.example` to `.env.local` and provide:

```bash
VITE_SUPABASE_URL=https://neexmhqiungzvbszbzgr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Run
```bash
npm install
npm run dev
```

## Production checklist
1. Configure `GEMINI_API_KEY` as a Supabase Edge Function secret before using AI generation.
2. Keep RLS enabled on every public data table.
3. Keep service-role credentials out of browser code and GitHub.
4. Test signup, class joining, assignment submission/grading, quiz attempt, attendance and notifications with two test accounts.
5. Deploy the repository to Vercel or another static host and set the two Vite environment variables.

The application is now a functional classroom MVP rather than a demo-only UI. Production-scale hardening can continue independently (observability, richer analytics, parent/admin roles, and expanded content/resource management).
