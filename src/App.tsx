import { FormEvent, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import * as api from './lib/api'
import './styles.css'

type Tab = 'home' | 'classes' | 'create' | 'notifications' | 'profile'

export function App() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authMode, setAuthMode] = useState<'signin'|'signup'>('signin')
  const [classes, setClasses] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [tab, setTab] = useState<Tab>('home')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [className, setClassName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [classDescription, setClassDescription] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementContent, setAnnouncementContent] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session) refresh() }, [session])

  async function refresh() {
    try {
      setError('')
      const p = await api.getProfile(); setProfile(p)
      const c = await api.getMyClasses(p.role); setClasses(c)
      const n = await api.getNotifications(); setNotifications(n)
    } catch (e: any) { setError(e.message) }
  }

  async function loadClass(c: any) {
    setSelected(c); setTab('classes'); setError(''); setMessage('')
    try {
      const [l, a, q, an] = await Promise.all([api.getLessons(c.id), api.getAssignments(c.id), api.getQuizzes(c.id), api.getAnnouncements(c.id)])
      setLessons(l); setAssignments(a); setQuizzes(q); setAnnouncements(an)
    } catch (e: any) { setError(e.message) }
  }

  async function auth(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (error) throw error
        if (data.user) await supabase.from('profiles').update({ full_name: name || email.split('@')[0] }).eq('id', data.user.id)
        setMessage('Account created. Check your email if confirmation is required, then sign in.')
        setAuthMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error
      }
    } catch (e: any) { setError(e.message) } finally { setBusy(false) }
  }

  async function action(fn: () => Promise<any>, success: string) {
    setBusy(true); setError(''); setMessage('')
    try { await fn(); setMessage(success); await refresh() } catch (e: any) { setError(e.message) } finally { setBusy(false) }
  }

  async function createNewClass(e: FormEvent) { e.preventDefault(); await action(async () => { await api.createClass({ name: className, grade_level: gradeLevel, description: classDescription }); setClassName(''); setGradeLevel(''); setClassDescription(''); setTab('classes') }, 'Class created successfully.') }
  async function joinExisting(e: FormEvent) { e.preventDefault(); await action(async () => { const c = await api.joinClass(joinCode); setJoinCode(''); await refresh(); const fresh = (await api.getMyClasses(profile.role)).find((x: any) => x.id === c.id); if (fresh) await loadClass(fresh) }, 'You joined the class.') }
  async function createNewLesson(e: FormEvent) { e.preventDefault(); if (!selected) return; await action(async () => { await api.createLesson(selected.id, lessonTitle, lessonDescription); setLessonTitle(''); setLessonDescription(''); await loadClass(selected) }, 'Lesson published.') }
  async function createNewAssignment(e: FormEvent) { e.preventDefault(); if (!selected) return; await action(async () => { await api.createAssignment(selected.id, assignmentTitle, assignmentDescription, dueAt); setAssignmentTitle(''); setAssignmentDescription(''); setDueAt(''); await loadClass(selected) }, 'Assignment published.') }
  async function createNewQuiz(e: FormEvent) { e.preventDefault(); if (!selected) return; await action(async () => { await api.createQuiz(selected.id, quizTitle, ''); setQuizTitle(''); await loadClass(selected) }, 'Quiz created.') }
  async function createNewAnnouncement(e: FormEvent) { e.preventDefault(); if (!selected) return; await action(async () => { await api.createAnnouncement(selected.id, announcementTitle, announcementContent); setAnnouncementTitle(''); setAnnouncementContent(''); await loadClass(selected) }, 'Announcement posted.') }

  if (!session) return <main className="auth"><div className="brand"><div className="logo">C</div><h1>ClassDjib</h1><p>Your classroom, in your pocket.</p></div><form className="card" onSubmit={auth}><div className="toggle"><button type="button" className={authMode==='signin'?'active':''} onClick={()=>setAuthMode('signin')}>Sign in</button><button type="button" className={authMode==='signup'?'active':''} onClick={()=>setAuthMode('signup')}>Create account</button></div>{authMode==='signup' && <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />}<input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required /><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required /><button disabled={busy}>{busy ? 'Please wait…' : authMode==='signin' ? 'Continue' : 'Create account'}</button>{error&&<p className="error">{error}</p>}{message&&<p className="success">{message}</p>}</form></main>

  const isTeacher = profile?.role === 'teacher'
  return <main className="app"><header><div><strong>ClassDjib</strong><small>{isTeacher ? 'Teacher workspace' : 'Student workspace'}</small></div><button className="secondary" onClick={()=>supabase.auth.signOut()}>Sign out</button></header>
    <section className="hero"><small>{isTeacher ? 'Teacher dashboard' : 'Student dashboard'}</small><h1>{profile?.full_name || session.user.email}</h1><span>● Live Supabase data</span></section>
    {error&&<div className="alert error">{error}</div>}{message&&<div className="alert success">{message}</div>}
    {tab==='home' && <Home classes={classes} isTeacher={isTeacher} onOpen={loadClass} onCreate={()=>setTab('create')} />}
    {tab==='classes' && <Classes classes={classes} selected={selected} onOpen={loadClass} lessons={lessons} assignments={assignments} quizzes={quizzes} announcements={announcements} isTeacher={isTeacher} onCreate={()=>setTab('create')} onLesson={createNewLesson} onAssignment={createNewAssignment} onQuiz={createNewQuiz} onAnnouncement={createNewAnnouncement} lessonTitle={lessonTitle} setLessonTitle={setLessonTitle} lessonDescription={lessonDescription} setLessonDescription={setLessonDescription} assignmentTitle={assignmentTitle} setAssignmentTitle={setAssignmentTitle} assignmentDescription={assignmentDescription} setAssignmentDescription={setAssignmentDescription} dueAt={dueAt} setDueAt={setDueAt} quizTitle={quizTitle} setQuizTitle={setQuizTitle} announcementTitle={announcementTitle} setAnnouncementTitle={setAnnouncementTitle} announcementContent={announcementContent} setAnnouncementContent={setAnnouncementContent} />}
    {tab==='create' && <section className="stack">{isTeacher ? <form className="card form" onSubmit={createNewClass}><h2>Create a class</h2><input placeholder="Class name" value={className} onChange={e=>setClassName(e.target.value)} required/><input placeholder="Grade level" value={gradeLevel} onChange={e=>setGradeLevel(e.target.value)}/><textarea placeholder="Description" value={classDescription} onChange={e=>setClassDescription(e.target.value)}/><button disabled={busy}>Create class</button></form> : <form className="card form" onSubmit={joinExisting}><h2>Join a class</h2><p>Enter the join code given by your teacher.</p><input placeholder="ABC123" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} required/><button disabled={busy}>Join class</button></form>}</section>}
    {tab==='notifications' && <section className="stack"><div className="section-title"><h2>Notifications</h2><button className="secondary" onClick={refresh}>Refresh</button></div>{notifications.length ? notifications.map(n=><article className="card" key={n.id}><b>{n.title}</b><p>{n.body}</p><small>{new Date(n.created_at).toLocaleString()}</small>{!n.read_at&&<button className="link" onClick={()=>action(()=>api.markNotificationRead(n.id),'Marked as read.')}>Mark read</button>}</article>) : <div className="card empty">No notifications yet.</div>}</section>}
    {tab==='profile' && <section className="stack"><form className="card form" onSubmit={e=>{e.preventDefault(); action(()=>api.updateProfile({full_name:name}), 'Profile updated.')}}><h2>Profile</h2><input placeholder="Full name" value={name || profile?.full_name || ''} onChange={e=>setName(e.target.value)}/><input value={profile?.role || ''} disabled/><button>Save profile</button></form></section>}
    <nav><button onClick={()=>setTab('home')}>⌂<small>Home</small></button><button onClick={()=>setTab('classes')}>▦<small>Classes</small></button><button onClick={()=>setTab('create')}>＋<small>{isTeacher?'Create':'Join'}</small></button><button onClick={()=>setTab('notifications')}>🔔<small>Alerts</small></button><button onClick={()=>setTab('profile')}>◉<small>Profile</small></button></nav>
  </main>
}

function Home({ classes, isTeacher, onOpen, onCreate }: any) { return <section className="stack"><div className="section-title"><div><h2>{isTeacher?'Your classes':'My classes'}</h2><p>{classes.length} active class{classes.length===1?'':'es'}</p></div><button className="secondary" onClick={onCreate}>{isTeacher?'New class':'Join class'}</button></div>{classes.length?<div className="grid">{classes.map((c:any)=><button className="card class-card" key={c.id} onClick={()=>onOpen(c)}><div className="class-icon">📚</div><h3>{c.name}</h3><p>{c.grade_level||'Class'}</p>{isTeacher&&<b>{c.join_code}</b>}</button>)}</div>:<div className="card empty">No classes yet. {isTeacher?'Create your first class.':'Join a class with a code.'}</div>}</section> }

function Classes({ classes, selected, onOpen, lessons, assignments, quizzes, announcements, isTeacher, onCreate, onLesson, onAssignment, onQuiz, onAnnouncement, ...f }: any) { return <section className="stack"><div className="section-title"><div><h2>Classes</h2><p>Select a class to manage or study it.</p></div><button className="secondary" onClick={onCreate}>{isTeacher?'New':'Join'}</button></div>{!selected?<div className="grid">{classes.map((c:any)=><button className="card class-card" key={c.id} onClick={()=>onOpen(c)}><h3>{c.name}</h3><p>{c.grade_level||'Class'}</p></button>)}</div>:<><div className="card"><button className="link" onClick={()=>location.reload()}>← All classes</button><h2>{selected.name}</h2><p>{selected.description||selected.grade_level||'Class'}</p>{isTeacher&&<b>Join code: {selected.join_code}</b>}</div>{isTeacher&&<><MiniForm title="New lesson" onSubmit={onLesson}><input placeholder="Title" value={f.lessonTitle} onChange={e=>f.setLessonTitle(e.target.value)} required/><textarea placeholder="Description" value={f.lessonDescription} onChange={e=>f.setLessonDescription(e.target.value)}/></MiniForm><MiniForm title="New assignment" onSubmit={onAssignment}><input placeholder="Title" value={f.assignmentTitle} onChange={e=>f.setAssignmentTitle(e.target.value)} required/><textarea placeholder="Instructions" value={f.assignmentDescription} onChange={e=>f.setAssignmentDescription(e.target.value)}/><input type="datetime-local" value={f.dueAt} onChange={e=>f.setDueAt(e.target.value)}/></MiniForm><MiniForm title="New quiz" onSubmit={onQuiz}><input placeholder="Quiz title" value={f.quizTitle} onChange={e=>f.setQuizTitle(e.target.value)} required/></MiniForm><MiniForm title="New announcement" onSubmit={onAnnouncement}><input placeholder="Title" value={f.announcementTitle} onChange={e=>f.setAnnouncementTitle(e.target.value)} required/><textarea placeholder="Message" value={f.announcementContent} onChange={e=>f.setAnnouncementContent(e.target.value)} required/></MiniForm></>}{<DataSection title="Lessons" items={lessons} empty="No lessons yet." render={(x:any)=><><b>{x.title}</b><p>{x.description||'Lesson content'}</p></>}/>}<DataSection title="Assignments" items={assignments} empty="No assignments yet." render={(x:any)=><><b>{x.title}</b><p>{x.description||'No instructions.'}</p>{x.due_at&&<small>Due {new Date(x.due_at).toLocaleString()}</small>}</>}/><DataSection title="Quizzes" items={quizzes} empty="No quizzes yet." render={(x:any)=><><b>{x.title}</b><p>{x.description||'Quiz'}</p></>}/><DataSection title="Announcements" items={announcements} empty="No announcements." render={(x:any)=><><b>{x.title}</b><p>{x.content}</p></>}/></>}</section> }

function MiniForm({title,onSubmit,children}:any){return <form className="card form" onSubmit={onSubmit}><h3>{title}</h3>{children}<button>Save</button></form>}
function DataSection({title,items,empty,render}:any){return <section><h3>{title}</h3>{items.length?items.map((x:any)=><article className="card item" key={x.id}>{render(x)}</article>):<div className="card empty">{empty}</div>}</section>}
