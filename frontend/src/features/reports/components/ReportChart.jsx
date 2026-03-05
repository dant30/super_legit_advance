import React from "react";
import { Card } from "@components/ui";

const ReportChart = ({ title = "Chart", data = [] }) => {
  const chartData = Array.isArray(data) ? data : [];
  const maxValue = chartData.length
    ? Math.max(...chartData.map((item) => Number(item.value || 0)), 1)
    : 1;

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">
        {title}
      </h3>

      {chartData.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm text-slate-600">
          No chart data available.
        </p>
      ) : (
        <ul className="space-y-2">
          {chartData.map((item, index) => {
            const value = Number(item.value || 0);
            const percent = Math.round((value / maxValue) * 100);
            return (
              <li key={`${item.label || "item"}-${index}`}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{item.label || `Item ${index + 1}`}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary-600 transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default ReportChart;
