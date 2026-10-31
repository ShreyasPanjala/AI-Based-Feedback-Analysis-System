import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import SubmitFeedback from './pages/SubmitFeedback'
import FeedbackList from './pages/FeedbackList'
import Login from './pages/Login'
import { demoMode, signOut } from './api/api'

export default function App() {
  const [role, setRole] = useState(null)
  const protectedPage = page => role ? page : <Navigate to="/login" replace />
  function logout() { signOut(); setRole(null) }
  return <BrowserRouter>
    <Navbar role={role} onSignOut={logout} />
    {demoMode && <div className="demo-banner" role="status"><strong>Public browser demo</strong> · Sample data is stored only on this device. New submissions remain PENDING until connected to Spring Boot and Python.</div>}
    <main className="page-shell">
      <Routes>
        <Route path="/login" element={role ? <Navigate to="/" replace /> : <Login onLogin={setRole} />} />
        <Route path="/" element={protectedPage(<Dashboard />)} />
        <Route path="/submit" element={protectedPage(<SubmitFeedback />)} />
        <Route path="/feedback" element={protectedPage(<FeedbackList />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </BrowserRouter>
}
