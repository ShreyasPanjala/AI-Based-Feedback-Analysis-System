const KEY = 'feedbackai-browser-demo-v1'

const categories = ['Academic', 'Infrastructure', 'Faculty', 'Transport', 'Food', 'General']
  .map((name, index) => ({ id: index + 1, name }))
const users = [
  { id: 1, name: 'Demo Student' },
  { id: 2, name: 'Demo Employee' },
  { id: 3, name: 'Demo Customer' },
]
const examples = [
  [1, 1, 'The course materials were clear and very helpful.', 5, 'POSITIVE'],
  [2, 1, 'The assignment instructions were confusing and poorly organized.', 2, 'NEGATIVE'],
  [1, 2, 'The new study area is clean and comfortable.', 4, 'POSITIVE'],
  [2, 2, 'The classroom projector is broken and the room is too hot.', 2, 'NEGATIVE'],
  [1, 3, 'The instructor answered every question patiently and clearly.', 5, 'POSITIVE'],
  [3, 3, 'The faculty meeting took place on Monday morning.', 3, 'NEUTRAL'],
  [1, 4, 'The transport service is terrible and buses are always late.', 1, 'NEGATIVE'],
  [2, 4, 'The bus arrived at the main gate at eight.', 3, 'NEUTRAL'],
  [3, 5, 'The cafeteria food was fresh and delicious today.', 5, 'POSITIVE'],
  [1, 5, 'The lunch was cold and tasted awful.', 2, 'NEGATIVE'],
  [2, 6, 'The seminar was conducted in room 204.', 3, 'NEUTRAL'],
  [3, 6, 'The support team was friendly and solved my issue quickly.', 4, 'POSITIVE'],
]

function readFeedback() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(stored)) return stored
  } catch { /* Recover from malformed browser storage. */ }
  return examples.map(([userId, categoryId, message, rating, sentiment], index) => ({
    id: index + 1, userId, categoryId, message, rating, sentiment,
    createdAt: new Date(Date.now() - (examples.length - index) * 3600000).toISOString(),
  }))
}

function summary(items) {
  const count = sentiment => items.filter(item => item.sentiment === sentiment).length
  return {
    totalFeedback: items.length,
    averageRating: items.length ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0,
    positive: count('POSITIVE'), neutral: count('NEUTRAL'),
    negative: count('NEGATIVE'), pending: count('PENDING'),
  }
}

export const demoApi = {
  async get(path) {
    const items = readFeedback()
    if (path === '/users') return { data: users }
    if (path === '/categories') return { data: categories }
    if (path === '/feedback') return { data: items }
    if (path === '/reports/summary') return { data: summary(items) }
    if (path === '/reports/category') return { data: categories.map(category => {
      const matching = items.filter(item => item.categoryId === category.id)
      return { category: category.name, feedbackCount: matching.length,
        averageRating: matching.length ? matching.reduce((sum, item) => sum + item.rating, 0) / matching.length : 0 }
    }) }
    throw new Error(`Unknown demo endpoint: ${path}`)
  },
  async post(path, request) {
    if (path !== '/feedback') throw new Error(`Unknown demo endpoint: ${path}`)
    if (!users.some(user => user.id === request.userId) || !categories.some(category => category.id === request.categoryId)
      || !request.message?.trim() || !Number.isInteger(request.rating) || request.rating < 1 || request.rating > 5) {
      throw new Error('Choose a user and category, write a message, and rate from 1 to 5.')
    }
    const items = readFeedback()
    const item = { ...request, id: Math.max(0, ...items.map(value => value.id)) + 1,
      sentiment: 'PENDING', createdAt: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify([...items, item]))
    return { data: item }
  },
}
