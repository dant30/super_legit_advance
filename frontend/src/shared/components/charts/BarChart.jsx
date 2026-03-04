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

  return (
    <section className={`ui-chart-shell ${className}`}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-500">{normalizedData.length} categories</span>
      </header>
      <p className="sr-only">
        {`${title}. ${normalizedData.length} categories. Total value ${total}. Highest category ${maxItem.label} with value ${maxItem.value}.`}
      </p>
      {normalizedData.length === 0 ? (
        <p className="text-sm text-slate-500">No data available.</p>
      ) : (
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
                <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="var(--fm-color-info)" />
                <title>{`${item.label}: ${item.value}`}</title>
                <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--fm-color-text-soft)">
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </section>
  );
}
