import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@components/ui/PageHeader";
import useReports from "../hooks/useReports";
import {
  ExportOptions,
  PerformanceReport as PerformanceReportView,
  ReportChart,
  ReportFilters,
} from "../components";
import {
  selectCurrentReport,
  selectPerformanceReportError,
  selectPerformanceReportLoading,
  selectReportsExporting,
  selectReportsFilters,
} from "../store";

const PerformanceReportPage = () => {
  const { fetchPerformanceReport, updateFilters, resetFilters, quickExport } = useReports();
  const report = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectPerformanceReportLoading);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectPerformanceReportError);

  useEffect(() => {
    fetchPerformanceReport(filters).catch(() => {});
  }, [fetchPerformanceReport]);

  const chartData = useMemo(() => {
    if (!report || typeof report !== "object") return [];
    return Object.entries(report)
      .filter(([, value]) => typeof value === "number")
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [report]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Performance Report"
        subTitle="Operational efficiency and repayment performance indicators."
      />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={() => fetchPerformanceReport(filters)}
        onReset={resetFilters}
        loading={loading}
      />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("performance", "pdf", filters)}
        onExportExcel={() => quickExport("performance", "excel", filters)}
      />

      <ReportChart title="Performance Highlights" data={chartData} />
      <PerformanceReportView report={report} />
    </div>
  );
};

export default PerformanceReportPage;
