# ClassDjib — Complete Master Build Prompt

## 1. ROLE

You are an expert full-stack product engineer, UI/UX designer, database architect, Supabase engineer, and mobile-first webapp developer.

Your task is to design and build a production-quality web application called:

**ClassDjib**

**Tagline:** Your classroom, in your pocket.

ClassDjib is a phone-first classroom management and learning platform initially designed for teachers and students in Djibouti.

The application should make it possible for a teacher to manage their classroom from a smartphone:

**Plan → Teach → Assign → Test → Grade → Analyze → Improve**

Students should have their own simple mobile experience for:

**Learn → Practice → Submit → Test → Track Progress**

The application must be architected so that it can eventually expand to schools, parents, administrators, and other countries.

---

## 2. IMPORTANT PRODUCT PRINCIPLE

Do not build ClassDjib as a generic complicated school administration system.

The product should feel like:

> A simple mobile classroom command center with an intelligent AI teaching assistant.

A teacher should be able to open the app on a phone and immediately understand:

- What classes do I have today?
- What do I need to prepare?
- Which assignments need grading?
- How are my students performing?
- What should I teach next?

A student should immediately understand:

- What do I need to learn?
- What homework is due?
- Which quizzes do I need to take?
- What are my results?
- How am I progressing?

---

## 3. TARGET MARKET

The initial target market is:

**Djibouti 🇩🇯**

Primary users:

- Teachers
- Students

The application should be culturally and educationally appropriate for Djibouti without unnecessarily hardcoding the platform to Djibouti.

Design the architecture so other countries can be supported later.

---

## 4. PHONE-FIRST REQUIREMENT

This is a mobile-first webapp.

Do NOT design a desktop application and then shrink it for mobile.

Design the primary experience for:

- Android phones
- 360px–430px screen widths
- Touch interaction
- Portrait orientation
- Mobile browsers
- Installable PWA

Desktop and tablet layouts should adapt from the mobile design.

The most important workflows must work beautifully on a phone.

---

## 5. LOW-BANDWIDTH DESIGN

Assume some users may have:

- Limited mobile data
- Slow connections
- Older Android devices
- Intermittent connectivity

Therefore:

- Keep the JavaScript bundle reasonable.
- Optimize images.
- Lazy-load large resources.
- Avoid autoplay video.
- Paginate large lists.
- Avoid unnecessary database requests.
- Cache static resources.
- Use optimized queries.
- Avoid loading entire tables.
- Use compressed assets.
- Provide useful loading states.
- Make the app usable even when a connection temporarily becomes unstable.

Implement offline functionality only where it can be done reliably.

Do not falsely claim that data is synchronized offline if it is not.

---

## 6. LANGUAGES

The application must support three interface languages from V1:

🇫🇷 French

🇬🇧 English

🇸🇦 Arabic

French should be the default language for new users.

Users must be able to change language at any time.

Language selector locations:

- Onboarding
- Login
- Signup
- Profile
- Settings

Display native language names:

- Français
- English
- العربية

Do not rely solely on flags to represent languages.

---

## 7. RTL ARABIC

When Arabic is selected:

- Entire UI switches to RTL.
- Navigation switches appropriately.
- Text aligns correctly.
- Forms support RTL.
- Cards and layouts remain coherent.
- Directional icons are handled appropriately.
- Dialogs and menus support RTL.

Use `dir="rtl"` for Arabic.

Use `dir="ltr"` for French and English.

Changing languages must immediately update the interface without requiring logout.

---

## 8. INTERNATIONALIZATION

Do not hardcode UI text inside components.

Use an internationalization architecture.

Example:

```text
src/
  i18n/
    index.ts
    locales/
      fr.json
      en.json
      ar.json
```

Every user-facing interface string must have:

- French translation
- English translation
- Arabic translation

Translate:

- Authentication
- Navigation
- Dashboard
- Classes
- Students
- Lessons
- Assignments
- Quizzes
- Attendance
- Grades
- Notifications
- Settings
- Errors
- Success messages
- Empty states
- Buttons
- Forms
- Validation messages

The selected language should be stored in the user's profile.

---

## 9. IMPORTANT LANGUAGE RULE

Changing the interface language should NOT automatically translate teacher-created educational content.

For example, if a teacher creates **“Les fractions”** in French, switching the interface to English should translate the UI but should not silently change the lesson itself.

Future versions may provide optional AI translation.

---

## 10. AI LANGUAGE BEHAVIOR

AI-generated content must respect the teacher's selected generation language.

Support:

- French
- English
- Arabic

Example:

Teacher chooses:

**Language: French**

AI generates the lesson in French.

Teacher chooses:

**Language: Arabic**

AI generates it in Arabic.

Allow the teacher to override the interface language and select the content-generation language.

---

## 11. TECHNOLOGY STACK

Use:

### Frontend

- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- shadcn/ui or equivalent accessible component library
- Lucide icons

Prefer Next.js App Router if it provides clear architectural benefits.

### Backend

Use **Supabase**.

Supabase provides:

- PostgreSQL
- Authentication
- Row Level Security
- Storage
- Realtime
- Edge Functions where appropriate

Do not introduce an unnecessary separate backend.

---

## 12. SUPABASE AUTHENTICATION

Use Supabase Auth.

Support:

- Email/password
- Phone authentication if practical
- Password reset
- Persistent sessions
- Logout
- Secure authentication state

After signup, create a corresponding `profiles` record.

Never trust a client-provided user ID for authorization.

---

## 13. USER ROLES

Initial roles:

- Teacher
- Student

Architecturally support:

- Parent
- School Administrator
- Super Administrator

Do not build unnecessary parent/admin features into V1 unless required.

---

## 14. DATABASE SCHEMA

Create a properly normalized PostgreSQL schema.

### profiles

- id UUID PRIMARY KEY REFERENCES auth.users(id)
- full_name
- avatar_url
- phone
- preferred_language
- role
- created_at
- updated_at

Roles:

- teacher
- student
- parent
- admin

### schools

- id
- name
- city
- country
- logo_url
- created_at
- updated_at

Default country: **Djibouti**.

Do not hardcode Djibouti into database logic.

### subjects

- id
- name
- code
- description
- created_at

Examples:

- Mathematics
- French
- Arabic
- English
- Physics
- Chemistry
- Biology
- History
- Geography

### classes

- id
- school_id
- teacher_id
- name
- grade_level
- subject_id
- academic_year
- description
- join_code
- created_at
- updated_at

Examples:

- 6ème A
- 5ème B
- 3ème A
- Terminale C

### class_students

- id
- class_id
- student_id
- joined_at
- status

Statuses:

- active
- inactive

Prevent duplicate memberships.

---

## 15. LESSONS

### lessons

- id
- class_id
- teacher_id
- subject_id
- title
- description
- learning_objectives
- content
- lesson_date
- duration_minutes
- status
- created_at
- updated_at

Statuses:

- draft
- published
- completed

---

## 16. LESSON RESOURCES

### lesson_resources

- id
- lesson_id
- title
- resource_type
- file_url
- external_url
- created_at

Types:

- PDF
- document
- image
- video
- link
- presentation

Store files in Supabase Storage.

---

## 17. ASSIGNMENTS

### assignments

- id
- class_id
- teacher_id
- lesson_id
- title
- description
- instructions
- due_date
- max_score
- status
- created_at
- updated_at

Statuses:

- draft
- published
- closed

---

## 18. ASSIGNMENT SUBMISSIONS

### assignment_submissions

- id
- assignment_id
- student_id
- submission_text
- file_url
- submitted_at
- score
- teacher_feedback
- status

Statuses:

- submitted
- graded
- late
- returned

A student can only modify their own submission according to the assignment rules.

---

## 19. QUIZZES

### quizzes

- id
- class_id
- teacher_id
- lesson_id
- title
- description
- instructions
- time_limit_minutes
- max_score
- published
- created_at
- updated_at

---

## 20. QUIZ QUESTIONS

### quiz_questions

- id
- quiz_id
- question_text
- question_type
- points
- order_index
- explanation
- created_at

Question types:

- multiple_choice
- true_false
- short_answer
- matching

---

## 21. QUIZ OPTIONS

### quiz_options

- id
- question_id
- option_text
- is_correct
- order_index

Correct answers must never be exposed to unauthorized students.

---

## 22. QUIZ ATTEMPTS

### quiz_attempts

- id
- quiz_id
- student_id
- started_at
- submitted_at
- score
- status

Statuses:

- in_progress
- submitted
- graded

---

## 23. QUIZ ANSWERS

### quiz_answers

- id
- attempt_id
- question_id
- selected_option_id
- answer_text
- is_correct
- points_awarded

---

## 24. ATTENDANCE

### attendance

- id
- class_id
- student_id
- date
- status
- note
- recorded_by
- created_at

Statuses:

- present
- absent
- late
- excused

Create a database constraint preventing duplicate attendance records for the same **student + class + date**.

---

## 25. ANNOUNCEMENTS

### announcements

- id
- class_id
- teacher_id
- title
- message
- created_at

---

## 26. GRADES

### grades

- id
- student_id
- class_id
- assignment_id
- quiz_id
- score
- max_score
- feedback
- created_at
- updated_at

Allow `assignment_id` and `quiz_id` to be nullable as appropriate.

---

## 27. NOTIFICATIONS

### notifications

- id
- user_id
- title
- message
- type
- read
- created_at

Types:

- assignment
- quiz
- grade
- announcement
- reminder
- system

---

## 28. DATABASE SECURITY

Implement comprehensive Supabase Row Level Security.

### Teachers can:

- Manage their own profile.
- Create and manage their own classes.
- View students belonging to their classes.
- Create and manage lessons for their classes.
- Create and manage assignments.
- Create and manage quizzes.
- Record attendance.
- Grade submissions.
- Publish announcements.
- Manage resources belonging to their classes.

Teachers must not access unrelated private classroom data.

### Students can:

- View their own profile.
- View classes they belong to.
- View published lessons in their classes.
- View published assignments.
- Submit their own assignments.
- Take quizzes.
- View their own grades.
- View their own attendance.
- View class announcements.

Students must NEVER be able to:

- Modify grades.
- Modify attendance.
- Modify teacher-created answer keys.
- See other students' private grades.
- Access unauthorized teacher data.

---

## 29. SUPABASE STORAGE

Create buckets for:

- avatars
- lesson-resources
- assignment-submissions
- school-assets

Implement appropriate Storage policies.

Students should only access resources they are authorized to access.

Teachers should only manage resources they are authorized to manage.

---

## 30. SECURITY SECRETS

Create:

`.env.example`

Use environment variables such as:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never commit real secrets.

Never expose the Supabase service-role key in client-side code.

If server-side secrets are required, keep them server-side.

---

## 31. TEACHER ONBOARDING

After registration:

### Step 1
Welcome screen.

### Step 2
Choose:

**Teacher**

### Step 3
Create first class:

- Class name
- Grade
- Subject
- Academic year

### Step 4
Generate a class join code.

Example:

`MATH8A`

### Step 5
Show:

**Share this code with your students.**

### Step 6
Take the teacher to the class dashboard.

The entire process should take approximately two minutes.

---

## 32. STUDENT ONBOARDING

After signup:

Display:

**Join a class**

Enter:

**Class Code**

Example:

`MATH8A`

After joining, show:

- Teacher
- Class
- Subject
- Upcoming assignments
- Upcoming quizzes
- Latest lesson

Students can belong to multiple classes.

---

## 33. TEACHER HOME DASHBOARD

The teacher dashboard must answer:

**“What do I need to do today?”**

Show:

- Today's classes
- Upcoming assignments
- Upcoming quizzes
- Recent submissions
- Pending grading
- Attendance reminders
- Recent performance

Quick actions:

- Create Lesson
- Create Assignment
- Create Quiz
- Take Attendance
- View Results
- AI Assistant

---

## 34. TEACHER BOTTOM NAVIGATION

Use:

**Home | Classes | + Create | Notifications | Profile**

The central Create button should provide:

- Lesson
- Assignment
- Quiz
- Announcement

---

## 35. CLASS DASHBOARD

When the teacher opens a class:

Show:

- Class name
- Subject
- Teacher
- Number of students
- Join code

Navigation:

- Overview
- Students
- Lessons
- Assignments
- Quizzes
- Attendance
- Grades
- Resources

---

## 36. CLASS OVERVIEW

Show:

- Attendance rate
- Average grade
- Assignment completion
- Upcoming work
- Recent activity
- Students requiring attention

Keep analytics simple and readable on mobile.

---

## 37. STUDENT MANAGEMENT

Teachers can:

- Add students
- Remove students
- View students
- Search students
- View individual performance
- Record notes

Student profile includes:

- Name
- Avatar
- Attendance
- Average grade
- Assignment performance
- Quiz performance
- Progress

Private teacher notes must remain private.

---

## 38. LESSON PLANNER

Create a mobile-friendly lesson builder.

Fields:

- Class
- Subject
- Topic
- Objectives
- Duration
- Date
- Content
- Activities
- Homework
- Resources

Actions:

- Save Draft
- Publish
- Duplicate
- Edit

---

## 39. AI LESSON GENERATOR

Create:

**AI Lesson Generator**

Teacher enters:

- Grade
- Subject
- Topic
- Duration
- Difficulty
- Language

Example:

```text
Grade 8
Mathematics
Fractions
45 minutes
Intermediate
French
```

AI should generate:

- Learning objectives
- Introduction
- Explanation
- Examples
- Classroom activity
- Practice exercises
- Assessment
- Homework

Teacher must be able to:

- Edit
- Regenerate
- Remove sections
- Add sections
- Save
- Publish

AI output must never automatically become published classroom material without teacher review.

---

## 40. AI ASSISTANT

Create a general teacher AI assistant.

Possible requests:

- “Explain this topic more simply.”
- “Create five additional exercises.”
- “Give me a classroom activity.”
- “Create homework based on this lesson.”
- “Make this explanation suitable for Grade 7.”
- “Create a quiz from this lesson.”
- “Translate this lesson into Arabic.”

The AI should have access only to data the authenticated teacher is authorized to use.

---

## 41. ASSIGNMENT BUILDER

Teacher creates:

- Title
- Description
- Instructions
- Files
- Due date
- Maximum score
- Associated lesson

Teacher can:

- Save draft
- Publish
- Edit
- Close

---

## 42. STUDENT ASSIGNMENT EXPERIENCE

Students see:

- Assignment title
- Instructions
- Due date
- Attached resources
- Submission area
- Submission status
- Grade
- Teacher feedback

Support:

- Text submission
- File submission where appropriate

---

## 43. QUIZ BUILDER

Create a visual quiz editor.

Question types:

- Multiple choice
- True/False
- Short answer
- Matching

Each question supports:

- Question
- Options
- Correct answer
- Points
- Explanation

Allow:

- Reordering
- Editing
- Duplicating
- Deleting

---

## 44. AI QUIZ GENERATOR

Teacher enters:

- Subject
- Grade
- Topic
- Number of questions
- Difficulty
- Language

AI generates:

- Questions
- Options
- Correct answers
- Explanations
- Points

Teacher must review before publishing.

---

## 45. STUDENT QUIZ EXPERIENCE

The quiz interface must be optimized for phones.

Show:

- Quiz title
- Question
- Progress
- Answer options
- Previous
- Next
- Submit

Prevent accidental submission.

Before final submission:

> Are you sure you want to submit?

After submission:

Automatically grade objective questions.

---

## 46. GRADING

Automatically grade:

- Multiple choice
- True/False
- Matching

Short-answer questions may require teacher review.

Teacher sees:

- Student
- Score
- Percentage
- Correct answers
- Incorrect answers
- Feedback

---

## 47. QUIZ ANALYTICS

Show:

- Class average
- Highest score
- Lowest score
- Pass rate
- Question difficulty
- Most frequently missed questions

Example:

> Question 7 was answered incorrectly by 68% of students.

Use this to help teachers identify concepts that need additional explanation.

---

## 48. ATTENDANCE

Make attendance extremely fast.

Teacher selects:

**Class → Attendance**

List all students.

Each student:

- Present
- Absent
- Late
- Excused

Include:

**Mark Everyone Present**

Then allow individual changes.

The goal is for attendance to take less than one minute.

---

## 49. STUDENT DASHBOARD

Student home screen should show:

**Good morning, [Name]**

Then:

- Today's lessons
- Upcoming assignments
- Upcoming quizzes
- Recent grades
- Attendance
- Progress

Quick access:

- My Classes
- Assignments
- Quizzes
- Grades
- Resources

---

## 50. STUDENT BOTTOM NAVIGATION

Use:

**Home | Classes | Tasks | Notifications | Profile**

---

## 51. STUDENT CLASS PAGE

Show:

- Teacher
- Subject
- Class
- Lessons
- Assignments
- Quizzes
- Resources
- Grades

Only show information the student is authorized to see.

---

## 52. STUDENT PROGRESS

Create a simple progress dashboard.

Show:

- Average performance
- Assignment completion
- Quiz results
- Attendance
- Recent results
- Progress over time

Use encouraging, neutral language.

Never publicly shame students.

Avoid labels such as:

- “Worst student”

or other humiliating classifications.

---

## 53. TEACHER ANALYTICS

Teachers should see:

- Class average
- Attendance
- Assignment completion
- Quiz performance
- Student progress
- Difficult topics
- Students needing additional support

Analytics should be useful rather than decorative.

---

## 54. AI LEARNING ANALYSIS

Future-ready architecture should support AI analysis of classroom performance.

Example:

If many students repeatedly miss questions involving denominators, the system may suggest:

> “Students appear to need additional practice with common denominators.”

The AI should provide recommendations rather than making high-stakes decisions about students.

---

## 55. REPORTS

Allow teachers to generate student performance reports.

Report contains:

- Student
- Class
- Attendance
- Assignments
- Quizzes
- Average
- Teacher feedback

Prepare architecture for future PDF export.

---

## 56. ANNOUNCEMENTS

Teachers can send announcements to an entire class.

Examples:

- “Tomorrow's class starts at 8:00.”
- “Remember to bring your mathematics exercise book.”

Students receive the announcement in their notification center.

---

## 57. NOTIFICATIONS

Students receive notifications for:

- New lesson
- New assignment
- Assignment deadline
- New quiz
- New grade
- Teacher announcement

Teachers receive notifications for:

- Assignment submission
- Quiz completion
- Pending grading

Use Supabase Realtime where appropriate.

---

## 58. RESOURCE LIBRARY

Teachers can upload:

- PDFs
- Documents
- Images
- Presentations
- Links
- Videos

Organize by:

- Class
- Subject
- Lesson
- Resource type

Students can access resources assigned to their classes.

---

## 59. GLOBAL SEARCH

Teacher search:

- Students
- Classes
- Lessons
- Assignments
- Quizzes
- Resources

Student search:

- Lessons
- Assignments
- Resources

Use debounced search and pagination.

---

## 60. PWA

ClassDjib must be installable as a Progressive Web App.

Implement:

- Web manifest
- App icons
- Service worker
- Installable Android experience
- Mobile splash experience
- Sensible caching
- Offline-friendly application shell

The installed experience should feel as close as reasonably possible to a native mobile application.

---

## 61. RESPONSIVE DESIGN

Priority order:

1. Mobile
2. Tablet
3. Desktop

Desktop should provide a wider dashboard, but mobile remains the design source of truth.

Do not create completely separate interfaces unless necessary.

---

## 62. MOBILE UI DESIGN

Use:

- Bottom navigation
- Cards
- Large buttons
- Clear typography
- Touch-friendly controls
- Floating/central Create action
- Sticky important actions
- Search
- Tabs
- Bottom sheets where appropriate

Avoid:

- Tiny buttons
- Dense desktop tables
- Excessive menus
- Huge forms
- Unnecessary popups
- Horizontal scrolling whenever possible

---

## 63. VISUAL DESIGN

ClassDjib should feel:

- Modern
- Friendly
- Professional
- Trustworthy
- Educational
- Lightweight

Use a consistent design system.

Suggested components:

- Cards
- Buttons
- Badges
- Tabs
- Bottom sheets
- Modals
- Toasts
- Progress indicators
- Empty states
- Skeleton loaders

Avoid making the application look like an old-fashioned school administration system.

---

## 64. EMPTY STATES

Every important page needs a useful empty state.

Example:

No classes:

> You haven't created a class yet.

Button:

**Create your first class**

No assignments:

> No assignments yet.

Button:

**Create assignment**

No students:

> Students can join using your class code.

---

## 65. LOADING STATES

Use:

- Skeleton loaders
- Spinners for short actions
- Disabled buttons while submitting
- Clear progress indicators

Never leave users wondering whether their action worked.

---

## 66. ERROR HANDLING

Never expose raw Supabase/database errors to users.

Instead:

> We couldn't save your lesson. Please check your connection and try again.

Success:

> Lesson published successfully.

Handle:

- Network errors
- Authentication errors
- Validation errors
- Permission errors
- Storage errors
- Database errors

---

## 67. VALIDATION

Validate all important forms.

Examples:

- Required fields
- Valid dates
- Valid scores
- Valid class codes
- File size/type restrictions
- Assignment deadlines
- Quiz configuration

Validate on both appropriate client and server/database layers.

---

## 68. ACCESSIBILITY

Follow accessible design principles.

Support:

- Adequate contrast
- Keyboard navigation
- Screen readers
- Visible focus states
- Accessible labels
- Large touch targets
- Semantic HTML
- Appropriate ARIA where needed

---

## 69. DATE AND NUMBER LOCALIZATION

Use locale-aware formatting.

French example:

**7 septembre 2026**

English:

**September 7, 2026**

Arabic:

Use appropriate Arabic locale formatting.

Do not hardcode date formats.

---

## 70. PERFORMANCE

Optimize:

- Initial load
- Navigation
- Database queries
- Image loading
- Search
- Dashboard rendering

Use:

- Pagination
- Lazy loading
- Caching
- Debounced search
- Database indexes
- Efficient joins
- Optimized Supabase queries

---

## 71. DATABASE INDEXES

Create indexes for commonly queried fields, including:

- `classes.teacher_id`
- `class_students.student_id`
- `class_students.class_id`
- `lessons.class_id`
- `assignments.class_id`
- `quizzes.class_id`
- `attendance.class_id`
- `attendance.student_id`
- `grades.student_id`
- `notifications.user_id`

Add additional indexes based on query patterns.

---

## 72. AUDITABILITY

Design the system so important actions can eventually be audited.

Examples:

- Grade changes
- Attendance changes
- Assignment publication
- Quiz publication

If implementing audit logs, restrict access appropriately.

---

## 73. PRIVACY

Treat student data as sensitive educational information.

Do not expose:

- Student private grades
- Teacher private notes
- Other students' information
- Unauthorized submissions

Use least-privilege access.

---

## 74. AI SAFETY & CONTROL

AI should assist teachers, not replace teacher judgment.

AI-generated:

- Lessons
- Questions
- Exercises
- Feedback
- Recommendations

must be reviewable by the teacher.

Do not automatically make consequential decisions about students.

---

## 75. FUTURE ARCHITECTURE

Do not overbuild V1, but keep the architecture extensible for:

### Parents

Parents could eventually see:

- Attendance
- Grades
- Assignments
- Teacher feedback

### Schools

Schools could eventually manage:

- Teachers
- Classes
- Students
- Subjects
- Academic years
- Reports

### AI Tutor

Students could eventually have an AI learning assistant.

### Curriculum Engine

Eventually connect lessons and assessments to curriculum standards.

### Payments

Potential future subscription system.

Do not implement these unnecessarily in the first version.

---

## 76. MVP PRIORITY

Build V1 around the following core workflow:

### TEACHER

Register

↓

Create class

↓

Get class code

↓

Students join

↓

Create lesson

↓

Create assignment

↓

Create quiz

↓

Take attendance

↓

Grade

↓

View results

↓

Analyze progress

---

### STUDENT

Register

↓

Join class

↓

View lesson

↓

Complete assignment

↓

Take quiz

↓

Receive grade

↓

Track progress

---

## 77. V1 FEATURE PRIORITY

### MUST HAVE

- Authentication
- Teacher accounts
- Student accounts
- Classes
- Class join codes
- Student management
- Lessons
- Assignments
- Assignment submissions
- Quizzes
- Quiz questions
- Automatic grading
- Attendance
- Grades
- Announcements
- Notifications
- Teacher dashboard
- Student dashboard
- Supabase backend
- RLS security
- Supabase Storage
- French
- English
- Arabic
- Arabic RTL
- Responsive mobile UI
- PWA foundation

### HIGH PRIORITY

- AI lesson generator
- AI quiz generator
- Teacher AI assistant
- Analytics
- Resource library
- Search

### FUTURE

- Parents
- Schools
- Advanced curriculum management
- AI tutor
- Advanced reporting
- Payments
- Multi-country support

---

## 78. PROJECT STRUCTURE

Use a clean scalable architecture.

Example:

```text
src/
  components/
  pages/
  layouts/
  features/
    auth/
    classes/
    students/
    lessons/
    assignments/
    quizzes/
    attendance/
    grades/
    notifications/
    analytics/
    ai/
  hooks/
  lib/
    supabase/
  services/
  types/
  utils/
  i18n/
    locales/
      fr.json
      en.json
      ar.json
```

Organize by feature where practical.

Avoid putting the entire application into a few giant components.

---

## 79. TYPESCRIPT

Use TypeScript throughout.

Create strongly typed models for:

- User
- Profile
- Class
- Student
- Lesson
- Assignment
- Submission
- Quiz
- Question
- Attempt
- Attendance
- Grade
- Notification

Avoid unnecessary `any`.

---

## 80. SUPABASE TYPES

Generate/use Supabase database types where practical so frontend code remains synchronized with the database schema.

---

## 81. API/SERVICE LAYER

Do not scatter Supabase queries throughout every UI component.

Create reusable services/hooks for:

- Authentication
- Classes
- Students
- Lessons
- Assignments
- Quizzes
- Attendance
- Grades
- Notifications
- AI

This makes the system easier to maintain.

---

## 82. SEED DATA

Create development seed data.

Include:

**Demo Teacher**

A sample teacher account/profile.

**Demo Classes**

Examples:

- 6ème A Mathematics
- 5ème B French

**Demo Students**

Several fictional students.

**Demo Lessons**

**Demo Assignments**

**Demo Quiz**

**Demo Grades**

Do NOT use real people's personal information.

---

## 83. DEMO EXPERIENCE

Create a polished demo experience that allows a developer/tester to understand the product quickly.

The demo should demonstrate:

### Teacher

Class → Students → Lesson → Assignment → Quiz → Results

### Student

Class → Lesson → Assignment → Quiz → Grade

---

## 84. TESTING

Test all major workflows.

### Authentication

- Signup
- Login
- Logout
- Password reset

### Teacher

- Create class
- Generate code
- Add students
- Create lesson
- Publish lesson
- Create assignment
- Grade submission
- Create quiz
- Publish quiz
- Take attendance
- View grades

### Student

- Signup
- Join class
- View lesson
- Submit assignment
- Take quiz
- View result

### Security

Verify that:

- Students cannot modify grades.
- Students cannot modify attendance.
- Students cannot access other students' private data.
- Teachers cannot access unrelated classes.
- Unauthorized users cannot access Storage resources.

### Localization

Test:

- French
- English
- Arabic
- RTL
- Language persistence
- Date formatting

### Mobile

Test approximately:

- 360px
- 375px
- 390px
- 414px
- 430px

---

## 85. CRITICAL UX TEST

A new teacher using only a phone should be able to:

1. Register.
2. Create a class.
3. Get a join code.
4. Add students or allow students to join.
5. Create a lesson.
6. Create a quiz.
7. Publish it.
8. Record attendance.
9. View student results.

The workflow should be obvious without needing a manual.

---

## 86. BUILD ORDER

Do not attempt to implement everything simultaneously.

Build in this order:

### PHASE 1 — FOUNDATION

- Project setup
- Design system
- Supabase connection
- Authentication
- Profiles
- Roles
- Internationalization
- Responsive layout
- PWA foundation

### PHASE 2 — CLASSROOM

- Classes
- Join codes
- Students
- Teacher dashboard
- Student dashboard

### PHASE 3 — TEACHING

- Lessons
- Resources
- Assignments
- Submissions

### PHASE 4 — ASSESSMENT

- Quizzes
- Questions
- Attempts
- Automatic grading
- Grades
- Attendance

### PHASE 5 — COMMUNICATION

- Announcements
- Notifications

### PHASE 6 — INTELLIGENCE

- AI lesson generator
- AI quiz generator
- AI teacher assistant
- Analytics

### PHASE 7 — POLISH

- Performance
- Accessibility
- Error handling
- Empty states
- Loading states
- Security review
- Mobile QA
- PWA testing

---

## 87. DEPLOYMENT

The application should be deployment-ready for:

**Vercel**

Backend:

**Supabase**

The project must contain:

- Environment variable documentation
- `.env.example`
- Database migrations
- Supabase policies
- Storage policies
- Seed/development instructions
- Production build configuration

Never commit secrets.

---

## 88. FINAL PRODUCT STANDARD

Do not create a prototype that merely looks good.

Build the foundation of a real working product.

The final application should have:

- Real Supabase authentication
- Real PostgreSQL database
- Real RLS
- Real Storage
- Real class membership
- Real assignments
- Real submissions
- Real quizzes
- Real grading
- Real attendance
- Real notifications
- Real multilingual support
- Real responsive mobile UI

Avoid fake buttons and simulated functionality.

If a feature is displayed in the UI, implement it properly or clearly mark it as coming soon.

---

## 89. MOST IMPORTANT PRODUCT LOOP

The heart of ClassDjib is:

```text
          TEACHER
             │
             ▼
        Create Lesson
             │
             ▼
       Create Activity
             │
             ▼
       Create Assignment
             │
             ▼
         Create Quiz
             │
             ▼
          STUDENTS
             │
             ▼
     Complete / Submit
             │
             ▼
        Auto-Grading
             │
             ▼
        TEACHER RESULTS
             │
             ▼
          ANALYTICS
             │
             ▼
       AI INSIGHTS
             │
             ▼
     Better Next Lesson
```

This loop should make ClassDjib genuinely useful rather than simply becoming a database for schools.

---

## 90. FINAL INSTRUCTION TO THE BUILDING AGENT

Build ClassDjib as a real, scalable, secure, phone-first education platform for Djiboutian teachers and students.

Prioritize:

**Simplicity → Mobile UX → Reliability → Security → Localization → Real functionality → AI assistance**

Do not sacrifice usability for feature count.

Do not build unnecessary features before the core classroom workflow works perfectly.

The application should feel like something a Djiboutian teacher could open on their Android phone tomorrow morning and immediately use to manage their class.

The final product should be:

# ClassDjib

**Your classroom, in your pocket.**
