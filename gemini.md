# SqlX - Architectural Standards & Engineering Guidelines

## 1. Core Mission & Design Tenets
**SqlX** is a high-performance, low-memory, modern SQL client engineered specifically for Linux and Windows.

### Invariant Rules & AI Navigation Mandate
1. **Mandatory appMap.md Lookup**:
   - Before exploring files, guessing component locations, or modifying features, **AI agents and developers MUST consult [`appMap.md`](file:///home/mohit/Desktop/Desktop/SqlX-/appMap.md)**.
   - `appMap.md` is the centralized architectural index and quick lookup matrix mapping every user option, UI button, and backend handler to its exact file.
   - Whenever a feature, file, or option is added or relocated, [`appMap.md`](file:///home/mohit/Desktop/Desktop/SqlX-/appMap.md) must be updated immediately to prevent documentation drift.
2. **Zero Aesthetic Bloat**: No cheap AI-generated neon gradients, muddy glowing box-shadows, or slow transition lag. All UI tokens must use **solid, high-contrast, calibrated colors** with 1px subtle borders (`border-1`).
3. **Underline Tabs Convention**:
   - All tab bars (Results mode tabs, Theme category tabs) use [`UnderlineTab.tsx`](file:///home/mohit/Desktop/Desktop/SqlX-/src/components/ui/atoms/UnderlineTab.tsx) with **no background container**. Active tabs are highlighted with a bottom border and primary accent text: `border-b-2 border-accent-primary text-accent-primary`.
4. **Strict Icons & UI Mandates**:
   - **Extensions Icon**: White `Blocks` icon (`text-white`) everywhere in the application.
   - **JSON Icon**: `Braces` (`{}`).
   - **Appearance / Theme Icon**: No border around the `Palette` icon next to "Appearance".
   - **Results Export**: A single `Export` dropdown button with JSON, CSV, and Copy JSON actions.
5. **Linux / Wayland WebKitGTK Stability**:
   - [`src-tauri/src/main.rs`](file:///home/mohit/Desktop/Desktop/SqlX-/src-tauri/src/main.rs) and [`src-tauri/src/lib.rs`](file:///home/mohit/Desktop/Desktop/SqlX-/src-tauri/src/lib.rs) **MUST ALWAYS** set `WEBKIT_DISABLE_DMABUF_RENDERER=1` on Linux to prevent WebKitGTK 2.42+ mouse event and rendering freezes.
6. **Extreme Performance Budget**:
   - Idle RAM: **< 50 MB**.
   - Cold Startup: **< 350 ms**.
   - Large Dataset: 100k+ rows rendered smoothly at **60/120 FPS** via virtualized row pooling (`@tanstack/react-virtual`).
   - Query Execution: Thread-isolated async Tokio tasks that never block or freeze the UI thread.
7. **Pluggable Dynamic JSON Themes**: All styling maps to CSS Custom Properties (`var(--color-...)`). Changing or loading an external `theme.json` must update the interface instantly without restarting or re-rendering the component tree.

---

## 2. Immutable Project Folder Structure

The project structure is organized into an atomic, folder-driven modular architecture:

```
SqlX/
├── appMap.md                        # Master AI Quick-Lookup Architecture & Feature Map
├── gemini.md                        # Master Project Rules & Architectural Contracts
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Automated cross-platform lint, test & typecheck
│       └── release.yml               # Production build & release matrix
├── .cargo/
│   └── config.toml                  # Compiler & linker optimizations
├── docker-compose.dev.yml           # Local multi-database testing environment
├── src-tauri/                       # Native Rust Core Engine
│   ├── Cargo.toml                   # Rust dependencies & profile optimizations
│   ├── build.rs                     # Tauri build script
│   ├── tauri.conf.json              # Tauri v2 desktop app configuration & window settings
│   ├── capabilities/
│   │   └── default.json             # Tauri v2 security capabilities & permissions
│   └── src/
│       ├── main.rs                  # Desktop executable entrypoint (WebKitGTK Wayland fix)
│       ├── lib.rs                   # Tauri plugin & command registrar
│       ├── state.rs                 # Shared async thread-safe application state
│       ├── error.rs                 # Centralized typed error definitions (thiserror)
│       ├── drivers/                 # Modular Database Driver Engine
│       │   ├── mod.rs               # Database trait definitions & factory
│       │   ├── common.rs            # Shared row decoding macros & metadata helpers
│       │   ├── postgres.rs          # PostgreSQL driver implementation
│       │   ├── mysql.rs             # MySQL/MariaDB driver implementation
│       │   └── sqlite.rs            # SQLite local file driver implementation
│       ├── commands/                # Tauri IPC Command Handlers
│       │   ├── mod.rs
│       │   ├── connection.rs        # Connect, test, disconnect
│       │   ├── query.rs             # Execute query
│       │   ├── schema.rs            # Fetch schema tree, table columns
│       │   └── theme.rs             # Load user themes, list custom themes
│       ├── models/                  # Shared Rust data models & DTOs
│       │   ├── mod.rs
│       │   ├── connection.rs        # Connection configuration structs
│       │   ├── query.rs             # Query execution request / response payloads
│       │   └── schema.rs            # Schema object tree representations
│       └── utils/
│           ├── mod.rs
│           ├── sql_parser.rs        # SQL statement splitting & sanitization
│           └── fs_theme.rs          # Filesystem theme loader & watcher
├── src/                             # Solid / React / TypeScript UI
│   ├── components/
│   │   ├── ui/                      # Atomic Design Primitives
│   │   │   ├── atoms/               # Button, Input, Badge, IconButton, UnderlineTab
│   │   │   └── molecules/           # SearchInput, DropdownMenu, Toast, Modal
│   │   ├── layout/                  # TitleBar, StatusBar, ActivityBar
│   │   │   ├── Sidebar.tsx          # Resizable sidebar container
│   │   │   └── sidebar/             # SidebarNav, ConnectionList, SchemaExplorer
│   │   ├── editor/                  # SqlEditor, EditorTabBar, EditorSplitPane
│   │   ├── results/                 # ResultsPanel, ResultsToolbar, ExportDropdown, ExtensionsMenu
│   │   │   └── views/               # GridView, JsonView, ChartView, SchemaView, Running/Error/Empty
│   │   ├── theme/                   # ThemeManager, ThemeCategories, ThemeCard, ThemeEditorModal
│   │   ├── connection/              # ConnectionsDashboard, ConnectionCard, ConnectionModal
│   │   ├── grid/                    # DataGrid (TanStack Virtual & Table)
│   │   ├── common/                  # CommandPalette, SqlCodeBlock
│   │   └── views/                   # HomeView, HistoryView, SavedQueriesView, ExtensionsView
│   ├── data/                        # Static Datasets (builtinThemes.ts, dataExtensions.ts)
│   │   ├── builtinThemes.ts         # 13 Built-in calibrated themes & category IDs
│   │   └── dataExtensions.ts        # Data transformation options catalog
│   ├── utils/                       # Pure Utilities (exportUtils.ts, jsonHighlight.tsx, dataTransforms.ts)
│   ├── stores/                      # Reactive state (Zustand: connectionStore, queryStore, themeStore)
│   ├── services/                    # Tauri IPC bridge & theme engine
│   ├── types/                       # TypeScript interfaces matching Rust DTOs
│   ├── styles/                      # Tailwind styles & CSS custom variable mappings
│   ├── App.tsx                      # Root application layout & keyboard shortcuts
│   └── main.tsx                     # UI entrypoint
├── themes/                          # Default & User JSON Themes
│   ├── theme.schema.json            # JSON Schema specification for theme validation
│   ├── dark-solid.json              # Default dark solid theme
│   ├── light-solid.json             # Default light solid theme
│   └── midnight-slate.json          # Midnight slate theme
├── .editorconfig
├── .gitignore
├── .oxlintrc.json                   # Oxlint fast linter configuration
├── biome.json                       # Biome formatter & linter configuration
├── tsconfig.json                    # Strict TypeScript configuration
├── tsconfig.node.json
├── vite.config.ts                   # Fast Vite bundler configuration
├── tailwind.config.ts               # Tailwind CSS configured for dynamic CSS variable tokens
├── postcss.config.js
└── package.json
```

---

## 3. Rust Backend Standards
- **Thread Safety**: All mutable state must be guarded using `parking_lot::RwLock` or `tokio::sync::Mutex` inside `AppState`.
- **Database Driver Isolation**: Every database driver (`Postgres`, `MySQL`, `SQLite`) must implement the `DatabaseAdapter` trait. Adding support for another engine (e.g. ClickHouse, MSSQL) must only require adding a new file to `src-tauri/src/drivers/`.
- **Common Driver Helpers**: All drivers use [`src-tauri/src/drivers/common.rs`](file:///home/mohit/Desktop/Desktop/SqlX-/src-tauri/src/drivers/common.rs) macros (`decode_cell_to_json!`, `decode_pg_cell_to_json!`) to prevent row decoding duplication.
- **Error Handling**: Never use raw `unwrap()` or `expect()` in production commands. All errors must map into `AppError` via `thiserror` and serialize cleanly to the frontend.
- **Connection Pools**: Database pools must use connection limits and timeout boundaries (`5s acquire timeout`) to prevent pool exhaustion or app hangs.

---

## 4. Frontend UI/UX Standards
- **Strict Color Tokens**: Use Tailwind classes that map directly to CSS variables (`bg-bg-base`, `bg-bg-surface`, `text-tx-primary`, `border-border-subtle`, `bg-grid-rowEven`, etc.).
- **Typography**:
  - UI Labels: Sans-serif (`Inter`, `Geist`, `Segoe UI`).
  - SQL Code & Grid Cells: Monospace (`JetBrains Mono`, `Fira Code`, `Cascadia Code`).
- **CodeMirror 6 SQL Editor**:
  - Auto-completion for SQL keywords & schema table/column names.
  - Keyboard shortcuts: `F5` / `Ctrl+Enter` to run query, `Ctrl+/` to toggle comments.
- **DataGrid Virtualization**: Always use `@tanstack/react-virtual` for data rendering so scrolling through 500k rows produces zero layout recalculation overhead.

---

## 5. Theme JSON Specification & Manual Loading
Users can create custom themes by placing `.json` files into `~/.config/sqlx/themes/` (Linux) or `%APPDATA%\SqlX\themes\` (Windows).

Themes are validated against `themes/theme.schema.json`:
- `name`: Human-readable string.
- `type`: `"dark"` | `"light"`.
- `colors`: Must contain all required token objects (`background`, `border`, `text`, `accent`, `status`, `editor`, `grid`).

---

## 6. Tooling & CI/CD Pipeline
- **Fast Linting**: Oxlint (`npm run lint`) & Biome (`biome check .`).
- **TypeScript**: `npm run typecheck` (`tsc --noEmit`).
- **Build**: `npm run build` (`tsc && vite build`).
- **Rust Checks**: `cargo check --manifest-path src-tauri/Cargo.toml`.
- **Release Matrix**: Automated packaging into `.deb`, `.AppImage`, `.msi`, and `.exe` on tag push (`v*`).
