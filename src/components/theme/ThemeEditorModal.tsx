import type { SqlXTheme } from '@/types/theme';
import { Braces, Check, Plus, RotateCcw, Upload, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: SqlXTheme;
  onSaveTheme: (theme: SqlXTheme) => boolean;
}

export const ThemeEditorModal: React.FC<ThemeEditorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSaveTheme,
}) => {
  const [modalInput, setModalInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalInput('');
      setModalError(null);
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validateJson = (text: string): SqlXTheme | null => {
    if (!text.trim()) {
      setModalError(null);
      return null;
    }
    try {
      const parsed = JSON.parse(text) as SqlXTheme;
      if (!parsed?.name) {
        setModalError('Missing required "name" field.');
        return null;
      }
      if (!parsed?.colors?.background?.base || !parsed?.colors?.accent?.primary) {
        setModalError('Missing required color tokens ("background.base", "accent.primary", etc).');
        return null;
      }
      setModalError(null);
      return parsed;
    } catch (err) {
      setModalError((err as Error).message);
      return null;
    }
  };

  const handleUseCurrentAsTemplate = () => {
    setModalInput(JSON.stringify(currentTheme, null, 2));
    setModalError(null);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setModalInput(text);
        validateJson(text);
      }
    } catch {
      setModalError('Clipboard permission denied. Please paste manually into the editor.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setModalInput(content);
        validateJson(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const validated = validateJson(modalInput);
    if (!validated) return;
    const ok = onSaveTheme(validated);
    if (ok) {
      onClose();
    } else {
      setModalError('Could not register theme. Ensure valid schema format.');
    }
  };

  const parsedPreview = useMemo(() => {
    if (!modalInput.trim()) return null;
    try {
      const p = JSON.parse(modalInput) as SqlXTheme;
      if (p?.name && p?.colors?.accent?.primary) return p;
    } catch {
      // not yet valid
    }
    return null;
  }, [modalInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-bg-surface/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col space-y-4 p-5 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-tx-primary">Add Custom Theme</h2>
              <p className="text-[11px] text-tx-muted">
                Paste your theme JSON configuration to save and apply.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-tx-muted hover:text-tx-primary rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleUseCurrentAsTemplate}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Use Active Template</span>
            </button>

            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Braces className="w-3 h-3" />
              <span>Paste Clipboard</span>
            </button>
          </div>

          <div>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-tx-secondary hover:text-tx-primary transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload .json</span>
            </button>
          </div>
        </div>

        {/* JSON Code Input Area */}
        <textarea
          rows={9}
          value={modalInput}
          onChange={(e) => {
            setModalInput(e.target.value);
            validateJson(e.target.value);
          }}
          placeholder={`{\n  "name": "Custom Theme",\n  "type": "dark",\n  "colors": {\n    "background": { "base": "#090a0c", "surface": "#0f1013", ... }\n  }\n}`}
          className="w-full bg-black/50 border border-white/10 focus:border-accent-primary/60 rounded-xl p-3.5 font-mono text-xs text-tx-primary placeholder:text-tx-muted/40 focus:outline-none transition-all resize-none custom-scrollbar"
          autoFocus
        />

        {/* Validation Banner */}
        {parsedPreview ? (
          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5" />
              <span>
                Ready to save: &quot;{parsedPreview.name}&quot; ({parsedPreview.type || 'dark'})
              </span>
            </div>
            <div
              className="w-3 h-3 rounded-full border border-white/20"
              style={{ backgroundColor: parsedPreview.colors.accent.primary }}
              title="Accent Preview"
            />
          </div>
        ) : modalError ? (
          <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            <span>{modalError}</span>
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!modalInput.trim() || !!modalError}
            className="px-4 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-40 text-accent-text text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Save & Apply Theme</span>
          </button>
        </div>
      </div>
    </div>
  );
};
