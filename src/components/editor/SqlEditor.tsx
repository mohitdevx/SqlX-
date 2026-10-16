import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { PostgreSQL, sql } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorState, Prec } from '@codemirror/state';
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
  onSelectionChange?: (selection: string) => void;
  onExecute?: () => void;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onSelectionChange,
  onExecute,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onExecuteRef = useRef(onExecute);

  onChangeRef.current = onChange;
  onSelectionChangeRef.current = onSelectionChange;
  onExecuteRef.current = onExecute;

  const blockEnterRef = useRef(false);
  const savedCursorRef = useRef<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial document setup only
  useEffect(() => {
    if (!containerRef.current) return;

    const checkIsCtrlEnter = (e: KeyboardEvent) => {
      const isEnter =
        e.key === 'Enter' ||
        e.key === 'Return' ||
        e.code === 'Enter' ||
        e.code === 'NumpadEnter' ||
        e.keyCode === 13 ||
        e.which === 13;
      const isModifier = e.ctrlKey || e.metaKey;
      return isEnter && isModifier;
    };

    const triggerExecutionWithLockedCursor = () => {
      blockEnterRef.current = true;
      if (viewRef.current) {
        savedCursorRef.current = viewRef.current.state.selection.main.head;
      }
      if (onExecuteRef.current) {
        onExecuteRef.current();
      }
      setTimeout(() => {
        blockEnterRef.current = false;
        if (viewRef.current && savedCursorRef.current !== null) {
          const pos = Math.min(savedCursorRef.current, viewRef.current.state.doc.length);
          viewRef.current.dispatch({
            selection: { anchor: pos, head: pos },
            scrollIntoView: false,
          });
        }
      }, 50);
    };

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
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
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
        // Transaction filter: completely drops any doc changes or caret drops while Ctrl+Enter is active
        EditorState.transactionFilter.of((tr) => {
          if (blockEnterRef.current) {
            if (tr.docChanged) return [];
            if (tr.selection && savedCursorRef.current !== null) {
              const pos = Math.min(savedCursorRef.current, tr.startState.doc.length);
              return [tr, { selection: { anchor: pos, head: pos } }];
            }
          }
          return tr;
        }),
        Prec.highest(
          EditorView.domEventHandlers({
            keydown(event, _view) {
              if (checkIsCtrlEnter(event)) {
                event.preventDefault();
                event.stopPropagation();
                triggerExecutionWithLockedCursor();
                return true;
              }
              return false;
            },
          })
        ),
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                triggerExecutionWithLockedCursor();
                return true;
              },
            },
            {
              key: 'Ctrl-Enter',
              run: () => {
                triggerExecutionWithLockedCursor();
                return true;
              },
            },
            {
              key: 'Mod-Return',
              run: () => {
                triggerExecutionWithLockedCursor();
                return true;
              },
            },
            {
              key: 'Ctrl-Return',
              run: () => {
                triggerExecutionWithLockedCursor();
                return true;
              },
            },
            {
              key: 'F5',
              run: () => {
                if (onExecuteRef.current) onExecuteRef.current();
                return true;
              },
            },
          ])
        ),
        keymap.of([
          ...defaultKeymap.filter(
            (binding) =>
              binding.key !== 'Mod-Enter' &&
              binding.key !== 'Ctrl-Enter' &&
              binding.key !== 'Mod-Return'
          ),
          ...historyKeymap,
          ...closeBracketsKeymap,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
          if (update.selectionSet) {
            const sel = update.state.selection.main;
            if (!sel.empty) {
              const text = update.state.sliceDoc(sel.from, sel.to);
              if (onSelectionChangeRef.current) {
                onSelectionChangeRef.current(text);
              }
            } else if (onSelectionChangeRef.current) {
              onSelectionChangeRef.current('');
            }
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Capture-phase DOM interception to prevent any newline insertion or cursor drop
    let ctrlPressed = false;
    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        ctrlPressed = true;
      }
      if (checkIsCtrlEnter(e)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        triggerExecutionWithLockedCursor();
      }
    };

    const handleKeyUpCapture = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        ctrlPressed = false;
      }
    };

    const handleBeforeInputCapture = (e: InputEvent) => {
      if (
        blockEnterRef.current ||
        (ctrlPressed && (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    const handleWindowKeyDownCapture = (e: KeyboardEvent) => {
      if (checkIsCtrlEnter(e)) {
        if (containerRef.current?.contains(document.activeElement)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          triggerExecutionWithLockedCursor();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDownCapture, { capture: true });
    container.addEventListener('keyup', handleKeyUpCapture, { capture: true });
    container.addEventListener('beforeinput', handleBeforeInputCapture, { capture: true });
    window.addEventListener('keydown', handleWindowKeyDownCapture, { capture: true });

    return () => {
      container.removeEventListener('keydown', handleKeyDownCapture, { capture: true });
      container.removeEventListener('keyup', handleKeyUpCapture, { capture: true });
      container.removeEventListener('beforeinput', handleBeforeInputCapture, { capture: true });
      window.removeEventListener('keydown', handleWindowKeyDownCapture, { capture: true });
      view.destroy();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full overflow-hidden" />;
};
