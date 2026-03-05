import React from "react";
import ReportPreview from "./ReportPreview";

const PerformanceReport = ({ report }) => {
  return <ReportPreview title="Performance Report" report={report} />;
};

export default PerformanceReport;
