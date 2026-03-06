import React from "react";
import Card from "@components/ui/Card";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";

const ReportFilters = ({ filters = {}, onChange, onApply, onReset, loading = false }) => {
  const handleField = (field) => (event) => {
    onChange?.({ [field]: event.target.value });
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">
        Filters
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          type="date"
          label="Start date"
          value={filters.start_date || ""}
          onChange={handleField("start_date")}
        />
        <Input
          type="date"
          label="End date"
          value={filters.end_date || ""}
          onChange={handleField("end_date")}
        />
        <Input
          label="Search"
          placeholder="Borrower, loan no, reference..."
          value={filters.search || ""}
          onChange={handleField("search")}
        />
        <Input
          label="Status"
          placeholder="e.g. active, overdue"
          value={filters.status || ""}
          onChange={handleField("status")}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button type="button" variant="primary" size="sm" onClick={onApply} loading={loading}>
          Apply
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default ReportFilters;
