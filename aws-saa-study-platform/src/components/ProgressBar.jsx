export default function ProgressBar({ value, max, label, showPercent = true, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  
  return (
    <div style={{ width: '100%' }}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
          {label && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>}
          {showPercent && <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color || 'var(--aws-orange)' }}>{pct}%</span>}
        </div>
      )}
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: color
              ? `linear-gradient(90deg, ${color}, ${color}aa)`
              : 'linear-gradient(90deg, var(--aws-orange), #FFB347)',
          }}
        />
      </div>
    </div>
  );
}
