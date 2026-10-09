# SqlX - Architectural Standards & Engineering Guidelines

## 1. Core Mission & Design Tenets
**SqlX** is a high-performance, low-memory, modern SQL client engineered specifically for Linux and Windows.

### Invariant Rules
1. **Zero Aesthetic Bloat**: No cheap AI-generated neon gradients, muddy glowing box-shadows, or slow transition lag. All UI tokens must use **solid, high-contrast, calibrated colors** with 1px subtle borders (`border-1`).
2. **Extreme Performance Budget**:
   - Idle RAM: **< 50 MB**.
   - Cold Startup: **< 350 ms**.
   - Large Dataset: 100k+ rows rendered smoothly at **60/120 FPS** via virtualized row pooling (`@tanstack/react-virtual`).
   - Query Execution: Thread-isolated async Tokio tasks that never block or freeze the UI thread.
3. **Pluggable Dynamic JSON Themes**: All styling maps to CSS Custom Properties (`var(--color-...)`). Changing or loading an external `theme.json` must update the interface instantly without restarting or re-rendering the component tree.

---

## 2. Immutable Project Folder Structure

The project structure is locked and must not be arbitrarily rearranged:

```
SqlX/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Automated cross-platform lint, test & typecheck
│       └── release.yml               # Production build & release matrix (Linux .deb/.AppImage, Windows .msi/.exe)
├── .cargo/
│   └── config.toml                  # Compiler & linker optimizations
├── docker-compose.dev.yml           # Local multi-database testing environment (Postgres, MySQL, Redis, ClickHouse)
├── src-tauri/                       # Native Rust Core Engine
│   ├── Cargo.toml                   # Rust dependencies & profile optimizations
│   ├── build.rs                     # Tauri build script
│   ├── tauri.conf.json              # Tauri v2 desktop app configuration & window settings
│   ├── capabilities/
│   │   └── default.json             # Tauri v2 security capabilities & permissions
│   └── src/
│       ├── main.rs                  # Desktop executable entrypoint
│       ├── lib.rs                   # Tauri plugin & command registrar
│       ├── state.rs                 # Shared async thread-safe application state
│       ├── error.rs                 # Centralized typed error definitions (thiserror)
│       ├── drivers/                 # Modular Database Driver Engine
│       │   ├── mod.rs               # Database trait definitions & factory
│       │   ├── postgres.rs          # PostgreSQL driver implementation
│       │   ├── mysql.rs             # MySQL/MariaDB driver implementation
│       │   └── sqlite.rs            # SQLite local file driver implementation
│       ├── commands/                # Tauri IPC Command Handlers
│       │   ├── mod.rs
│       │   ├── connection.rs        # Connect, test, disconnect, ping
│       │   ├── query.rs             # Execute query, stream chunks, cancel query
│       │   ├── schema.rs            # Fetch databases, tables, columns, constraints, DDL
│       │   └── theme.rs             # Load user themes, list custom themes from disk
│       ├── models/                  # Shared Rust data models & DTOs
│       │   ├── mod.rs
│       │   ├── connection.rs        # Connection configuration structs
│       │   ├── query.rs             # Query execution request / response payloads
│       │   └── schema.rs            # Schema object tree representations
│       └── utils/
│           ├── mod.rs
│           └── fs_theme.rs          # Filesystem theme loader & watcher
├── src/                             # Solid / React / TypeScript UI
│   ├── assets/                      # Static assets & icons
│   ├── components/                  # Solid-color UI primitives
│   │   ├── common/                  # Buttons, Modals, Inputs, Tooltips, Badges, Tabs
│   │   ├── layout/                  # TitleBar, ActivityBar, StatusBar
│   │   ├── editor/                  # CodeMirror 6 SQL Editor & autocomplete
│   │   ├── grid/                    # Virtualized DataGrid (TanStack Virtual)
│   │   └── schema-tree/             # Database/Table explorer navigation
│   ├── stores/                      # Reactive state (Zustand: connectionStore, queryStore, themeStore)
│   ├── services/                    # Tauri IPC bridge & theme engine
│   ├── types/                       # TypeScript interfaces matching Rust DTOs
│   ├── styles/                      # Tailwind styles & CSS custom variable mappings
│   ├── App.tsx                      # Main application layout
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
├── package.json
└── gemini.md                        # Master Project Rules & Architectural Contracts
```

---

## 3. Rust Backend Standards
- **Thread Safety**: All mutable state must be guarded using `parking_lot::RwLock` or `tokio::sync::Mutex` inside `AppState`.
- **Database Driver Isolation**: Every database driver (`Postgres`, `MySQL`, `SQLite`) must implement the `DatabaseAdapter` trait. Adding support for another engine (e.g. ClickHouse, MSSQL) must only require adding a new file to `src-tauri/src/drivers/`.
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
- **Rust Checks**: `cargo fmt --check` and `cargo clippy -- -D warnings`.
- **Cross-Platform CI**: GitHub Actions test matrix validating both `ubuntu-latest` and `windows-latest`.
- **Release Matrix**: Automated packaging into `.deb`, `.AppImage`, `.msi`, and `.exe` on tag push (`v*`).
