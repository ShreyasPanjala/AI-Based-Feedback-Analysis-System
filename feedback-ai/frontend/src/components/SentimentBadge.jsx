export default function SentimentBadge({ value }) {
  const sentiment = value || 'PENDING'
  return <span className={`sentiment-badge sentiment-${sentiment.toLowerCase()}`}>{sentiment}</span>
}
