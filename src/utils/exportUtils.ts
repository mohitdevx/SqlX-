import type { ColumnMetadata } from '@/types/database';
import type { QueryRow, QueryRowValue } from './dataTransforms';

export function downloadJsonFile(data: unknown, filename = `sqlx_export_${Date.now()}.json`) {
  const fullJson = JSON.stringify(data, null, 2);
  const blob = new Blob([fullJson], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsvFile(
  columns: ColumnMetadata[],
  rows: QueryRow[],
  filename = `sqlx_export_${Date.now()}.csv`
) {
  const headers = columns.map((c) => `"${c.name.replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    row
      .map((cell: QueryRowValue) => {
        if (cell === null) return '';
        return `"${String(cell).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rowLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyJsonToClipboard(data: unknown): Promise<void> {
  const fullJson = JSON.stringify(data, null, 2);
  return navigator.clipboard.writeText(fullJson);
}
