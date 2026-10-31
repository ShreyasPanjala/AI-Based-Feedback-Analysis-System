import { useEffect, useMemo, useState } from 'react'
import { adminApi, api, errorMessage } from '../api/api'
import SentimentBadge from '../components/SentimentBadge'

const filters = ['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE']

function readableDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export default function FeedbackList() {
  const [feedback, setFeedback] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.get('/feedback'), adminApi.get('/users'), api.get('/categories')])
      .then(([feedbackResponse, userResponse, categoryResponse]) => {
        setFeedback(feedbackResponse.data)
        setUsers(userResponse.data)
        setCategories(categoryResponse.data)
      })
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const userNames = useMemo(() => Object.fromEntries(users.map(user => [user.id, user.name])), [users])
  const categoryNames = useMemo(() => Object.fromEntries(categories.map(category => [category.id, category.name])), [categories])
  const shown = feedback.filter(item => filter === 'ALL' || item.sentiment === filter)

  return <>
    <div className="page-heading"><p className="eyebrow">ALL RESPONSES</p><h1>Feedback</h1><p>Browse individual responses and filter by sentiment.</p></div>
    <section className="panel list-panel">
      <div className="list-heading"><div><h2>Recent feedback</h2><p>{shown.length} response{shown.length === 1 ? '' : 's'}</p></div><div className="filter-wrap"><label htmlFor="sentiment-filter">Sentiment</label><select id="sentiment-filter" value={filter} onChange={event => setFilter(event.target.value)}>{filters.map(item => <option key={item} value={item}>{item === 'ALL' ? 'All' : item[0] + item.slice(1).toLowerCase()}</option>)}</select></div></div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {loading ? <div className="notice">Loading feedback…</div> : shown.length === 0 ? <div className="empty-list">No feedback matches this filter.</div> :
        <div className="table-scroll"><table><thead><tr><th>User</th><th>Category</th><th>Rating</th><th>Sentiment</th><th>Feedback</th><th>Date</th></tr></thead><tbody>{shown.map(item => <tr key={item.id}><td className="strong-cell">{userNames[item.userId] || `User #${item.userId}`}</td><td>{categoryNames[item.categoryId] || `Category #${item.categoryId}`}</td><td><span className="rating">★ {item.rating}/5</span></td><td><SentimentBadge value={item.sentiment} /></td><td className="message-cell">{item.message}</td><td className="date-cell">{readableDate(item.createdAt)}</td></tr>)}</tbody></table></div>}
    </section>
  </>
}
