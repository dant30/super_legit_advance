import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { PageHeader } from "@components/ui";
import useReports from "../hooks/useReports";
import {
  ExportOptions,
  ReportFilters,
  ReportGenerator,
  ReportPreview,
} from "../components";
import {
  selectCurrentReport,
  selectReportsError,
  selectReportsExporting,
  selectReportsFilters,
  selectReportsGenerating,
  selectReportsLoading,
} from "../store";

const ReportDashboard = () => {
  const {
    updateFilters,
    resetFilters,
    generateReportByType,
    quickExport,
    clearError,
  } = useReports();

  const currentReport = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectReportsLoading);
  const generating = useSelector(selectReportsGenerating);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectReportsError);

  const loadingAny = useMemo(
    () => Boolean(loading || generating || exporting),
    [loading, generating, exporting]
  );

  const handleApplyFilters = () => {
    clearError();
  };

  const handleGenerate = async (reportType) => {
    await generateReportByType(reportType, "json", filters);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports Dashboard"
        subTitle="Generate, filter, preview, and export portfolio reports."
      />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={handleApplyFilters}
        onReset={resetFilters}
        loading={loadingAny}
      />

      <ReportGenerator onGenerate={handleGenerate} generating={generating} />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("dashboard", "pdf", filters)}
        onExportExcel={() => quickExport("dashboard", "excel", filters)}
      />

      <ReportPreview title="Latest Generated Report" report={currentReport} />
    </div>
  );
};

export default ReportDashboard;
