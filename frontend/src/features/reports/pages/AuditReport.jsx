import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { PageHeader } from "@components/ui";
import useReports from "../hooks/useReports";
import { AuditReport as AuditReportView, ExportOptions, ReportFilters } from "../components";
import {
  selectAuditReportError,
  selectAuditReportLoading,
  selectCurrentReport,
  selectReportsExporting,
  selectReportsFilters,
} from "../store";

const AuditReportPage = () => {
  const { fetchAuditReport, updateFilters, resetFilters, quickExport } = useReports();
  const report = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectAuditReportLoading);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectAuditReportError);

  useEffect(() => {
    fetchAuditReport(filters).catch(() => {});
  }, [fetchAuditReport]);

  return (
    <div className="space-y-4">
      <PageHeader title="Audit Report" subTitle="Operational and compliance audit trail insights." />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={() => fetchAuditReport(filters)}
        onReset={resetFilters}
        loading={loading}
      />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("audit", "pdf", filters)}
        onExportExcel={() => quickExport("audit", "excel", filters)}
      />

      <AuditReportView report={report} />
    </div>
  );
};

export default AuditReportPage;
