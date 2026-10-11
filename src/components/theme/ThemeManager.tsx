import { useThemeStore } from '@/stores/themeStore';
import type { SqlXTheme } from '@/types/theme';
import {
  Braces,
  Check,
  Moon,
  Palette,
  Plus,
  RotateCcw,
  Search,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'custom', label: 'Custom' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

const BUILTIN_THEMES: SqlXTheme[] = [
  {
    name: 'Obsidian Solid (Default)',
    type: 'dark',
    colors: {
      background: {
        base: '#090a0c',
        surface: '#0f1013',
        overlay: '#15171c',
        elevated: '#1c1f26',
      },
      border: { subtle: '#1e2229', default: '#282c35', strong: '#3b404d' },
      text: { primary: '#f3f4f6', secondary: '#9ca3af', muted: '#6b7280', inverse: '#090a0c' },
      accent: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        text: '#ffffff',
      },
      status: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
      editor: {
        background: '#0b0c0f',
        cursor: '#60a5fa',
        selection: '#1e3a5f',
        lineHighlight: '#12141a',
        gutterBackground: '#0b0c0f',
        gutterForeground: '#4b5563',
      },
      grid: {
        headerBackground: '#121418',
        headerText: '#e5e7eb',
        rowEven: '#0b0c0f',
        rowOdd: '#0f1014',
        rowHover: '#181b22',
        rowSelected: '#1e293b',
        cellBorder: '#1a1d24',
        nullValue: '#6b7280',
      },
      syntax: {
        keyword: '#60a5fa',
        string: '#34d399',
        number: '#f59e0b',
        comment: '#6b7280',
        function: '#a78bfa',
        operator: '#9ca3af',
        type: '#38bdf8',
        variable: '#f3f4f6',
      },
    },
  },
  {
    name: 'Midnight Zinc',
    type: 'dark',
    colors: {
      background: {
        base: '#09090b',
        surface: '#121215',
        overlay: '#18181b',
        elevated: '#27272a',
      },
      border: { subtle: '#27272a', default: '#3f3f46', strong: '#52525b' },
      text: { primary: '#fafafa', secondary: '#a1a1aa', muted: '#71717a', inverse: '#09090b' },
      accent: {
        primary: '#6366f1',
        primaryHover: '#4f46e5',
        primaryActive: '#4338ca',
        text: '#ffffff',
      },
      status: { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#06b6d4' },
      editor: {
        background: '#0d0d11',
        cursor: '#a5b4fc',
        selection: '#312e81',
        lineHighlight: '#14141a',
        gutterBackground: '#0d0d11',
        gutterForeground: '#52525b',
      },
      grid: {
        headerBackground: '#14141a',
        headerText: '#f4f4f5',
        rowEven: '#0d0d11',
        rowOdd: '#121216',
        rowHover: '#1f1f26',
        rowSelected: '#2e2d42',
        cellBorder: '#27272a',
        nullValue: '#71717a',
      },
      syntax: {
        keyword: '#818cf8',
        string: '#34d399',
        number: '#fbbf24',
        comment: '#71717a',
        function: '#c084fc',
        operator: '#a1a1aa',
        type: '#38bdf8',
        variable: '#fafafa',
      },
    },
  },
  {
    name: 'Tokyo Night Solid',
    type: 'dark',
    colors: {
      background: {
        base: '#13141f',
        surface: '#1a1b26',
        overlay: '#24283b',
        elevated: '#2f3549',
      },
      border: { subtle: '#23283b', default: '#2f3549', strong: '#414868' },
      text: { primary: '#c0caf5', secondary: '#9aa5ce', muted: '#565f89', inverse: '#1a1b26' },
      accent: {
        primary: '#7aa2f7',
        primaryHover: '#628eec',
        primaryActive: '#4a7ad6',
        text: '#1a1b26',
      },
      status: { success: '#9ece6a', warning: '#e0af68', error: '#f7768e', info: '#7dcfff' },
      editor: {
        background: '#161622',
        cursor: '#c0caf5',
        selection: '#283457',
        lineHighlight: '#1c1d2e',
        gutterBackground: '#161622',
        gutterForeground: '#565f89',
      },
      grid: {
        headerBackground: '#1c1d2e',
        headerText: '#c0caf5',
        rowEven: '#161622',
        rowOdd: '#1a1b2a',
        rowHover: '#24283b',
        rowSelected: '#2e385e',
        cellBorder: '#23283b',
        nullValue: '#565f89',
      },
      syntax: {
        keyword: '#bb9af7',
        string: '#9ece6a',
        number: '#ff9e64',
        comment: '#565f89',
        function: '#7aa2f7',
        operator: '#89ddff',
        type: '#2ac3de',
        variable: '#c0caf5',
      },
    },
  },
  {
    name: 'Dracula Dark',
    type: 'dark',
    colors: {
      background: {
        base: '#21222c',
        surface: '#282a36',
        overlay: '#343746',
        elevated: '#44475a',
      },
      border: { subtle: '#343746', default: '#44475a', strong: '#6272a4' },
      text: { primary: '#f8f8f2', secondary: '#bd93f9', muted: '#6272a4', inverse: '#282a36' },
      accent: {
        primary: '#bd93f9',
        primaryHover: '#ff79c6',
        primaryActive: '#8be9fd',
        text: '#282a36',
      },
      status: { success: '#50fa7b', warning: '#f1fa8c', error: '#ff5555', info: '#8be9fd' },
      editor: {
        background: '#242632',
        cursor: '#ff79c6',
        selection: '#44475a',
        lineHighlight: '#2b2d3c',
        gutterBackground: '#242632',
        gutterForeground: '#6272a4',
      },
      grid: {
        headerBackground: '#282a36',
        headerText: '#f8f8f2',
        rowEven: '#242632',
        rowOdd: '#282a36',
        rowHover: '#343746',
        rowSelected: '#44475a',
        cellBorder: '#343746',
        nullValue: '#6272a4',
      },
      syntax: {
        keyword: '#ff79c6',
        string: '#f1fa8c',
        number: '#bd93f9',
        comment: '#6272a4',
        function: '#50fa7b',
        operator: '#ff79c6',
        type: '#8be9fd',
        variable: '#f8f8f2',
      },
    },
  },
  {
    name: 'Catppuccin Mocha',
    type: 'dark',
    colors: {
      background: {
        base: '#181825',
        surface: '#1e1e2e',
        overlay: '#313244',
        elevated: '#45475a',
      },
      border: { subtle: '#313244', default: '#45475a', strong: '#585b70' },
      text: { primary: '#cdd6f4', secondary: '#a6adc8', muted: '#6c7086', inverse: '#11111b' },
      accent: {
        primary: '#cba6f7',
        primaryHover: '#b4befe',
        primaryActive: '#89b4fa',
        text: '#11111b',
      },
      status: { success: '#a6e3a1', warning: '#f9e2af', error: '#f38ba8', info: '#89dceb' },
      editor: {
        background: '#1a1a27',
        cursor: '#f5e0dc',
        selection: '#45475a',
        lineHighlight: '#222234',
        gutterBackground: '#1a1a27',
        gutterForeground: '#6c7086',
      },
      grid: {
        headerBackground: '#1e1e2e',
        headerText: '#cdd6f4',
        rowEven: '#181825',
        rowOdd: '#1e1e2e',
        rowHover: '#313244',
        rowSelected: '#45475a',
        cellBorder: '#313244',
        nullValue: '#6c7086',
      },
      syntax: {
        keyword: '#cba6f7',
        string: '#a6e3a1',
        number: '#fab387',
        comment: '#6c7086',
        function: '#89b4fa',
        operator: '#94e2d5',
        type: '#f9e2af',
        variable: '#cdd6f4',
      },
    },
  },
  {
    name: 'Nord Frost',
    type: 'dark',
    colors: {
      background: {
        base: '#242933',
        surface: '#2e3440',
        overlay: '#3b4252',
        elevated: '#434c5e',
      },
      border: { subtle: '#3b4252', default: '#434c5e', strong: '#4c566a' },
      text: { primary: '#eceff4', secondary: '#d8dee9', muted: '#4c566a', inverse: '#2e3440' },
      accent: {
        primary: '#88c0d0',
        primaryHover: '#81a1c1',
        primaryActive: '#5e81ac',
        text: '#2e3440',
      },
      status: { success: '#a3be8c', warning: '#ebcb8b', error: '#bf616a', info: '#88c0d0' },
      editor: {
        background: '#272c37',
        cursor: '#88c0d0',
        selection: '#434c5e',
        lineHighlight: '#2f3643',
        gutterBackground: '#272c37',
        gutterForeground: '#4c566a',
      },
      grid: {
        headerBackground: '#2e3440',
        headerText: '#eceff4',
        rowEven: '#272c37',
        rowOdd: '#2e3440',
        rowHover: '#3b4252',
        rowSelected: '#434c5e',
        cellBorder: '#3b4252',
        nullValue: '#616e88',
      },
      syntax: {
        keyword: '#81a1c1',
        string: '#a3be8c',
        number: '#b48ead',
        comment: '#616e88',
        function: '#88c0d0',
        operator: '#81a1c1',
        type: '#8fbcbb',
        variable: '#eceff4',
      },
    },
  },
  {
    name: 'Monokai Charcoal',
    type: 'dark',
    colors: {
      background: {
        base: '#19181a',
        surface: '#221f22',
        overlay: '#2d2a2e',
        elevated: '#3a373b',
      },
      border: { subtle: '#2d2a2e', default: '#3a373b', strong: '#5b585c' },
      text: { primary: '#fcfcfa', secondary: '#c1c0c0', muted: '#727072', inverse: '#19181a' },
      accent: {
        primary: '#ffd866',
        primaryHover: '#f5cc56',
        primaryActive: '#e6be47',
        text: '#19181a',
      },
      status: { success: '#a9dc76', warning: '#ffd866', error: '#ff6188', info: '#78dce8' },
      editor: {
        background: '#1e1c1f',
        cursor: '#ffd866',
        selection: '#403e41',
        lineHighlight: '#262427',
        gutterBackground: '#1e1c1f',
        gutterForeground: '#727072',
      },
      grid: {
        headerBackground: '#262427',
        headerText: '#fcfcfa',
        rowEven: '#1e1c1f',
        rowOdd: '#221f22',
        rowHover: '#2d2a2e',
        rowSelected: '#403e41',
        cellBorder: '#2d2a2e',
        nullValue: '#727072',
      },
      syntax: {
        keyword: '#ff6188',
        string: '#a9dc76',
        number: '#ab9df2',
        comment: '#727072',
        function: '#78dce8',
        operator: '#ff6188',
        type: '#ffd866',
        variable: '#fcfcfa',
      },
    },
  },
  {
    name: 'OLED Pure Black',
    type: 'dark',
    colors: {
      background: {
        base: '#000000',
        surface: '#0a0a0a',
        overlay: '#141414',
        elevated: '#1f1f1f',
      },
      border: { subtle: '#1f1f1f', default: '#2e2e2e', strong: '#404040' },
      text: { primary: '#ffffff', secondary: '#a3a3a3', muted: '#737373', inverse: '#000000' },
      accent: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        text: '#ffffff',
      },
      status: { success: '#22c55e', warning: '#eab308', error: '#ef4444', info: '#06b6d4' },
      editor: {
        background: '#000000',
        cursor: '#60a5fa',
        selection: '#1e3a5f',
        lineHighlight: '#0d0d0d',
        gutterBackground: '#000000',
        gutterForeground: '#525252',
      },
      grid: {
        headerBackground: '#0a0a0a',
        headerText: '#ffffff',
        rowEven: '#000000',
        rowOdd: '#080808',
        rowHover: '#141414',
        rowSelected: '#1e293b',
        cellBorder: '#1f1f1f',
        nullValue: '#737373',
      },
      syntax: {
        keyword: '#60a5fa',
        string: '#4ade80',
        number: '#facc15',
        comment: '#737373',
        function: '#a855f7',
        operator: '#94a3b8',
        type: '#38bdf8',
        variable: '#ffffff',
      },
    },
  },
  {
    name: 'Cyberpunk Neon',
    type: 'dark',
    colors: {
      background: {
        base: '#0f0e17',
        surface: '#171523',
        overlay: '#211e33',
        elevated: '#2d2945',
      },
      border: { subtle: '#25223a', default: '#373356', strong: '#534e7c' },
      text: { primary: '#fffffe', secondary: '#a7a9be', muted: '#686b82', inverse: '#0f0e17' },
      accent: {
        primary: '#ff007f',
        primaryHover: '#e00070',
        primaryActive: '#b8005c',
        text: '#ffffff',
      },
      status: { success: '#00f0ff', warning: '#ffd600', error: '#ff0055', info: '#00e5ff' },
      editor: {
        background: '#12111d',
        cursor: '#00f0ff',
        selection: '#3a2048',
        lineHighlight: '#1a1829',
        gutterBackground: '#12111d',
        gutterForeground: '#686b82',
      },
      grid: {
        headerBackground: '#171523',
        headerText: '#fffffe',
        rowEven: '#12111d',
        rowOdd: '#171523',
        rowHover: '#25223a',
        rowSelected: '#373356',
        cellBorder: '#25223a',
        nullValue: '#686b82',
      },
      syntax: {
        keyword: '#ff007f',
        string: '#00f0ff',
        number: '#ffd600',
        comment: '#686b82',
        function: '#ff7597',
        operator: '#00e5ff',
        type: '#ffd600',
        variable: '#fffffe',
      },
    },
  },
  {
    name: 'GitHub Dark Dimmed',
    type: 'dark',
    colors: {
      background: {
        base: '#1c2128',
        surface: '#22272e',
        overlay: '#2d333b',
        elevated: '#373e47',
      },
      border: { subtle: '#373e47', default: '#444c56', strong: '#545d68' },
      text: { primary: '#adbac7', secondary: '#768390', muted: '#545d68', inverse: '#1c2128' },
      accent: {
        primary: '#539bf5',
        primaryHover: '#4184e4',
        primaryActive: '#316dca',
        text: '#ffffff',
      },
      status: { success: '#57ab5a', warning: '#c69026', error: '#e5534b', info: '#539bf5' },
      editor: {
        background: '#1e232b',
        cursor: '#539bf5',
        selection: '#2b3b55',
        lineHighlight: '#242932',
        gutterBackground: '#1e232b',
        gutterForeground: '#545d68',
      },
      grid: {
        headerBackground: '#22272e',
        headerText: '#adbac7',
        rowEven: '#1e232b',
        rowOdd: '#22272e',
        rowHover: '#2d333b',
        rowSelected: '#2b3b55',
        cellBorder: '#373e47',
        nullValue: '#545d68',
      },
      syntax: {
        keyword: '#f47067',
        string: '#96d0ff',
        number: '#6cb6ff',
        comment: '#768390',
        function: '#dcbdfb',
        operator: '#f47067',
        type: '#f69d50',
        variable: '#adbac7',
      },
    },
  },
  {
    name: 'Alabaster Light',
    type: 'light',
    colors: {
      background: {
        base: '#fbfbfb',
        surface: '#ffffff',
        overlay: '#f4f4f5',
        elevated: '#e4e4e7',
      },
      border: { subtle: '#e4e4e7', default: '#d4d4d8', strong: '#a1a1aa' },
      text: { primary: '#09090b', secondary: '#52525b', muted: '#a1a1aa', inverse: '#ffffff' },
      accent: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        primaryActive: '#1e40af',
        text: '#ffffff',
      },
      status: { success: '#059669', warning: '#d97706', error: '#dc2626', info: '#0284c7' },
      editor: {
        background: '#ffffff',
        cursor: '#09090b',
        selection: '#bfdbfe',
        lineHighlight: '#f8fafc',
        gutterBackground: '#f8fafc',
        gutterForeground: '#94a3b8',
      },
      grid: {
        headerBackground: '#f1f5f9',
        headerText: '#0f172a',
        rowEven: '#ffffff',
        rowOdd: '#f8fafc',
        rowHover: '#e2e8f0',
        rowSelected: '#dbeafe',
        cellBorder: '#e2e8f0',
        nullValue: '#94a3b8',
      },
      syntax: {
        keyword: '#2563eb',
        string: '#059669',
        number: '#d97706',
        comment: '#94a3b8',
        function: '#7c3aed',
        operator: '#4b5563',
        type: '#0284c7',
        variable: '#0f172a',
      },
    },
  },
  {
    name: 'GitHub Light',
    type: 'light',
    colors: {
      background: {
        base: '#ffffff',
        surface: '#f6f8fa',
        overlay: '#eaeef2',
        elevated: '#d0d7de',
      },
      border: { subtle: '#d0d7de', default: '#afb8c1', strong: '#8c959f' },
      text: { primary: '#1f2328', secondary: '#656d76', muted: '#8c959f', inverse: '#ffffff' },
      accent: {
        primary: '#0969da',
        primaryHover: '#0854ad',
        primaryActive: '#053d80',
        text: '#ffffff',
      },
      status: { success: '#1a7f37', warning: '#9a6700', error: '#cf222e', info: '#0969da' },
      editor: {
        background: '#ffffff',
        cursor: '#1f2328',
        selection: '#b6e3ff',
        lineHighlight: '#f6f8fa',
        gutterBackground: '#f6f8fa',
        gutterForeground: '#8c959f',
      },
      grid: {
        headerBackground: '#f6f8fa',
        headerText: '#1f2328',
        rowEven: '#ffffff',
        rowOdd: '#f6f8fa',
        rowHover: '#eaeef2',
        rowSelected: '#ddf4ff',
        cellBorder: '#d0d7de',
        nullValue: '#8c959f',
      },
      syntax: {
        keyword: '#cf222e',
        string: '#0a3069',
        number: '#0550ae',
        comment: '#6e7781',
        function: '#8250df',
        operator: '#cf222e',
        type: '#953800',
        variable: '#1f2328',
      },
    },
  },
  {
    name: 'Solarized Light',
    type: 'light',
    colors: {
      background: {
        base: '#fdf6e3',
        surface: '#eee8d5',
        overlay: '#e0dac6',
        elevated: '#93a1a1',
      },
      border: { subtle: '#e0dac6', default: '#93a1a1', strong: '#657b83' },
      text: { primary: '#657b83', secondary: '#586e75', muted: '#93a1a1', inverse: '#fdf6e3' },
      accent: {
        primary: '#268bd2',
        primaryHover: '#2075b0',
        primaryActive: '#1a6090',
        text: '#fdf6e3',
      },
      status: { success: '#859900', warning: '#b58900', error: '#dc322f', info: '#2aa198' },
      editor: {
        background: '#fdf6e3',
        cursor: '#657b83',
        selection: '#eee8d5',
        lineHighlight: '#f7f0dc',
        gutterBackground: '#eee8d5',
        gutterForeground: '#93a1a1',
      },
      grid: {
        headerBackground: '#eee8d5',
        headerText: '#586e75',
        rowEven: '#fdf6e3',
        rowOdd: '#eee8d5',
        rowHover: '#e4decc',
        rowSelected: '#d9e6eb',
        cellBorder: '#e0dac6',
        nullValue: '#93a1a1',
      },
      syntax: {
        keyword: '#859900',
        string: '#2aa198',
        number: '#d33682',
        comment: '#93a1a1',
        function: '#268bd2',
        operator: '#859900',
        type: '#b58900',
        variable: '#657b83',
      },
    },
  },
];

export const ThemeManager: React.FC = () => {
  const { currentTheme, customThemes, setTheme, addCustomTheme, removeCustomTheme } =
    useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [copiedActive, setCopiedActive] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine built-in and user-saved custom themes
  const allThemesList = useMemo(() => {
    const list: { theme: SqlXTheme; isCustom: boolean }[] = BUILTIN_THEMES.map((t) => ({
      theme: t,
      isCustom: false,
    }));
    if (customThemes && customThemes.length > 0) {
      for (const t of customThemes) {
        list.push({ theme: t, isCustom: true });
      }
    }
    return list;
  }, [customThemes]);

  // Filter themes based on the 4 exact options: 'all' | 'light' | 'dark' | 'custom'
  const filteredThemes = useMemo(() => {
    return allThemesList.filter(({ theme, isCustom }) => {
      const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'custom') return isCustom;
      if (selectedCategory === 'light') return theme.type === 'light';
      if (selectedCategory === 'dark') return theme.type === 'dark';
      return true;
    });
  }, [allThemesList, searchTerm, selectedCategory]);

  // Export active theme JSON to clipboard
  const handleCopyCurrentTheme = () => {
    navigator.clipboard.writeText(JSON.stringify(currentTheme, null, 2));
    setCopiedActive(true);
    setTimeout(() => setCopiedActive(false), 2000);
  };

  // Modal actions
  const handleOpenModal = () => {
    setModalInput('');
    setModalError(null);
    setIsModalOpen(true);
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

  const validateJson = (text: string) => {
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

  const handleSaveModal = () => {
    const validated = validateJson(modalInput);
    if (!validated) return;
    const ok = addCustomTheme(validated);
    if (ok) {
      setIsModalOpen(false);
      setModalInput('');
      setModalError(null);
    } else {
      setModalError('Could not register theme. Ensure valid schema format.');
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Live parsed preview within modal
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-bg-base text-tx-primary font-sans select-none custom-scrollbar p-6 md:p-10">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Palette className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-medium tracking-tight text-tx-primary">Appearance</h1>
            </div>
            <p className="text-xs text-tx-muted mt-1">
              Select or create visual themes for SqlX &bull; {allThemesList.length} themes available
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* {} JSON Icon Export Button */}
            <button
              onClick={handleCopyCurrentTheme}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-tx-secondary hover:text-tx-primary transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Export active theme JSON"
            >
              {copiedActive ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Braces className="w-3.5 h-3.5 text-tx-muted" />
              )}
              <span>{copiedActive ? 'Copied' : 'JSON'}</span>
            </button>

            {/* + Add Theme Button */}
            <button
              onClick={handleOpenModal}
              className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover active:scale-[0.98] text-accent-text text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Theme</span>
            </button>
          </div>
        </div>

        {/* Filter Pills (Strictly 4: All, Light, Dark, Custom) & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Strict 4 Category Filter Pills */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-white/[0.04] self-start overflow-x-auto max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white/[0.08] text-tx-primary shadow-xs'
                    : 'text-tx-muted hover:text-tx-secondary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-tx-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search themes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] focus:bg-white/[0.07] text-xs text-tx-primary placeholder-tx-muted focus:outline-none transition-colors font-sans"
            />
          </div>
        </div>

        {/* Empty State for Custom Tab */}
        {filteredThemes.length === 0 && selectedCategory === 'custom' && (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto text-tx-muted">
              <Palette className="w-5 h-5 opacity-60" />
            </div>
            <div>
              <p className="text-xs font-medium text-tx-secondary">No custom themes saved yet</p>
              <p className="text-[11px] text-tx-muted mt-0.5">
                Click &ldquo;Add Theme&rdquo; to paste your own theme JSON palette.
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-tx-primary transition-colors cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Theme</span>
            </button>
          </div>
        )}

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredThemes.map(({ theme, isCustom }) => {
            const isSelected = currentTheme.name === theme.name;
            const ModeIcon = theme.type === 'light' ? Sun : Moon;

            return (
              <div
                key={theme.name}
                onClick={() => setTheme(theme)}
                className={`group relative p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white/[0.08] ring-1.5 ring-accent-primary shadow-lg shadow-black/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.06] hover:shadow-md'
                }`}
              >
                {/* Modern Visual Palette & Preview Tile */}
                <div
                  className="w-full h-32 rounded-xl p-3 flex flex-col justify-between border border-white/5 relative overflow-hidden select-none transition-transform duration-200 group-hover:scale-[1.01]"
                  style={{ backgroundColor: theme.colors.background.base }}
                >
                  {/* Floating Mini Editor Box */}
                  <div
                    className="rounded-lg p-2.5 border shadow-xs space-y-1.5"
                    style={{
                      backgroundColor: theme.colors.background.surface,
                      borderColor: theme.colors.border.subtle,
                    }}
                  >
                    {/* Mini Tab Strip */}
                    <div
                      className="flex items-center justify-between pb-1 border-b"
                      style={{ borderColor: theme.colors.border.subtle }}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.colors.accent.primary }}
                        />
                        <span
                          className="text-[9px] font-mono font-medium"
                          style={{ color: theme.colors.text.primary }}
                        >
                          query.sql
                        </span>
                      </div>
                      <span
                        className="text-[8px] font-mono px-1 rounded uppercase"
                        style={{
                          backgroundColor: theme.colors.background.elevated,
                          color: theme.colors.text.muted,
                        }}
                      >
                        SQL
                      </span>
                    </div>

                    {/* Realistic Syntax Preview */}
                    <div className="font-mono text-[9.5px] leading-relaxed">
                      <div className="truncate">
                        <span
                          style={{
                            color: theme.colors.syntax?.keyword || theme.colors.accent.primary,
                          }}
                          className="font-semibold"
                        >
                          SELECT
                        </span>{' '}
                        <span style={{ color: theme.colors.text.primary }}>*</span>{' '}
                        <span
                          style={{
                            color: theme.colors.syntax?.keyword || theme.colors.accent.primary,
                          }}
                          className="font-semibold"
                        >
                          FROM
                        </span>{' '}
                        <span
                          style={{
                            color: theme.colors.syntax?.string || theme.colors.status.success,
                          }}
                        >
                          users
                        </span>
                        <span style={{ color: theme.colors.text.muted }}>;</span>
                      </div>
                      <div className="truncate opacity-90">
                        <span
                          style={{
                            color: theme.colors.syntax?.keyword || theme.colors.accent.primary,
                          }}
                          className="font-semibold"
                        >
                          WHERE
                        </span>{' '}
                        <span style={{ color: theme.colors.text.primary }}>status</span>{' '}
                        <span
                          style={{
                            color: theme.colors.syntax?.operator || theme.colors.text.muted,
                          }}
                        >
                          =
                        </span>{' '}
                        <span
                          style={{
                            color: theme.colors.syntax?.number || theme.colors.status.warning,
                          }}
                        >
                          true
                        </span>
                        <span style={{ color: theme.colors.text.muted }}>;</span>
                      </div>
                    </div>
                  </div>

                  {/* Palette Color Swatch Discs */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
                        style={{ backgroundColor: theme.colors.background.base }}
                        title="Base Background"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
                        style={{ backgroundColor: theme.colors.background.surface }}
                        title="Surface Background"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
                        style={{ backgroundColor: theme.colors.accent.primary }}
                        title="Accent Color"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs"
                        style={{ backgroundColor: theme.colors.status.success }}
                        title="Status Success"
                      />
                    </div>

                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border capitalize"
                      style={{
                        backgroundColor: theme.colors.background.surface,
                        borderColor: theme.colors.border.subtle,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {theme.type}
                    </span>
                  </div>
                </div>

                {/* Card Bottom Meta & Actions */}
                <div className="flex items-center justify-between gap-2 px-0.5">
                  <div className="min-w-0 flex-1 flex items-center space-x-1.5">
                    <ModeIcon className="w-3 h-3 text-tx-muted shrink-0" />
                    <h3 className="text-xs font-semibold text-tx-primary truncate">{theme.name}</h3>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-primary/15 text-accent-primary border border-accent-primary/30 flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-tx-muted opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Apply &rarr;
                      </span>
                    )}

                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove custom theme "${theme.name}"?`)) {
                            removeCustomTheme(theme.name);
                          }
                        }}
                        className="p-1 text-tx-muted hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete custom theme"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Popup Modal for Add Theme */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
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
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-tx-secondary hover:text-tx-primary hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={!modalInput.trim() || !!modalError}
                className="px-4 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-40 text-accent-text text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save & Apply Theme</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
