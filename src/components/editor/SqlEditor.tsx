import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';
import type React from 'react';
import { useEffect, useRef } from 'react';

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onExecute?: () => void;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({ value, onChange, onExecute }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onExecuteRef = useRef(onExecute);

  onChangeRef.current = onChange;
  onExecuteRef.current = onExecute;

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial document setup only
  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic syntax highlighting driven by CSS Custom Properties
    const sqlHighlightStyle = HighlightStyle.define([
      { tag: tags.keyword, color: 'var(--syntax-keyword)', fontWeight: 'bold' },
      { tag: [tags.string, tags.special(tags.string)], color: 'var(--syntax-string)' },
      { tag: [tags.number, tags.bool, tags.null], color: 'var(--syntax-number)' },
      {
        tag: [tags.comment, tags.lineComment, tags.blockComment],
        color: 'var(--syntax-comment)',
        fontStyle: 'italic',
      },
      {
        tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
        color: 'var(--syntax-function)',
      },
      { tag: [tags.operator, tags.operatorKeyword], color: 'var(--syntax-operator)' },
      { tag: [tags.typeName, tags.className], color: 'var(--syntax-type)' },
      { tag: [tags.variableName, tags.propertyName], color: 'var(--syntax-variable)' },
      { tag: tags.punctuation, color: 'var(--color-text-secondary)' },
    ]);

    const customTheme = EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'var(--color-editor-bg)',
        color: 'var(--color-text-primary)',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
        fontSize: '13px',
      },
      '.cm-content': {
        caretColor: 'var(--color-editor-cursor)',
        padding: '10px 0',
      },
      '&.cm-focused .cm-cursor': {
        borderLeftColor: 'var(--color-editor-cursor)',
        borderLeftWidth: '2px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'var(--color-editor-selection)',
      },
      '.cm-gutters': {
        backgroundColor: 'var(--color-editor-gutter-bg)',
        color: 'var(--color-editor-gutter-fg)',
        borderRight: '1px solid var(--color-border-subtle)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '11px',
      },
      '.cm-activeLine': {
        backgroundColor: 'var(--color-editor-highlight)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: 'var(--color-editor-highlight)',
        color: 'var(--color-text-primary)',
        fontWeight: 'bold',
      },
      '.cm-line': {
        padding: '0 12px',
        lineHeight: '1.6',
      },
    });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        closeBrackets(),
        autocompletion({
          defaultKeymap: true,
          override: null,
        }),
        sql({ dialect: PostgreSQL }),
        syntaxHighlighting(sqlHighlightStyle),
        customTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...closeBracketsKeymap,
          ...completionKeymap,
          {
            key: 'F5',
            run: () => {
              if (onExecuteRef.current) onExecuteRef.current();
              return true;
            },
          },
          {
            key: 'Ctrl-Enter',
            run: () => {
              if (onExecuteRef.current) onExecuteRef.current();
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full overflow-hidden" />;
};
