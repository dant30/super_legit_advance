import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import PageHeader from "@components/ui/PageHeader";
import useReports from "../hooks/useReports";
import { CustomersReport as CustomersReportView, ExportOptions, ReportFilters } from "../components";
import {
  selectCustomersReportError,
  selectCustomersReportLoading,
  selectCurrentReport,
  selectReportsExporting,
  selectReportsFilters,
} from "../store";

const CustomersReportPage = () => {
  const { fetchCustomersReport, updateFilters, resetFilters, quickExport } = useReports();
  const report = useSelector(selectCurrentReport);
  const filters = useSelector(selectReportsFilters);
  const loading = useSelector(selectCustomersReportLoading);
  const exporting = useSelector(selectReportsExporting);
  const error = useSelector(selectCustomersReportError);

  useEffect(() => {
    fetchCustomersReport(filters).catch(() => {});
  }, [fetchCustomersReport]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Borrowers Report"
        subTitle="Borrower portfolio, segmentation, and activity metrics."
      />

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}

      <ReportFilters
        filters={filters}
        onChange={updateFilters}
        onApply={() => fetchCustomersReport(filters)}
        onReset={resetFilters}
        loading={loading}
      />

      <ExportOptions
        exporting={exporting}
        onExportPdf={() => quickExport("customers", "pdf", filters)}
        onExportExcel={() => quickExport("customers", "excel", filters)}
      />

      <CustomersReportView report={report} />
    </div>
  );
};

export default CustomersReportPage;
