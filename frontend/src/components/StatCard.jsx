export default function StatCard({ label, value, detail, tone = 'blue' }) {
  return <div className={`stat-card tone-${tone}`}>
    <div className="stat-accent" />
    <p className="stat-label">{label}</p>
    <div className="stat-value">{value}</div>
    {detail && <p className="stat-detail">{detail}</p>}
  </div>
}
