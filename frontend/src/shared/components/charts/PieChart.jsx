const PALETTE = [
  "#2563eb",
  "#1d4ed8",
  "#0891b2",
  "#15803d",
  "#b45309",
  "#b91c1c",
];

function polarToCartesian(cx, cy, radius, angleDeg) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function PieChart({ data = [], title = "Share", className = "" }) {
  const normalizedData = data.map((item, index) => ({
    label: String(item?.label ?? `Segment ${index + 1}`),
    value: Number(item?.value ?? 0),
  }));
  const width = 360;
  const height = 220;
  const cx = 110;
  const cy = 110;
  const radius = 84;
  const total = normalizedData.reduce((sum, item) => sum + item.value, 0);

  let start = 0;
  const segments = normalizedData.map((item, index) => {
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const segment = {
      ...item,
      color: PALETTE[index % PALETTE.length],
      startAngle: start,
      endAngle: start + angle,
    };
    start += angle;
    return segment;
  });

  return (
    <section className={`ui-chart-shell ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="ui-chart-title">{title}</h3>
        <span className="ui-chart-meta">{segments.length} segments</span>
      </header>
      <p className="sr-only">
        {`${title}. ${segments.length} segments. Total value ${total}.`}
      </p>
      {normalizedData.length === 0 || total <= 0 ? (
        <p className="ui-help">No data available.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${title} pie chart`}
          >
            {segments.map((segment, index) => (
              <path
                key={`${segment.label}-${index}`}
                d={buildArc(cx, cy, radius, segment.startAngle, segment.endAngle)}
                fill={segment.color}
              >
                <title>{`${segment.label}: ${segment.value}`}</title>
              </path>
            ))}
          </svg>
          <ul className="grid content-start gap-2" aria-label={`${title} legend`}>
            {segments.map((segment, index) => (
              <li key={`${segment.label}-legend-${index}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                  {segment.label}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {((segment.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
