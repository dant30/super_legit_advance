import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@components/ui/PageHeader";
import useReports from "../hooks/useReports";
import { ExportOptions, LoansReport as LoansReportView, ReportFilters } from "../components";
import {
  selectCurrentReport,
  selectLoansReportError,
  selectLoansReportLoading,
  selectReportsExporting,
  selectReportsFilters,
} from "../store";

const LoansReportPage = () => {
  const { fetchLoansReport, updateFilters, resetFilters, quickExport } = useReports();
  const report = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectLoansReportLoading);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectLoansReportError);

  useEffect(() => {
    fetchLoansReport(filters).catch(() => {});
  }, [fetchLoansReport]);

  return (
    <div className="space-y-4">
      <PageHeader title="Loans Report" subTitle="Loan portfolio analysis and status breakdown." />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={() => fetchLoansReport(filters)}
        onReset={resetFilters}
        loading={loading}
      />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("loans", "pdf", filters)}
        onExportExcel={() => quickExport("loans", "excel", filters)}
      />

      <LoansReportView report={report} />
    </div>
  );
};

export default LoansReportPage;
