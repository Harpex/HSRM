interface ProgressBarProps {
  value: number;
  label?: string;
}

export const ProgressBar = ({ value, label }: ProgressBarProps) => {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-wrap" aria-label={label}>
      <div className="progress-meta">
        {label ? <span>{label}</span> : <span>İlerleme</span>}
        <strong>{safeValue}%</strong>
      </div>
      <div className="progress-track">
        <span className="progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
};
