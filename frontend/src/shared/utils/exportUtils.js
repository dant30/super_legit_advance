function escapeCsvCell(value) {
  const raw = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function toCsv(rows = [], columns = null) {
  if (!Array.isArray(rows) || !rows.length) return "";
  const keys = columns && columns.length ? columns : Object.keys(rows[0]);
  const header = keys.map(escapeCsvCell).join(",");
  const body = rows
    .map((row) => keys.map((key) => escapeCsvCell(row?.[key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadBlob(content, fileName, mimeType = "text/plain;charset=utf-8") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function downloadCsv(rows, fileName = "export.csv", columns = null) {
  const csv = toCsv(rows, columns);
  downloadBlob(csv, fileName, "text/csv;charset=utf-8");
}

export function toJsonFile(rows = []) {
  return JSON.stringify(rows, null, 2);
}
