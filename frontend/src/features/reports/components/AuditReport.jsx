import React from "react";
import ReportPreview from "./ReportPreview";

const AuditReport = ({ report }) => {
  return <ReportPreview title="Audit Report" report={report} />;
};

export default AuditReport;
