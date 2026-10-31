import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  MessageSquarePlus,
  LayoutGrid,
  BarChart3,
  ShieldCheck,
  Star,
  Send,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  PlusCircle,
  User,
  Layers,
  TrendingUp,
  Lock,
  LogOut,
  SlidersHorizontal,
  BrainCircuit
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'feed' | 'reports' | 'admin'

  // Data states
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [summaryReport, setSummaryReport] = useState(null);
  const [categoryReports, setCategoryReports] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [toast, setToast] = useState(null);

  // Submit Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter state for Feed
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  // Admin Auth state
  const [adminAuth, setAdminAuth] = useState(() => {
    return localStorage.getItem('feedback_ai_auth') || '';
  });
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('admin123');
  const [authError, setAuthError] = useState('');

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');

  // Show Toast
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id.toString());
        }
        setApiOnline(true);
      }
    } catch (err) {
      setApiOnline(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        if (data.length > 0 && !selectedUserId) {
          setSelectedUserId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch All Feedback
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/feedback`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.reverse()); // most recent first
        setApiOnline(true);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Reports (Requires Basic Auth)
  const fetchReports = async (authHeader = adminAuth) => {
    if (!authHeader) return;
    try {
      setLoading(true);
      const headers = { Authorization: authHeader };

      const [sumRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/reports/summary`, { headers }),
        fetch(`${API_BASE}/reports/category`, { headers })
      ]);

      if (sumRes.ok && catRes.ok) {
        const sumData = await sumRes.json();
        const catData = await catRes.json();
        setSummaryReport(sumData);
        setCategoryReports(catData);
        setAuthError('');
      } else {
        setAuthError('Authentication required to view system analytics.');
      }
    } catch (err) {
      setAuthError('Unable to connect to reports service.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchUsers();
    fetchFeedback();
  }, []);

  // When adminAuth changes or user selects reports tab
  useEffect(() => {
    if (activeTab === 'reports' && adminAuth) {
      fetchReports();
    }
  }, [activeTab, adminAuth]);

  // Handle Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please provide a feedback description', 'error');
      return;
    }
    if (!selectedUserId || !selectedCategoryId) {
      showToast('Please select a user profile and department category', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: Number(selectedUserId),
        categoryId: Number(selectedCategoryId),
        rating: Number(rating),
        message: message.trim()
      };

      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setMessage('');
        setRating(5);
        showToast('Feedback submitted successfully!');
        fetchFeedback();
        setActiveTab('feed');
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving feedback', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to backend server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger AI Analysis for Pending feedbacks
  const handleAnalyzePending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/feedback/analyze-pending`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('AI Sentiment analysis completed for pending items!');
        fetchFeedback();
        if (adminAuth) fetchReports();
      } else {
        showToast('Failed to process sentiments', 'error');
      }
    } catch (err) {
      showToast('Sentiment service unreachable', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manual sentiment adjustment
  const handleUpdateSentiment = async (feedbackId, newSentiment) => {
    try {
      const res = await fetch(`${API_BASE}/feedback/${feedbackId}/sentiment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentiment: newSentiment })
      });
      if (res.ok) {
        showToast(`Updated sentiment to ${newSentiment}`);
        fetchFeedback();
        if (adminAuth) fetchReports();
      }
    } catch (err) {
      showToast('Error updating sentiment', 'error');
    }
  };

  // Handle Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const token = 'Basic ' + btoa(`${adminUser}:${adminPass}`);
    setAdminAuth(token);
    localStorage.setItem('feedback_ai_auth', token);
    fetchReports(token);
    showToast('Administrator session authenticated');
  };

  const handleAdminLogout = () => {
    setAdminAuth('');
    localStorage.removeItem('feedback_ai_auth');
    setSummaryReport(null);
    setCategoryReports([]);
    showToast('Administrator logged out');
  };

  // Add Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      if (res.ok) {
        showToast(`Category '${newCategoryName}' created!`);
        setNewCategoryName('');
        setShowCategoryModal(false);
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error creating category', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    }
  };

  // Add User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          role: newUserRole
        })
      });
      if (res.ok) {
        showToast(`User '${newUserName}' created!`);
        setNewUserName('');
        setNewUserEmail('');
        setShowUserModal(false);
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error creating user', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      // Search
      const searchMatch =
        !searchQuery.trim() ||
        fb.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fb.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fb.category.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const catMatch =
        categoryFilter === 'ALL' ||
        fb.category.name.toUpperCase() === categoryFilter.toUpperCase();

      // Sentiment
      const sentMatch =
        sentimentFilter === 'ALL' ||
        fb.sentiment.toUpperCase() === sentimentFilter.toUpperCase();

      // Rating
      const ratingMatch =
        ratingFilter === 'ALL' ||
        fb.rating === Number(ratingFilter);

      return searchMatch && catMatch && sentMatch && ratingMatch;
    });
  }, [feedbacks, searchQuery, categoryFilter, sentimentFilter, ratingFilter]);

  const pendingCount = useMemo(() => {
    return feedbacks.filter((f) => f.sentiment.toUpperCase() === 'PENDING').length;
  }, [feedbacks]);

  const ratingLabels = {
    1: '1 Star - Unsatisfactory',
    2: '2 Stars - Needs Improvement',
    3: '3 Stars - Neutral / Satisfactory',
    4: '4 Stars - Good Experience',
    5: '5 Stars - Outstanding & Exceptional'
  };

  return (
    <div className="app-container">
      {/* Toast */}
      {toast && (
        <div className="toast">
          {toast.type === 'error' ? (
            <AlertCircle size={20} color="#f87171" />
          ) : (
            <CheckCircle2 size={20} color="#34d399" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="navbar">
        <a href="#" className="brand" onClick={() => setActiveTab('feed')}>
          <div className="brand-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="brand-name">FeedbackAI</span>
              <span className="brand-badge">Enterprise Intelligence</span>
            </div>
            <div className="nav-status">
              <span className="status-dot"></span>
              <span>Backend Connected • localhost:8080</span>
            </div>
          </div>
        </a>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <MessageSquarePlus size={16} />
            <span>Submit Feedback</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <LayoutGrid size={16} />
            <span>Feedback Feed</span>
            <span className="badge-count">{feedbacks.length}</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={16} />
            <span>Analytics & Insights</span>
            {adminAuth && <span className="badge-count">Unlocked</span>}
          </button>
        </nav>

        {/* Admin status pill */}
        <div>
          {adminAuth ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleAdminLogout}
              title="Logout Administrator"
            >
              <ShieldCheck size={16} color="#34d399" />
              <span>Admin: Active</span>
              <LogOut size={14} />
            </button>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('reports')}
              title="Authenticate Administrator Access"
            >
              <Lock size={15} />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* TAB 1: SUBMIT FEEDBACK                                    */}
      {/* ========================================================= */}
      {activeTab === 'submit' && (
        <div className="fade-in" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="card-title">
                  <MessageSquarePlus size={24} color="#6366f1" />
                  Submit Feedback
                </h2>
                <p className="card-subtitle">
                  Collect student, customer, or employee opinions with automated sentiment analysis.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCategoryModal(true)}
              >
                <PlusCircle size={15} />
                <span>New Category</span>
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback}>
              {/* Identity / User selection */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Submitting As</label>
                  <button
                    type="button"
                    onClick={() => setShowUserModal(true)}
                    style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    + Add New User
                  </button>
                </div>
                <select
                  className="form-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) — [{u.role}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Department / Category Selection */}
              <div className="form-group">
                <label className="form-label">Feedback Category / Department</label>
                <div className="category-chips">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      className={`chip ${selectedCategoryId === cat.id.toString() ? 'active' : ''}`}
                      onClick={() => setSelectedCategoryId(cat.id.toString())}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive 5-Star Rating */}
              <div className="form-group">
                <label className="form-label">Overall Rating (1 - 5 Stars)</label>
                <div className="star-rating-container">
                  <div className="stars-row">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        className="star-btn"
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                      >
                        <Star
                          size={28}
                          fill={(hoverRating || rating) >= s ? '#fbbf24' : 'transparent'}
                          color={(hoverRating || rating) >= s ? '#fbbf24' : '#64748b'}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="rating-label">{ratingLabels[hoverRating || rating]}</span>
                </div>
              </div>

              {/* Message */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label">Feedback Message</label>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {message.length} characters
                  </span>
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your experience, express suggestions, highlights, or areas requiring operational enhancement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Sentiment Pipeline Notification */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.2rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <BrainCircuit size={20} color="#818cf8" />
                <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#ffffff' }}>AI Pipeline Workflow:</strong> New submissions are registered with status <span className="sentiment-badge sentiment-pending" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>PENDING</span> and automatically classified through the NLP Sentiment Engine.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FEEDBACK FEED                                      */}
      {/* ========================================================= */}
      {activeTab === 'feed' && (
        <div className="fade-in">
          {/* Header Action Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Feedback Stream
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Monitoring verified submissions across institutional departments.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {pendingCount > 0 && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAnalyzePending}
                  disabled={loading}
                  title="Run sentiment classification for all pending feedbacks"
                >
                  <BrainCircuit size={16} />
                  <span>Analyze {pendingCount} Pending</span>
                </button>
              )}

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { fetchFeedback(); if (adminAuth) fetchReports(); }}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="filter-bar">
            {/* Search Box */}
            <div className="search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by keyword, user, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={15} color="#94a3b8" />
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sentiment Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
              >
                <option value="ALL">All Sentiments</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="ALL">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredFeedbacks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <MessageSquarePlus size={44} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No matching feedbacks found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                Try adjusting your filter options or submit a new entry.
              </p>
            </div>
          ) : (
            <div className="feed-grid">
              {filteredFeedbacks.map((item) => {
                const sentimentUpper = (item.sentiment || 'PENDING').toUpperCase();
                let badgeClass = 'sentiment-pending';
                let icon = <Clock size={12} />;

                if (sentimentUpper === 'POSITIVE') {
                  badgeClass = 'sentiment-positive';
                  icon = <ThumbsUp size={12} />;
                } else if (sentimentUpper === 'NEGATIVE') {
                  badgeClass = 'sentiment-negative';
                  icon = <ThumbsDown size={12} />;
                } else if (sentimentUpper === 'NEUTRAL') {
                  badgeClass = 'sentiment-neutral';
                  icon = <Minus size={12} />;
                }

                return (
                  <div key={item.id} className="feedback-card">
                    {/* Header */}
                    <div>
                      <div className="card-header-user">
                        <div className="user-avatar-info">
                          <div className="user-avatar">
                            {item.user?.name ? item.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="user-details">
                            <h4>{item.user?.name || 'Anonymous'}</h4>
                            <span>{item.user?.email}</span>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          color: '#cbd5e1'
                        }}>
                          {item.category?.name}
                        </span>
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '0.25rem', margin: '0.9rem 0 0.6rem 0' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            fill={item.rating >= s ? '#fbbf24' : 'transparent'}
                            color={item.rating >= s ? '#fbbf24' : '#475569'}
                          />
                        ))}
                      </div>

                      {/* Message Content */}
                      <p className="feedback-message">{item.message}</p>
                    </div>

                    {/* Footer */}
                    <div className="card-footer">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`sentiment-badge ${badgeClass}`}>
                          {icon}
                          <span>{sentimentUpper}</span>
                        </span>

                        {sentimentUpper === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateSentiment(item.id, item.rating >= 4 ? 'POSITIVE' : (item.rating <= 2 ? 'NEGATIVE' : 'NEUTRAL'))}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              color: '#fbbf24',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.5rem',
                              cursor: 'pointer'
                            }}
                          >
                            Classify
                          </button>
                        )}
                      </div>

                      <span>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just now'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ANALYTICS & REPORTS                                */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="fade-in">
          {!adminAuth ? (
            /* Admin Auth Barrier */
            <div style={{ maxWidth: '460px', margin: '3rem auto' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(79, 70, 229, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  color: '#818cf8'
                }}>
                  <Lock size={28} />
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Administrator Access</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.5rem 0 1.75rem 0' }}>
                  Executive summaries and departmental breakdown metrics are restricted to administrative credentials.
                </p>

                {authError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem'
                  }}>
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin} style={{ textAlign: 'left' }}>
                  <div className="form-group">
                    <label className="form-label">Administrator Username</label>
                    <input
                      type="text"
                      className="form-input"
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <ShieldCheck size={18} />
                    <span>Authenticate & Access Reports</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Live Reports Dashboard */
            <div>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                    Executive Intelligence Dashboard
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Live aggregate indicators powered by Spring Data JPA & Python NLP services.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fetchReports()}
                    disabled={loading}
                  >
                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                    <span>Refresh Analytics</span>
                  </button>
                </div>
              </div>

              {/* KPI Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8' }}>
                    <Layers size={26} />
                  </div>
                  <div className="metric-data">
                    <h3>{summaryReport ? summaryReport.totalFeedback : 0}</h3>
                    <p>Total Submissions</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                    <Star size={26} fill="#fbbf24" />
                  </div>
                  <div className="metric-data">
                    <h3>{summaryReport ? summaryReport.averageRating.toFixed(1) : '0.0'}</h3>
                    <p>Avg Rating (out of 5.0)</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <ThumbsUp size={26} />
                  </div>
                  <div className="metric-data">
                    <h3>{summaryReport ? summaryReport.positive : 0}</h3>
                    <p>Positive Feedback</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                    <Minus size={26} />
                  </div>
                  <div className="metric-data">
                    <h3>{summaryReport ? summaryReport.neutral : 0}</h3>
                    <p>Neutral / Mixed</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    <ThumbsDown size={26} />
                  </div>
                  <div className="metric-data">
                    <h3>{summaryReport ? summaryReport.negative : 0}</h3>
                    <p>Critical / Negative</p>
                  </div>
                </div>
              </div>

              {/* Sentiment Ratio Progress Bar */}
              {summaryReport && summaryReport.totalFeedback > 0 && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Overall Sentiment Ratio</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {Math.round((summaryReport.positive / summaryReport.totalFeedback) * 100)}% Positive Sentiment
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    height: '14px',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    background: 'var(--bg-input)'
                  }}>
                    <div
                      style={{
                        width: `${(summaryReport.positive / summaryReport.totalFeedback) * 100}%`,
                        background: '#10b981'
                      }}
                      title={`Positive: ${summaryReport.positive}`}
                    />
                    <div
                      style={{
                        width: `${(summaryReport.neutral / summaryReport.totalFeedback) * 100}%`,
                        background: '#0ea5e9'
                      }}
                      title={`Neutral: ${summaryReport.neutral}`}
                    />
                    <div
                      style={{
                        width: `${(summaryReport.negative / summaryReport.totalFeedback) * 100}%`,
                        background: '#ef4444'
                      }}
                      title={`Negative: ${summaryReport.negative}`}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    marginTop: '0.9rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                      <span>Positive ({summaryReport.positive})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }}></span>
                      <span>Neutral ({summaryReport.neutral})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                      <span>Critical ({summaryReport.negative})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Departmental / Category Breakdown Table */}
              <div className="card">
                <h3 className="card-title">
                  <SlidersHorizontal size={20} color="#6366f1" />
                  Departmental Satisfaction & Volume Matrix
                </h3>
                <p className="card-subtitle">
                  Aggregated statistics grouped by operational division (`GET /api/reports/category`)
                </p>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Submissions</th>
                        <th>Avg Rating</th>
                        <th>Positive</th>
                        <th>Neutral</th>
                        <th>Negative</th>
                        <th>Satisfaction Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryReports.map((cat) => {
                        const pct = cat.totalFeedback > 0 ? (cat.averageRating / 5) * 100 : 0;
                        return (
                          <tr key={cat.categoryId}>
                            <td style={{ fontWeight: '700', color: '#ffffff' }}>
                              {cat.categoryName}
                            </td>
                            <td>
                              <span style={{
                                padding: '0.2rem 0.6rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: '600'
                              }}>
                                {cat.totalFeedback}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                                <span style={{ fontWeight: '700' }}>
                                  {cat.averageRating > 0 ? cat.averageRating.toFixed(1) : '—'}
                                </span>
                              </div>
                            </td>
                            <td style={{ color: '#34d399', fontWeight: '600' }}>{cat.positive}</td>
                            <td style={{ color: '#38bdf8', fontWeight: '600' }}>{cat.neutral}</td>
                            <td style={{ color: '#f87171', fontWeight: '600' }}>{cat.negative}</td>
                            <td style={{ width: '180px' }}>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'var(--bg-input)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: pct >= 70 ? '#10b981' : (pct >= 50 ? '#f59e0b' : '#ef4444')
                                }} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD CATEGORY                                       */}
      {/* ========================================================= */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Add Department Category
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Create a new organizational channel for feedback tracking.
            </p>

            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Health & Safety, Placement Cell, Labs"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD USER                                           */}
      {/* ========================================================= */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Register User Profile
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Add a new student, employee, or stakeholder identity to the database.
            </p>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. David Ross"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. david.ross@feedbackai.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
