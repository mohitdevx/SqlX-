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

## 2. High-Level Architecture & Delegation

SqlX uses an atomic, folder-driven modular architecture. To eliminate token waste across development sessions, exhaustive directory trees and feature mappings are delegated to specialized references:
- **Feature & Component Fast Lookup**: Consult [**`appMap.md`**](file:///home/mohit/Desktop/Desktop/SqlX-/appMap.md) (contains visual component flow, quick action-to-file lookup table, and Tauri IPC mappings).
- **Full Repository Directory Tree**: Documented in [**`README.md`**](file:///home/mohit/Desktop/Desktop/SqlX-/README.md).

### Module Organization Summary
- **Frontend Primitives (`src/components/ui/`)**: Atomic UI elements split into `atoms/` (`Button`, `Input`, `Badge`, `IconButton`, `UnderlineTab`) and `molecules/` (`SearchInput`, `DropdownMenu`, `Toast`, `Modal`).
- **Feature Modules (`src/components/`)**:
  - `layout/`: TitleBar, ActivityBar, StatusBar, and modular `sidebar/` (`SidebarNav`, `ConnectionList`, `SchemaExplorer`).
  - `editor/`: `SqlEditor`, `EditorTabBar`, `EditorSplitPane`.
  - `results/`: Coordinator, toolbar, export popover, and modular `views/` (`GridView`, `JsonView`, `ChartView`, `SchemaView`, state screens).
  - `theme/`: `ThemeManager`, `ThemeCategories`, `ThemeCard`, `ThemeEditorModal`.
  - `connection/`: `ConnectionsDashboard`, `ConnectionCard`, `ConnectionModal`.
- **Data & Utilities (`src/data/`, `src/utils/`)**:
  - `src/data/`: `builtinThemes.ts` (13 themes extracted from UI logic), `dataExtensions.ts`.
  - `src/utils/`: `exportUtils.ts` (CSV/JSON download/copy), `jsonHighlight.tsx`, `dataTransforms.ts`.
- **Rust Backend Engine (`src-tauri/src/`)**:
  - `drivers/`: `DatabaseAdapter` implementations (`postgres.rs`, `mysql.rs`, `sqlite.rs`) utilizing shared row decoding macros in `common.rs`.
  - `commands/`: IPC handlers (`connection.rs`, `query.rs`, `schema.rs`, `theme.rs`).
  - `state.rs`: Thread-safe connection pool manager (`Arc<RwLock<ConnectionManager>>`).

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
