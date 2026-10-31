import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { adminApi, errorMessage } from '../api/api'
import StatCard from '../components/StatCard'

const colors = ['#26a783', '#e6a642', '#e06a75']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.get('/reports/summary'), adminApi.get('/reports/category')])
      .then(([summaryResponse, categoryResponse]) => {
        setSummary(summaryResponse.data)
        setCategories(categoryResponse.data)
      })
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const distribution = summary ? [
    { name: 'Positive', value: summary.positive },
    { name: 'Neutral', value: summary.neutral },
    { name: 'Negative', value: summary.negative },
  ] : []
  const analyzedCount = distribution.reduce((sum, item) => sum + item.value, 0)

  return <>
    <div className="page-heading split-heading">
      <div><p className="eyebrow">OVERVIEW</p><h1>AI Feedback Analysis Dashboard</h1><p>See how people feel, and where to focus next.</p></div>
      <Link className="button button-primary" to="/submit">+ Submit feedback</Link>
    </div>
    {loading && <div className="notice">Loading dashboard…</div>}
    {error && <div className="notice notice-error" role="alert">{error}</div>}
    {summary && <>
      <section className="stats-grid" aria-label="Feedback statistics">
        <StatCard label="Total Feedback" value={summary.totalFeedback} tone="blue" />
        <StatCard label="Average Rating" value={`${Number(summary.averageRating).toFixed(1)} / 5`} tone="purple" />
        <StatCard label="Positive Feedback" value={summary.positive} tone="green" />
        <StatCard label="Neutral Feedback" value={summary.neutral} tone="yellow" />
        <StatCard label="Negative Feedback" value={summary.negative} tone="red" />
      </section>
      {summary.pending > 0 && <div className="notice">{summary.pending} older feedback item{summary.pending === 1 ? '' : 's'} still pending analysis.</div>}
      {summary.totalFeedback === 0 ? <section className="panel empty-state"><h2>No feedback data available yet.</h2><p>Submit your first response to see analysis here.</p><Link to="/submit" className="button button-primary">Submit feedback</Link></section> :
        <div className="chart-grid">
          <section className="panel chart-panel"><div className="panel-heading"><h2>Sentiment distribution</h2><p>Analyzed feedback only</p></div>
            {analyzedCount > 0 ? <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={66} outerRadius={104} paddingAngle={3}>{distribution.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" /></PieChart></ResponsiveContainer></div> : <p className="chart-empty">No analyzed feedback yet.</p>}
          </section>
          <section className="panel chart-panel"><div className="panel-heading"><h2>Feedback by category</h2><p>Number of submissions</p></div>
            {categories.length > 0 ? <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={categories} margin={{ top: 12, right: 14, left: -16, bottom: 12 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4" /><XAxis dataKey="category" interval={0} angle={-22} textAnchor="end" height={68} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="feedbackCount" name="Feedback" fill="#5574de" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="chart-empty">No category feedback yet.</p>}
          </section>
        </div>}
    </>}
  </>
}
