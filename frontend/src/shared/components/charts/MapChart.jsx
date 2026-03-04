const DEFAULT_POINTS = [
  { x: 24, y: 48, label: "A", intensity: 0.2 },
  { x: 42, y: 30, label: "B", intensity: 0.45 },
  { x: 57, y: 44, label: "C", intensity: 0.7 },
  { x: 72, y: 26, label: "D", intensity: 0.9 },
];

function intensityColor(intensity) {
  if (intensity >= 0.8) return "#be123c";
  if (intensity >= 0.6) return "#b45309";
  if (intensity >= 0.35) return "#1d4ed8";
  return "#059669";
}

export default function MapChart({
  points = DEFAULT_POINTS,
  title = "Map Heat Layer",
  className = "",
}) {
  const normalizedPoints = points.map((point, index) => ({
    x: Number(point?.x ?? 0),
    y: Number(point?.y ?? 0),
    label: String(point?.label ?? `P${index + 1}`),
    intensity: Math.max(0, Math.min(1, Number(point?.intensity ?? 0))),
  }));
  const summary = `${title}. ${normalizedPoints.length} plotted points with low to critical intensity levels.`;
  return (
    <section className={`ui-chart-shell ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="ui-chart-title">{title}</h3>
        <span className="ui-chart-meta">{normalizedPoints.length} points</span>
      </header>
      <p className="sr-only">{summary}</p>
      <svg
        viewBox="0 0 100 60"
        className="h-auto w-full rounded-lg bg-slate-50 dark:bg-slate-900/50"
        role="img"
        aria-label={`${title} heat map`}
      >
        <rect x="0" y="0" width="100" height="60" fill="#eef4ff" />
        <path d="M8 50 L20 42 L36 48 L54 38 L68 44 L90 30" fill="none" stroke="#c5d5ea" strokeWidth="1.3" />
        <path d="M10 18 L22 24 L34 16 L48 20 L64 12 L82 18" fill="none" stroke="#d4e2f2" strokeWidth="1.1" />
        {normalizedPoints.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle cx={point.x} cy={point.y} r={2.1 + point.intensity * 2.4} fill={intensityColor(point.intensity)} opacity="0.85" />
            <circle cx={point.x} cy={point.y} r="1.2" fill="#fff" />
            <title>{`${point.label} (${Math.round(point.intensity * 100)}%)`}</title>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300" aria-label="Heat levels legend">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600" />Low</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-700" />Medium</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-700" />High</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-700" />Critical</span>
      </div>
    </section>
  );
}
