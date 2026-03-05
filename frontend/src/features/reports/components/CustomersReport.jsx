import React from "react";
import ReportPreview from "./ReportPreview";

const CustomersReport = ({ report }) => {
  return <ReportPreview title="Borrowers Report" report={report} />;
};

export default CustomersReport;
