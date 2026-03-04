function buildLinePath(points, width, height, padding) {
  if (!points.length) return "";
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  return points
    .map((point, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function LineChart({
  data = [],
  height = 220,
  title = "Trend",
  className = "",
}) {
  const normalizedData = data.map((point, index) => ({
    label: String(point?.label ?? `Point ${index + 1}`),
    value: Number(point?.value ?? 0),
  }));
  const width = 640;
  const padding = 24;
  const values = normalizedData.map((d) => d.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const span = max - min || 1;
  const stepX = normalizedData.length > 1 ? (width - padding * 2) / (normalizedData.length - 1) : 0;
  const path = buildLinePath(normalizedData, width, height, padding);
  const latestPoint = normalizedData[normalizedData.length - 1];

  return (
    <section className={`ui-chart-shell ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="ui-chart-title">{title}</h3>
        <span className="ui-chart-meta">{normalizedData.length} points</span>
      </header>
      <p className="sr-only">
        {`${title}. ${normalizedData.length} points. Minimum value ${min}. Maximum value ${max}.`}
      </p>
      {normalizedData.length === 0 ? (
        <p className="ui-help">No data available.</p>
      ) : (
        <div className="grid gap-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${title} line chart`}
          >
            <line className="ui-chart-grid" x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
            <line className="ui-chart-grid" x1={padding} y1={padding} x2={padding} y2={height - padding} />
            <path d={path} fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {normalizedData.map((point, index) => {
              const x = padding + index * stepX;
              const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
              return (
                <g key={`${point.label}-${index}`}>
                  <circle cx={x} cy={y} r="3.5" fill="#1d4ed8" />
                  <title>{`${point.label}: ${point.value}`}</title>
                </g>
              );
            })}
          </svg>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-md bg-gray-50 px-2 py-1.5 text-gray-600 dark:bg-slate-700/60 dark:text-gray-300">
              Min: <span className="font-semibold text-gray-900 dark:text-gray-100">{min}</span>
            </div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 text-gray-600 dark:bg-slate-700/60 dark:text-gray-300">
              Max: <span className="font-semibold text-gray-900 dark:text-gray-100">{max}</span>
            </div>
            <div className="rounded-md bg-gray-50 px-2 py-1.5 text-gray-600 dark:bg-slate-700/60 dark:text-gray-300">
              Latest: <span className="font-semibold text-gray-900 dark:text-gray-100">{latestPoint?.value ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
