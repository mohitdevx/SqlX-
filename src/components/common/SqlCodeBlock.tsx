import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import type React from 'react';
import { useEffect, useRef } from 'react';

interface SqlCodeBlockProps {
  code: string;
  className?: string;
  maxHeight?: string;
}

const sqlHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--syntax-keyword, #c678dd)', fontWeight: '600' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--syntax-string, #98c379)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--syntax-number, #d19a66)' },
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment],
    color: 'var(--syntax-comment, #5c6370)',
    fontStyle: 'italic',
  },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
    color: 'var(--syntax-function, #61afef)',
  },
  { tag: [tags.operator, tags.operatorKeyword], color: 'var(--syntax-operator, #56b6c2)' },
  { tag: [tags.typeName, tags.className], color: 'var(--syntax-type, #e5c07b)' },
  { tag: [tags.variableName, tags.propertyName], color: 'var(--syntax-variable, #e06c75)' },
  { tag: tags.punctuation, color: 'var(--color-text-secondary, #abb2bf)' },
]);

const readOnlyTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary, #e5e7eb)',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '12px',
    cursor: 'text',
  },
  '.cm-content': {
    padding: '0',
    caretColor: 'transparent',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-line': {
    padding: '0',
    lineHeight: '1.5',
  },
  '.cm-scroller': {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    overflow: 'auto',
  },
});

export const SqlCodeBlock: React.FC<SqlCodeBlockProps> = ({
  code,
  className = '',
  maxHeight = '200px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const state = EditorState.create({
      doc: code,
      extensions: [
        sql({ dialect: PostgreSQL }),
        syntaxHighlighting(sqlHighlightStyle),
        readOnlyTheme,
        EditorView.editable.of(false),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [code]);

  return (
    <div
      ref={containerRef}
      style={{ maxHeight }}
      className={`overflow-y-auto custom-scrollbar select-text ${className}`}
    />
  );
};
