import { useEffect, useState } from 'react'
import { api, adminApi, demoMode, errorMessage } from '../api/api'
import SentimentBadge from '../components/SentimentBadge'

export default function SubmitFeedback() {
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ userId: '', categoryId: '', rating: '5', message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.get('/users'), api.get('/categories')])
      .then(([userResponse, categoryResponse]) => {
        setUsers(userResponse.data)
        setCategories(categoryResponse.data)
      })
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoadingOptions(false))
  }, [])

  function update(event) { setForm(current => ({ ...current, [event.target.name]: event.target.value })) }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess(null)
    if (!form.userId || !form.categoryId || !form.message.trim() || Number(form.rating) < 1 || Number(form.rating) > 5) {
      setError('Select a user and category, enter feedback, and choose a rating from 1 to 5.')
      return
    }
    setSubmitting(true)
    try {
      const response = await api.post('/feedback', {
        userId: Number(form.userId), categoryId: Number(form.categoryId),
        rating: Number(form.rating), message: form.message.trim(),
      })
      setSuccess(response.data)
      setForm(current => ({ ...current, message: '' }))
    } catch (err) { setError(errorMessage(err)) }
    finally { setSubmitting(false) }
  }

  return <>
    <div className="page-heading"><p className="eyebrow">SHARE YOUR EXPERIENCE</p><h1>Submit Feedback</h1><p>Your feedback helps us understand what is working and what needs attention.</p></div>
    <div className="form-layout"><section className="panel form-panel">
      <div className="panel-heading"><h2>New feedback</h2><p>All fields are required.</p></div>
      {loadingOptions && <div className="notice">Loading users and categories…</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {success && <div className="notice notice-success" role="status"><strong>{demoMode ? 'Saved in this browser.' : 'Feedback submitted successfully.'}</strong><span>{demoMode ? 'Analysis requires the Java and Python services:' : 'Detected Sentiment:'} <SentimentBadge value={success.sentiment} /></span></div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <label>User<select name="userId" value={form.userId} onChange={update} required><option value="">Select a user</option>{users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
          <label>Category<select name="categoryId" value={form.categoryId} onChange={update} required><option value="">Select a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        </div>
        <label>Rating<select name="rating" value={form.rating} onChange={update} required>{[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} — {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very poor'}</option>)}</select></label>
        <label>Feedback Message<textarea name="message" value={form.message} onChange={update} rows="6" minLength="1" placeholder="Tell us about your experience…" required /></label>
        <button className="button button-primary" type="submit" disabled={submitting || !users.length || !categories.length}>{submitting ? 'Submitting…' : 'Submit feedback'}</button>
      </form>
    </section><aside className="side-note"><div className="side-icon">✦</div><h2>Every voice matters.</h2><p>Your response is analyzed for sentiment to help teams spot patterns faster. The message and rating remain available in the feedback list.</p></aside></div>
  </>
}
