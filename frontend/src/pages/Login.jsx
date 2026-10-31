import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { demoMode, errorMessage, signIn } from '../api/api'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(username.trim(), password)
      onLogin('ADMIN')
      navigate('/')
    } catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }

  return <div className="login-layout">
    <section className="panel login-panel">
      <p className="eyebrow">WELCOME TO FEEDBACKAI</p>
      <h1>Sign in</h1>
      <p className="login-intro">{demoMode ? 'Explore the public browser demo or use its demo admin access.' : 'Use the Spring Boot admin account to access reports and feedback.'}</p>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <form onSubmit={submit}>
        <label>Username<input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Checking…' : 'Sign in as admin'}</button>
      </form>
      {demoMode && <div className="guest-option"><p>Want to look around first?</p><button className="button button-secondary" type="button" onClick={() => { onLogin('GUEST'); navigate('/') }}>Explore sample dashboard</button><p className="fine-print">Demo admin: <code>admin</code> / <code>admin123</code>. This passcode is only for the public browser demo; it does not secure real data.</p></div>}
    </section>
    <aside className="login-info"><div className="side-icon">✦</div><h2>Listen at scale.</h2><p>Collect feedback, track ratings, and spot sentiment trends in one simple place.</p>{demoMode && <p className="fine-print">Sample feedback stays in your browser. Connect a hosted Spring Boot API for shared MySQL data and Python analysis.</p>}</aside>
  </div>
}
