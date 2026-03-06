import React from "react";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";

const ExportOptions = ({ onExportPdf, onExportExcel, exporting = false }) => {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">
        Export
      </h3>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onExportPdf} loading={exporting}>
          Export PDF
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onExportExcel} loading={exporting}>
          Export Excel
        </Button>
      </div>
    </Card>
  );
};

export default ExportOptions;
