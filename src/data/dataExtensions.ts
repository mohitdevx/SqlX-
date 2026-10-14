import { BarChart3, FileSpreadsheet, Shield, Wand2 } from 'lucide-react';
import type React from 'react';

export interface ExtensionOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export interface DataExtension {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  options: ExtensionOption[];
}

export const DATA_EXTENSIONS: DataExtension[] = [
  {
    id: 'transformer',
    name: 'Data Transformer',
    description: 'Transform casing, whitespace, and ordering of active rows',
    icon: Wand2,
    options: [
      {
        id: 'uppercase',
        name: 'Uppercase Text Fields',
        description: 'Convert all text columns to uppercase',
        badge: 'Transform',
      },
      {
        id: 'lowercase',
        name: 'Lowercase Text Fields',
        description: 'Convert all text columns to lowercase',
        badge: 'Transform',
      },
      {
        id: 'trim',
        name: 'Trim Whitespace',
        description: 'Strip leading and trailing spaces from text cells',
        badge: 'Clean',
      },
      {
        id: 'reverse',
        name: 'Reverse Row Order',
        description: 'Invert the row order of the active result set',
        badge: 'Order',
      },
      {
        id: 'sort_asc',
        name: 'Sort Ascending (Col 1)',
        description: 'Sort records alphabetically/numerically by column 1',
        badge: 'Sort',
      },
      {
        id: 'sort_desc',
        name: 'Sort Descending (Col 1)',
        description: 'Sort records descending by column 1',
        badge: 'Sort',
      },
    ],
  },
  {
    id: 'anonymizer',
    name: 'PII Anonymizer',
    description: 'Mask emails, phone numbers, and sensitive credential fields',
    icon: Shield,
    options: [
      {
        id: 'mask_emails',
        name: 'Mask Email Addresses',
        description: 'Obfuscate emails (e.g. j***@domain.com)',
        badge: 'Privacy',
      },
      {
        id: 'mask_phones',
        name: 'Mask Phone Numbers',
        description: 'Conceal numbers (e.g. ***-***-1234)',
        badge: 'Privacy',
      },
      {
        id: 'redact_secrets',
        name: 'Redact Passwords & Secrets',
        description: 'Replace password/token/key columns with [REDACTED]',
        badge: 'Security',
      },
      {
        id: 'anonymize_ids',
        name: 'Hash Identifiers',
        description: 'Convert numeric IDs to pseudonymous hash hexes',
        badge: 'Mask',
      },
    ],
  },
  {
    id: 'exporter',
    name: 'Universal Exporter',
    description: 'Format and copy rows as Markdown, SQL INSERT, or NDJSON',
    icon: FileSpreadsheet,
    options: [
      {
        id: 'markdown_table',
        name: 'Copy as Markdown Table',
        description: 'Format current rows into GitHub Flavored Markdown table',
        badge: 'Copy',
      },
      {
        id: 'sql_inserts',
        name: 'Copy as SQL INSERTs',
        description: 'Generate INSERT INTO statements for current rows',
        badge: 'Copy',
      },
      {
        id: 'ndjson',
        name: 'Copy as NDJSON',
        description: 'Format current rows as newline-delimited JSON',
        badge: 'Copy',
      },
      {
        id: 'html_table',
        name: 'Copy as HTML Table',
        description: 'Generate clean <table> markup for the result set',
        badge: 'Copy',
      },
    ],
  },
  {
    id: 'aggregator',
    name: 'Data Analytics & Stats',
    description: 'Compute summaries, aggregates, and deduplicate rows',
    icon: BarChart3,
    options: [
      {
        id: 'deduplicate',
        name: 'Deduplicate Rows',
        description: 'Filter out identical repeating record rows',
        badge: 'Filter',
      },
      {
        id: 'append_totals',
        name: 'Compute Column Totals',
        description: 'Append a summary row totaling all numeric columns',
        badge: 'Aggregate',
      },
    ],
  },
];
