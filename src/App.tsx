import { FormEvent, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import * as api from './lib/api'
import { Lang, useI18n } from './lib/i18n'
import './styles.css'

type Tab = 'home' | 'classes' | 'create' | 'notifications' | 'profile'

export function App() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('classdjib-lang') as Lang) || 'fr')
  const [tab, setTab] = useState<Tab>('home')
  const [classes, setClasses] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const { t, dir } = useI18n(lang)
  const teacher = profile?.role === 'teacher'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    localStorage.setItem('classdjib-lang', lang)
  }, [lang, dir])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) refresh()
  }, [session])

  useEffect(() => {
    if (!session) return
    return api.subscribeToNotifications(() => refreshNotifications())
  }, [session])

  async function refreshNotifications() {
    try {
      setNotifications(await api.getNotifications())
    } catch {}
  }

  async function refresh() {
    try {
      setError('')
      const p = await api.getProfile()
      setProfile(p)
      setName(p.full_name || '')
      setClasses(await api.getMyClasses(p.role))
      await refreshNotifications()
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function auth(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role } },
        })
        if (error) throw error
        if (data.session) {
          const p = await api.getProfile()
          setProfile(p)
        }
        setMessage('Account created. Check your email if confirmation is required.')
        setAuthMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function action(fn: () => Promise<any>, ok: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await fn()
      setMessage(ok)
      await refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!session) {
    return (
      <Auth
        t={t}
        mode={authMode}
        setMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        role={role}
        setRole={setRole}
        busy={busy}
        error={error}
        message={message}
        onSubmit={auth}
        lang={lang}
        setLang={setLang}
      />
    )
  }

  return (
    <main className="app">
      <header>
        <div>
          <strong>ClassDjib</strong>
          <small>{teacher ? t('teacher') : t('student')}</small>
        </div>
        <div className="header-actions">
          <select aria-label={t('language')} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          <button className="secondary" onClick={() => supabase.auth.signOut()}>{t('signOut')}</button>
        </div>
      </header>
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}
      <section className="hero">
        <small>{teacher ? t('teacher') : t('student')}</small>
        <h1>{profile?.full_name || session.user.email}</h1>
        <span>● {t('live')}</span>
      </section>
      {tab === 'home' && <Home t={t} teacher={teacher} classes={classes} open={(c: any) => { setSelected(c); setTab('classes') }} create={() => setTab('create')} />}
      {tab === 'classes' && <ClassRoom t={t} teacher={teacher} classes={classes} selected={selected} open={setSelected} back={() => setSelected(null)} setError={setError} setMessage={setMessage} busy={busy} />}
      {tab === 'create' && <CreateTab t={t} teacher={teacher} action={action} />}
      {tab === 'notifications' && <Notifications t={t} items={notifications} action={action} />}
      {tab === 'profile' && <Profile t={t} name={name} setName={setName} role={profile?.role} action={action} />}
      <nav>
        <button onClick={() => setTab('home')}>⌂<small>{t('home')}</small></button>
        <button onClick={() => setTab('classes')}>▦<small>{t('classes')}</small></button>
        <button onClick={() => setTab('create')}>＋<small>{teacher ? t('create') : t('joinClass')}</small></button>
        <button onClick={() => setTab('notifications')}>🔔<small>{t('alerts')}{notifications.some((n) => !n.read_at) ? ' •' : ''}</small></button>
        <button onClick={() => setTab('profile')}>◉<small>{t('profile')}</small></button>
      </nav>
    </main>
  )
}

function Auth({ t, mode, setMode, email, setEmail, password, setPassword, name, setName, role, setRole, busy, error, message, onSubmit, lang, setLang }: any) {
  return (
    <main className="auth">
      <div className="brand">
        <div className="logo">C</div>
        <h1>ClassDjib</h1>
        <p>Your classroom, in your pocket.</p>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <form className="card form" onSubmit={onSubmit}>
        <div className="toggle">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>{t('signIn')}</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>{t('createAccount')}</button>
        </div>
        {mode === 'signup' && <>
          <input placeholder={t('fullName')} value={name} onChange={(e) => setName(e.target.value)} required />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">{t('studentChoice')}</option>
            <option value="teacher">{t('teacherChoice')}</option>
          </select>
        </>}
        <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        <button disabled={busy}>{busy ? '…' : mode === 'signin' ? t('continue') : t('createAccount')}</button>
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </form>
    </main>
  )
}

function Home({ t, teacher, classes, open, create }: any) {
  return (
    <section className="stack">
      <div className="section-title">
        <div><h2>{t('classes')}</h2><p>{classes.length} active class{classes.length === 1 ? '' : 'es'}</p></div>
        <button className="secondary" onClick={create}>{teacher ? t('newClass') : t('joinClass')}</button>
      </div>
      {classes.length ? <div className="grid">{classes.map((c: any) => (
        <button className="card class-card" key={c.id} onClick={() => open(c)}>
          <div className="class-icon">📚</div><h3>{c.name}</h3><p>{c.grade_level || 'Class'}</p>{teacher && <b>{c.join_code}</b>}
        </button>
      ))}</div> : <div className="card empty">{t('noData')}</div>}
    </section>
  )
}

function CreateTab({ t, teacher, action }: any) {
  const [v, setV] = useState({ name: '', grade: '', description: '', code: '' })
  return (
    <section className="stack">
      <form className="card form" onSubmit={(e) => { e.preventDefault(); if (teacher) action(() => api.createClass({ name: v.name, grade_level: v.grade, description: v.description }), 'Class created.'); else action(() => api.joinClass(v.code), 'Joined class.') }}>
        <h2>{teacher ? t('newClass') : t('joinClass')}</h2>
        {teacher ? <>
          <input placeholder={t('className')} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} required />
          <input placeholder={t('gradeLevel')} value={v.grade} onChange={(e) => setV({ ...v, grade: e.target.value })} />
          <textarea placeholder={t('description')} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
        </> : <input placeholder={t('joinCode')} value={v.code} onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase() })} required />}
        <button>{teacher ? t('save') : t('joinClass')}</button>
      </form>
    </section>
  )
}

function ClassRoom({ t, teacher, classes, selected, open, back, setError, setMessage }: any) {
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [view, setView] = useState<'overview' | 'quiz' | 'submissions'>('overview')
  const [activeQuiz, setActiveQuiz] = useState<any>(null)
  const [lesson, setLesson] = useState({ title: '', description: '' })
  const [assignment, setAssignment] = useState({ title: '', description: '', due: '', max: '100' })
  const [quizTitle, setQuizTitle] = useState('')
  const [question, setQuestion] = useState('')
  const [opts, setOpts] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState(0)
  const [announcement, setAnnouncement] = useState({ title: '', content: '' })
  const [submission, setSubmission] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [grade, setGrade] = useState({ id: '', score: '', feedback: '' })

  async function load(c: any) {
    open(c)
    if (!c) return
    try {
      const [l, a, q, an, s, att, g] = await Promise.all([
        api.getLessons(c.id), api.getAssignments(c.id), api.getQuizzes(c.id), api.getAnnouncements(c.id),
        api.getClassStudents(c.id), api.getAttendance(c.id), api.getGrades(c.id),
      ])
      setLessons(l); setAssignments(a); setQuizzes(q); setAnnouncements(an); setStudents(s); setAttendance(att); setGrades(g)
    } catch (e: any) { setError(e.message) }
  }

  useEffect(() => { if (selected) load(selected) }, [selected?.id])

  async function save(fn: () => Promise<any>, ok: string) {
    setError(''); setMessage('')
    try { await fn(); setMessage(ok); if (selected) await load(selected) }
    catch (e: any) { setError(e.message); throw e }
  }

  async function submitAssignment(a: any) {
    await save(async () => {
      let path = ''
      if (file) path = await api.uploadAssignmentFile(file)
      await api.submitAssignment(a.id, submission, path)
      setSubmission(''); setFile(null)
    }, 'Assignment submitted.')
  }

  if (!selected) return (
    <section className="stack"><div className="section-title"><h2>{t('classes')}</h2></div>
      <div className="grid">{classes.map((c: any) => <button className="card class-card" key={c.id} onClick={() => load(c)}><h3>{c.name}</h3><p>{c.grade_level || 'Class'}</p></button>)}</div>
    </section>
  )

  return (
    <section className="stack">
      <div className="card"><button className="link" onClick={back}>← {t('classes')}</button><h2>{selected.name}</h2><p>{selected.description || selected.grade_level || ''}</p>{teacher && <b>{t('joinCode')}: {selected.join_code}</b>}</div>
      {view === 'quiz' && activeQuiz ? <QuizRunner t={t} quiz={activeQuiz} close={() => setView('overview')} save={save} /> : view === 'submissions' ? <Submissions t={t} items={submissions} close={() => setView('overview')} grade={grade} setGrade={setGrade} save={save} /> : <>
        <section className="chips"><button className="secondary" onClick={() => setView('overview')}>{t('home')}</button>{teacher && <button className="secondary" onClick={async () => { try { setSubmissions(await api.getSubmissions(selected.id)); setView('submissions') } catch (e: any) { setError(e.message) } }}>{t('submissions')}</button>}</section>
        {teacher && <TeacherTools t={t} lesson={lesson} setLesson={setLesson} assignment={assignment} setAssignment={setAssignment} quizTitle={quizTitle} setQuizTitle={setQuizTitle} question={question} setQuestion={setQuestion} opts={opts} setOpts={setOpts} correct={correct} setCorrect={setCorrect} announcement={announcement} setAnnouncement={setAnnouncement} selected={selected} quizzes={quizzes} save={save} setSubmissions={setSubmissions} />}
        {!teacher && <StudentTools t={t} assignments={assignments} submission={submission} setSubmission={setSubmission} file={file} setFile={setFile} submitAssignment={submitAssignment} quizzes={quizzes} startQuiz={(q: any) => { setActiveQuiz(q); setView('quiz') }} />}
        <Data t={t} title={t('lessons')} items={lessons} render={(x: any) => <><b>{x.title}</b><p>{x.description || x.content || ''}</p></>} />
        <Data t={t} title={t('announcements')} items={announcements} render={(x: any) => <><b>{x.title}</b><p>{x.content}</p></>} />
        {!teacher && <Data t={t} title={t('grades')} items={grades} render={(x: any) => <><b>{x.title}</b><p>{x.score}/{x.max_score} {x.feedback && `— ${x.feedback}`}</p></>} />}
        {teacher && <><Data t={t} title={t('grades')} items={grades} render={(x: any) => <><b>{x.profiles?.full_name}</b><p>{x.title}: {x.score}/{x.max_score}</p></>} /><Attendance t={t} students={students} attendance={attendance} save={save} classId={selected.id} /></>}
      </>}
    </section>
  )
}

function TeacherTools({ t, lesson, setLesson, assignment, setAssignment, quizTitle, setQuizTitle, question, setQuestion, opts, setOpts, correct, setCorrect, announcement, setAnnouncement, selected, quizzes, save }: any) {
  return <>
    <MiniForm title={t('newLesson')} onSubmit={(e: FormEvent) => { e.preventDefault(); save(() => api.createLesson(selected.id, lesson.title, lesson.description), 'Lesson published.').then(() => setLesson({ title: '', description: '' })) }}>
      <input placeholder={t('className')} value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} required />
      <textarea placeholder={t('description')} value={lesson.description} onChange={(e) => setLesson({ ...lesson, description: e.target.value })} />
    </MiniForm>
    <MiniForm title={t('newAssignment')} onSubmit={(e: FormEvent) => { e.preventDefault(); save(() => api.createAssignment(selected.id, assignment.title, assignment.description, assignment.due, Number(assignment.max) || 100), 'Assignment published.').then(() => setAssignment({ title: '', description: '', due: '', max: '100' })) }}>
      <input placeholder={t('className')} value={assignment.title} onChange={(e) => setAssignment({ ...assignment, title: e.target.value })} required />
      <textarea placeholder={t('description')} value={assignment.description} onChange={(e) => setAssignment({ ...assignment, description: e.target.value })} />
      <input type="number" placeholder={t('maxPoints')} value={assignment.max} onChange={(e) => setAssignment({ ...assignment, max: e.target.value })} />
      <input type="datetime-local" value={assignment.due} onChange={(e) => setAssignment({ ...assignment, due: e.target.value })} />
    </MiniForm>
    <MiniForm title={t('newQuiz')} onSubmit={(e: FormEvent) => { e.preventDefault(); save(() => api.createQuiz(selected.id, quizTitle, ''), 'Quiz created.').then(() => setQuizTitle('')) }}>
      <input placeholder={t('quizzes')} value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required />
    </MiniForm>
    {quizzes[0] && <MiniForm title={`${t('question')} — ${quizzes[0].title}`} onSubmit={(e: FormEvent) => { e.preventDefault(); save(() => api.addQuizQuestion(quizzes[0].id, question, opts, correct), 'Question added.').then(() => { setQuestion(''); setOpts(['', '', '', '']) }) }}>
      <textarea placeholder={t('question')} value={question} onChange={(e) => setQuestion(e.target.value)} required />
      {opts.map((o: string, i: number) => <input key={i} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => setOpts(opts.map((x: string, j: number) => j === i ? e.target.value : x))} required />)}
      <select value={correct} onChange={(e) => setCorrect(Number(e.target.value))}>{opts.map((_: string, i: number) => <option key={i} value={i}>{t('correct')} {i + 1}</option>)}</select>
    </MiniForm>}
    <MiniForm title={t('newAnnouncement')} onSubmit={(e: FormEvent) => { e.preventDefault(); save(() => api.createAnnouncement(selected.id, announcement.title, announcement.content), 'Announcement posted.').then(() => setAnnouncement({ title: '', content: '' })) }}>
      <input placeholder={t('announcement')} value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} required />
      <textarea placeholder={t('description')} value={announcement.content} onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })} required />
    </MiniForm>
  </>
}

function StudentTools({ t, assignments, submission, setSubmission, file, setFile, submitAssignment, quizzes, startQuiz }: any) {
  return <>
    <section><h3>{t('assignments')}</h3>{assignments.length ? assignments.map((a: any) => <article className="card item" key={a.id}><b>{a.title}</b><p>{a.description}</p>{a.due_at && <small>{t('due')}: {new Date(a.due_at).toLocaleString()}</small>}<textarea placeholder={t('yourSubmission')} value={submission} onChange={(e) => setSubmission(e.target.value)} /><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /><button onClick={() => submitAssignment(a)}>{t('submit')}</button></article>) : <div className="card empty">{t('noData')}</div>}</section>
    <section><h3>{t('quizzes')}</h3>{quizzes.map((q: any) => <article className="card item" key={q.id}><b>{q.title}</b><p>{q.quiz_questions?.length || 0} questions</p><button onClick={() => startQuiz(q)}>{t('start')}</button></article>)}</section>
  </>
}

function QuizRunner({ t, quiz, close, save }: any) {
  const qs = quiz.quiz_questions || []
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const q = qs[i]
  if (result) return <div className="card"><h2>{t('score')}</h2><p>{result.score}/{result.max_score}</p><button onClick={close}>OK</button></div>
  if (!q) return <div className="card">{t('noData')}</div>
  return <div className="card quiz"><button className="link" onClick={close}>←</button><small>{i + 1}/{qs.length}</small><h2>{q.question_text}</h2>{(q.quiz_options || []).slice().sort((a: any, b: any) => a.position - b.position).map((o: any) => <label className="option" key={o.id}><input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => setAnswers({ ...answers, [q.id]: o.id })} />{o.option_text}</label>)}<button onClick={async () => { if (i < qs.length - 1) setI(i + 1); else { const r = await save(() => api.submitQuizAttempt(quiz.id, qs.map((x: any) => ({ question_id: x.id, selected_option_id: answers[x.id] }))), 'Quiz submitted.'); setResult(r) } }}>{i < qs.length - 1 ? t('next') : t('finish')}</button></div>
}

function Attendance({ t, students, save, classId }: any) {
  return <section><h3>{t('attendance')}</h3>{students.length ? students.map((s: any) => <article className="card item" key={s.student_id}><b>{s.profiles?.full_name || 'Student'}</b><div className="row"><button onClick={() => save(() => api.recordAttendance(classId, s.student_id, 'present'), t('present'))}>{t('present')}</button><button onClick={() => save(() => api.recordAttendance(classId, s.student_id, 'absent'), t('absent'))}>{t('absent')}</button><button onClick={() => save(() => api.recordAttendance(classId, s.student_id, 'late'), t('late'))}>{t('late')}</button></div></article>) : <div className="card empty">{t('noData')}</div>}</section>
}

function Submissions({ t, items, close, grade, setGrade, save }: any) {
  return <section className="stack"><button className="link" onClick={close}>← {t('classes')}</button>{items.length ? items.map((s: any) => <article className="card item" key={s.id}><b>{s.profiles?.full_name || 'Student'}</b><p>{s.content}</p><small>{s.submitted_at && new Date(s.submitted_at).toLocaleString()}</small><input type="number" placeholder={t('score')} value={grade.id === s.id ? grade.score : ''} onChange={(e) => setGrade({ id: s.id, score: e.target.value, feedback: grade.feedback })} /><textarea placeholder={t('feedback')} value={grade.id === s.id ? grade.feedback : ''} onChange={(e) => setGrade({ id: s.id, score: grade.score, feedback: e.target.value })} /><button onClick={() => save(() => api.gradeSubmission(s.id, Number(grade.score), grade.feedback), 'Submission graded.')}>{t('grade')}</button></article>) : <div className="card empty">{t('noData')}</div>}</section>
}

function Notifications({ t, items, action }: any) {
  return <section className="stack"><div className="section-title"><h2>{t('alerts')}</h2></div>{items.length ? items.map((n: any) => <article className="card item" key={n.id}><b>{n.title}</b><p>{n.body}</p><small>{new Date(n.created_at).toLocaleString()}</small>{!n.read_at && <button className="link" onClick={() => action(() => api.markNotificationRead(n.id), 'Marked as read.')}>Mark read</button>}</article>) : <div className="card empty">{t('noData')}</div>}</section>
}

function Profile({ t, name, setName, role, action }: any) {
  return <section className="stack"><form className="card form" onSubmit={(e) => { e.preventDefault(); action(() => api.updateProfile({ full_name: name }), 'Profile updated.') }}><h2>{t('profile')}</h2><input placeholder={t('fullName')} value={name} onChange={(e) => setName(e.target.value)} /><input value={role || ''} disabled /><button>{t('save')}</button></form></section>
}

function MiniForm({ title, onSubmit, children }: any) {
  return <form className="card form" onSubmit={onSubmit}><h3>{title}</h3>{children}<button>Save</button></form>
}

function Data({ t, title, items, render }: any) {
  return <section><h3>{title}</h3>{items.length ? items.map((x: any) => <article className="card item" key={x.id}>{render(x)}</article>) : <div className="card empty">{t('noData')}</div>}</section>
}
