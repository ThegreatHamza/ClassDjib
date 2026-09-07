# ClassDjib

**Your classroom, in your pocket.**

Phone-first classroom command center for Djiboutian teachers and students.

## Current build
- Responsive mobile-first React + TypeScript + Vite UI
- French / English / Arabic-ready foundation
- Supabase Auth with persistent browser sessions
- Live PostgreSQL data protected by Supabase RLS
- Teacher class creation with generated join codes
- Student class joining with join codes
- Live lessons, assignments, quizzes and announcements
- Assignment submission service
- Attendance and grade data services
- Notifications and read-state service
- Profile service
- PWA foundation

## Supabase
The app is connected to the dedicated `ClassDjib` Supabase project in EU West 3 (Paris). The browser uses the Supabase publishable key and relies on RLS for authorization. Never put a service-role key in the frontend.

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

## Main live workflows
1. Register or sign in.
2. Teacher creates a class and shares its join code.
3. Student registers and joins using the code.
4. Teacher publishes lessons, assignments, quizzes and announcements.
5. Classroom data is read and written directly through Supabase with RLS enforcement.
6. Notifications and profile data are persisted in PostgreSQL.

The next phase can add the richer quiz builder/auto-grading UI, attendance roster, gradebook, file storage, realtime notifications and AI Edge Functions.
