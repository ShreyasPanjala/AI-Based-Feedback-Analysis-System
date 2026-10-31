import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import SubmitFeedback from './pages/SubmitFeedback'
import FeedbackList from './pages/FeedbackList'

export default function App() {
  return <BrowserRouter>
    <Navbar />
    <main className="page-shell">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submit" element={<SubmitFeedback />} />
        <Route path="/feedback" element={<FeedbackList />} />
      </Routes>
    </main>
  </BrowserRouter>
}
