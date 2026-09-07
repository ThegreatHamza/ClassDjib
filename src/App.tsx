import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './styles.css'

export function App() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [classes, setClasses] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    supabase.from('classes').select('id,name,grade_level,join_code,is_active').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setClasses(data || []) })
  }, [session])

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  if (!session) return <main className="auth"><div className="brand"><div className="logo">C</div><h1>ClassDjib</h1><p>Your classroom, in your pocket.</p></div><form className="card" onSubmit={signIn}><h2>Sign in</h2><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required /><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required /><button>Continue</button>{error && <p className="error">{error}</p>}</form></main>

  return <main className="app"><header><div><strong>ClassDjib</strong><small>Connected to Supabase</small></div><button className="secondary" onClick={()=>supabase.auth.signOut()}>Sign out</button></header><section className="hero"><small>Welcome</small><h1>{session.user.email}</h1><span>Live data</span></section><section><div className="section-title"><h2>My classes</h2><button className="secondary" onClick={()=>location.reload()}>Refresh</button></div>{classes.length ? <div className="grid">{classes.map(c=><article className="card" key={c.id}><div className="class-icon">📚</div><h3>{c.name}</h3><p>{c.grade_level || 'Class'}</p><b>{c.join_code}</b></article>)}</div> : <div className="card empty">No active classes yet.</div>}</section><nav><span>⌂ Home</span><span>▦ Classes</span><span>＋ Create</span><span>🔔</span><span>◉ Profile</span></nav></main>
}
