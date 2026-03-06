import React, { useState } from "react";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import Select from "@components/ui/Select";
import { REPORT_TYPE } from "../types";

const REPORT_TYPE_OPTIONS = [
  { value: REPORT_TYPE.LOANS, label: "Loans" },
  { value: REPORT_TYPE.PAYMENTS, label: "Payments" },
  { value: REPORT_TYPE.CUSTOMERS, label: "Borrowers" },
  { value: REPORT_TYPE.PERFORMANCE, label: "Performance" },
  { value: REPORT_TYPE.COLLECTION, label: "Collection" },
  { value: REPORT_TYPE.AUDIT, label: "Audit" },
];

const ReportGenerator = ({ onGenerate, generating = false }) => {
  const [reportType, setReportType] = useState(REPORT_TYPE.LOANS);

  const handleGenerate = () => {
    onGenerate?.(reportType);
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">
        Generate Report
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Select
          label="Report type"
          value={reportType}
          onChange={(event) => setReportType(event.target.value)}
          options={REPORT_TYPE_OPTIONS}
        />
        <div className="md:col-span-2 flex items-end">
          <Button type="button" variant="primary" size="sm" onClick={handleGenerate} loading={generating}>
            Generate
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReportGenerator;
