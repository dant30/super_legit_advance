import React from "react";
import Card from "@components/ui/Card";

const ReportPreview = ({ title = "Report Preview", report }) => {
  const summary = report?.summary && typeof report.summary === "object" ? report.summary : null;
  const primaryListKey = report
    ? Object.keys(report).find((key) => Array.isArray(report[key]) && report[key].length > 0)
    : null;
  const rows = primaryListKey ? report[primaryListKey] : [];
  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 6) : [];

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <div className="mb-3 border-b border-slate-200 pb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
          {title}
        </h3>
      </div>

      {report ? (
        <div className="space-y-4">
          {summary ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(summary).slice(0, 8).map(([key, value]) => (
                <div key={key} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {String(key).replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {typeof value === "number" ? value.toLocaleString() : String(value)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {String(col).replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.slice(0, 12).map((row, index) => (
                    <tr key={`${primaryListKey}-${index}`}>
                      {columns.map((col) => (
                        <td key={`${primaryListKey}-${index}-${col}`} className="px-3 py-2 text-slate-700">
                          {row[col] == null ? "-" : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
              Report loaded, but no rows matched the current filters.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm text-slate-600">
          No report data available.
        </p>
      )}
    </Card>
  );
};

export default ReportPreview;
