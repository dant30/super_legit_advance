function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function GaugeChart({
  value = 0,
  min = 0,
  max = 100,
  title = "Gauge",
  unit = "%",
  thresholds = { warning: 60, danger: 80 },
  className = "",
}) {
  const numericValue = Number(value ?? 0);
  const numericMin = Number(min ?? 0);
  const numericMax = Number(max ?? 100);
  const normalized = clamp(((numericValue - numericMin) / (numericMax - numericMin || 1)) * 100, 0, 100);
  const angle = -90 + (normalized / 100) * 180;
  const warningThreshold = Number(thresholds?.warning ?? 60);
  const dangerThreshold = Number(thresholds?.danger ?? 80);
  const color =
    normalized >= dangerThreshold
      ? "var(--fm-color-danger)"
      : normalized >= warningThreshold
      ? "var(--fm-color-warning)"
      : "var(--fm-color-success)";

  const radius = 90;
  const circumference = Math.PI * radius;
  const strokeOffset = circumference - (normalized / 100) * circumference;

  return (
    <section className={`ui-chart-shell ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-500">{normalized.toFixed(0)}%</span>
      </header>
      <p className="sr-only">
        {`${title}. Current value ${numericValue}${unit}. Range ${numericMin} to ${numericMax}.`}
      </p>
      <div className="mx-auto max-w-[260px]">
        <svg
          viewBox="0 0 240 140"
          className="h-auto w-full"
          role="img"
          aria-label={`${title} gauge`}
        >
          <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke="var(--fm-color-border)" strokeWidth="14" />
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
          <g transform={`rotate(${angle}, 120, 120)`}>
            <line x1="120" y1="120" x2="120" y2="36" stroke="var(--fm-color-text)" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle cx="120" cy="120" r="6" fill="var(--fm-color-text)" />
          <text x="120" y="95" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--fm-color-text)">
            {numericValue}
          </text>
          <text x="120" y="114" textAnchor="middle" fontSize="12" fill="var(--fm-color-text-soft)">
            {unit}
          </text>
        </svg>
      </div>
    </section>
  );
}
