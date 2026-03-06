import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@components/ui/PageHeader";
import useReports from "../hooks/useReports";
import { ExportOptions, PaymentsReport as PaymentsReportView, ReportFilters } from "../components";
import {
  selectCurrentReport,
  selectPaymentsReportError,
  selectPaymentsReportLoading,
  selectReportsExporting,
  selectReportsFilters,
} from "../store";

const PaymentsReportPage = () => {
  const { fetchPaymentsReport, updateFilters, resetFilters, quickExport } = useReports();
  const report = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectPaymentsReportLoading);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectPaymentsReportError);

  useEffect(() => {
    fetchPaymentsReport(filters).catch(() => {});
  }, [fetchPaymentsReport]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Repayments Report"
        subTitle="Collections, repayment performance, and payment consistency."
      />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={() => fetchPaymentsReport(filters)}
        onReset={resetFilters}
        loading={loading}
      />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("payments", "pdf", filters)}
        onExportExcel={() => quickExport("payments", "excel", filters)}
      />

      <PaymentsReportView report={report} />
    </div>
  );
};

export default PaymentsReportPage;
