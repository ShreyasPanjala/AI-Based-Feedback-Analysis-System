import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return <header className="topbar">
    <div className="nav-wrap">
      <NavLink className="brand" to="/"><span className="brand-mark">F</span> FeedbackAI</NavLink>
      <nav aria-label="Main navigation">
        <NavLink end to="/">Dashboard</NavLink>
        <NavLink to="/submit">Submit Feedback</NavLink>
        <NavLink to="/feedback">Feedback</NavLink>
      </nav>
    </div>
  </header>
}
