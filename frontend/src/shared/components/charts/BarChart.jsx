export default function BarChart({
  data = [],
  height = 220,
  title = "Distribution",
  className = "",
}) {
  const normalizedData = data.map((item, index) => ({
    label: String(item?.label ?? `Item ${index + 1}`),
    value: Number(item?.value ?? 0),
  }));
  const width = 640;
  const padding = 24;
  const maxValue = Math.max(...normalizedData.map((d) => d.value), 1);
  const chartHeight = height - padding * 2;
  const gap = 12;
  const barWidth = normalizedData.length
    ? (width - padding * 2 - gap * (normalizedData.length - 1)) / normalizedData.length
    : 0;
  const total = normalizedData.reduce((sum, item) => sum + item.value, 0);
  const maxItem = normalizedData.reduce(
    (currentMax, item) => (item.value > currentMax.value ? item : currentMax),
    normalizedData[0] || { label: "n/a", value: 0 }
  );
  const hasData = normalizedData.length > 0;

  return (
    <section className={`ui-chart-shell ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="ui-chart-title">{title}</h3>
        <span className="ui-chart-meta">{normalizedData.length} categories</span>
      </header>
      <p className="sr-only">
        {`${title}. ${normalizedData.length} categories. Total value ${total}. Highest category ${maxItem.label} with value ${maxItem.value}.`}
      </p>
      {!hasData ? (
        <p className="ui-help">No data available.</p>
      ) : (
        <div className="grid gap-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${title} bar chart`}
          >
            <line className="ui-chart-grid" x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
            {normalizedData.map((item, index) => {
              const x = padding + index * (barWidth + gap);
              const barHeight = (item.value / maxValue) * chartHeight;
              const y = height - padding - barHeight;
              return (
                <g key={`${item.label}-${index}`}>
                  <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#2563eb" />
                  <title>{`${item.label}: ${item.value}`}</title>
                  <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <ul className="grid gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            {normalizedData.map((item, index) => (
              <li key={`${item.label}-summary-${index}`} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{item.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
