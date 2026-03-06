import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@components/ui/PageHeader";
import useReports from "../hooks/useReports";
import { CollectionReport as CollectionReportView, ExportOptions, ReportFilters } from "../components";
import {
  selectCollectionReportError,
  selectCollectionReportLoading,
  selectCurrentReport,
  selectReportsExporting,
  selectReportsFilters,
} from "../store";

const CollectionReportPage = () => {
  const { fetchCollectionReport, updateFilters, resetFilters, quickExport } = useReports();
  const report = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectCollectionReportLoading);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectCollectionReportError);

  useEffect(() => {
    fetchCollectionReport(filters).catch(() => {});
  }, [fetchCollectionReport]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Collection Report"
        subTitle="Repayment collections, target tracking, and recovery insights."
      />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={() => fetchCollectionReport(filters)}
        onReset={resetFilters}
        loading={loading}
      />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("collection", "pdf", filters)}
        onExportExcel={() => quickExport("collection", "excel", filters)}
      />

      <CollectionReportView report={report} />
    </div>
  );
};

export default CollectionReportPage;
