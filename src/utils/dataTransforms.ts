import type { ColumnMetadata } from '@/types/database';

export type QueryRowValue = string | number | boolean | null | object;
export type QueryRow = QueryRowValue[];

export interface TransformResult {
  newRows?: QueryRow[];
  label?: string;
  toast: string;
}

export function applyDataTransform(
  optionId: string,
  columns: ColumnMetadata[],
  currentRows: QueryRow[],
  jsonObjects: Record<string, unknown>[]
): TransformResult {
  let newRows: QueryRow[] = currentRows.map((r) => [...r]);
  let label = '';
  let toast = '';

  switch (optionId) {
    case 'uppercase':
      newRows = newRows.map((r) => r.map((c) => (typeof c === 'string' ? c.toUpperCase() : c)));
      label = 'Uppercase Text';
      toast = 'Converted text columns to UPPERCASE';
      break;

    case 'lowercase':
      newRows = newRows.map((r) => r.map((c) => (typeof c === 'string' ? c.toLowerCase() : c)));
      label = 'Lowercase Text';
      toast = 'Converted text columns to lowercase';
      break;

    case 'trim':
      newRows = newRows.map((r) => r.map((c) => (typeof c === 'string' ? c.trim() : c)));
      label = 'Trimmed Whitespace';
      toast = 'Trimmed whitespace across all text cells';
      break;

    case 'reverse':
      newRows = [...newRows].reverse();
      label = 'Reversed Order';
      toast = 'Inverted row sequence';
      break;

    case 'sort_asc':
      newRows = [...newRows].sort((a, b) => {
        const valA = a[0] ?? '';
        const valB = b[0] ?? '';
        return String(valA).localeCompare(String(valB), undefined, { numeric: true });
      });
      label = 'Sorted ASC';
      toast = 'Sorted rows ascending by column 1';
      break;

    case 'sort_desc':
      newRows = [...newRows].sort((a, b) => {
        const valA = a[0] ?? '';
        const valB = b[0] ?? '';
        return String(valB).localeCompare(String(valA), undefined, { numeric: true });
      });
      label = 'Sorted DESC';
      toast = 'Sorted rows descending by column 1';
      break;

    case 'mask_emails':
      newRows = newRows.map((r) =>
        r.map((c) => {
          if (typeof c === 'string' && c.includes('@')) {
            return c.replace(/^([^@]{1,2})[^@]*(@.+)$/, '$1***$2');
          }
          return c;
        })
      );
      label = 'Masked Emails';
      toast = 'Masked email addresses in results';
      break;

    case 'mask_phones':
      newRows = newRows.map((r) =>
        r.map((c) => {
          const str = String(c ?? '');
          const cleaned = str.replace(/[-()\s]/g, '');
          if (/^\+?\d{7,15}$/.test(cleaned)) {
            return `***-***-${cleaned.slice(-4)}`;
          }
          return c;
        })
      );
      label = 'Masked Phones';
      toast = 'Masked phone numbers in results';
      break;

    case 'redact_secrets':
      newRows = newRows.map((r) =>
        r.map((c, colIdx) => {
          const colName = columns[colIdx]?.name.toLowerCase() || '';
          if (
            colName.includes('pass') ||
            colName.includes('secret') ||
            colName.includes('token') ||
            colName.includes('key') ||
            colName.includes('auth') ||
            colName.includes('ssn')
          ) {
            return '[REDACTED]';
          }
          return c;
        })
      );
      label = 'Redacted Secrets';
      toast = 'Redacted credential and token columns';
      break;

    case 'anonymize_ids':
      newRows = newRows.map((r) =>
        r.map((c, colIdx) => {
          const colName = columns[colIdx]?.name.toLowerCase() || '';
          if (colName === 'id' || colName.endsWith('_id')) {
            const hash = Math.abs(
              String(c)
                .split('')
                .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
            )
              .toString(16)
              .padStart(6, '0')
              .slice(0, 8);
            return `anon_${hash}`;
          }
          return c;
        })
      );
      label = 'Hashed IDs';
      toast = 'Anonymized identifier columns';
      break;

    case 'deduplicate': {
      const seen = new Set<string>();
      newRows = newRows.filter((r) => {
        const key = JSON.stringify(r);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      label = 'Deduplicated';
      toast = `Retained ${newRows.length} unique rows`;
      break;
    }

    case 'append_totals': {
      const totalsRow: (string | number | null)[] = columns.map((_col, idx) => {
        if (idx === 0) return 'TOTAL';
        const nums = newRows.map((r) => Number(r[idx])).filter((n) => !Number.isNaN(n));
        if (nums.length === newRows.length && nums.length > 0) {
          return +nums.reduce((acc, curr) => acc + curr, 0).toFixed(2);
        }
        return null;
      });
      newRows = [...newRows, totalsRow];
      label = 'Appended Totals';
      toast = 'Added numeric totals row';
      break;
    }

    case 'markdown_table': {
      const headers = `| ${columns.map((c) => c.name).join(' | ')} |`;
      const separator = `| ${columns.map(() => '---').join(' | ')} |`;
      const mdRows = currentRows
        .map(
          (r: QueryRow) =>
            `| ${r.map((c: QueryRowValue) => (c === null ? 'NULL' : String(c).replace(/\|/g, '\\|'))).join(' | ')} |`
        )
        .join('\n');
      navigator.clipboard.writeText([headers, separator, mdRows].join('\n'));
      return { toast: 'Copied Markdown table to clipboard!' };
    }

    case 'sql_inserts': {
      const tableName = 'query_export';
      const colNames = columns.map((c) => `"${c.name}"`).join(', ');
      const sqlRows = currentRows
        .map((r: QueryRow) => {
          const vals = r
            .map((c: QueryRowValue) => {
              if (c === null) return 'NULL';
              if (typeof c === 'number') return String(c);
              return `'${String(c).replace(/'/g, "''")}'`;
            })
            .join(', ');
          return `INSERT INTO ${tableName} (${colNames}) VALUES (${vals});`;
        })
        .join('\n');
      navigator.clipboard.writeText(sqlRows);
      return { toast: 'Copied SQL INSERTs to clipboard!' };
    }

    case 'ndjson': {
      const ndjson = jsonObjects.map((obj) => JSON.stringify(obj)).join('\n');
      navigator.clipboard.writeText(ndjson);
      return { toast: 'Copied NDJSON rows to clipboard!' };
    }

    case 'html_table': {
      const ths = columns.map((c) => `<th>${c.name}</th>`).join('');
      const trs = currentRows
        .map(
          (r: QueryRow) =>
            `<tr>${r.map((c: QueryRowValue) => `<td>${c === null ? '' : String(c)}</td>`).join('')}</tr>`
        )
        .join('\n');
      const html = `<table>\n<thead><tr>${ths}</tr></thead>\n<tbody>\n${trs}\n</tbody>\n</table>`;
      navigator.clipboard.writeText(html);
      return { toast: 'Copied HTML table to clipboard!' };
    }

    default:
      return { toast: '' };
  }

  return { newRows, label, toast };
}
