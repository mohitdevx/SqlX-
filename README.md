# SqlX

> A lean, blazingly responsive, and aesthetic desktop SQL client engineered with Rust and React. Crafted for developers who value speed, precision, and distraction-free design over bloated tooling.

---

## Why I Built SqlX

For years, inspecting databases meant choosing between two extremes: heavyweight Java-based behemoths like DBeaver and DataGrip that consume half a gigabyte of RAM before running a single query, or sluggish Electron wrappers that feel sluggish and disconnected from the host operating system.

I wanted something different: a workbench that starts in milliseconds, feels like a precision instrument, and respects system resources. 

SqlX was born out of that obsession. By marrying the raw performance and memory safety of **Rust** (via Tauri 2 and the `sqlx` async driver) with a finely tuned **React 19 & TypeScript** interface, SqlX delivers a native desktop experience that stays nimble—operating well under 60 MB of memory—while effortlessly querying databases with millions of rows.

No gimmicks. No bloated modal dialogs. Just a quiet, focused environment for writing queries and exploring schemas.

---

## Key Highlights

- **Native Async Database Drivers**  
  Direct, asynchronous connections to **PostgreSQL**, **MySQL**, and **SQLite** powered by Rust’s `tokio` runtime and `sqlx` driver pool. No JDBC bridges or runtime dependencies.

- **Virtualized High-Velocity Data Grid**  
  Engineered with `@tanstack/react-virtual` to render massive result sets smoothly at 60 FPS without DOM thrashing or memory leaks.

- **CodeMirror 6 SQL Engine**  
  An ergonomic code editor featuring dialect-aware syntax highlighting, intelligent table/column autocompletion, execution shortcuts (`Ctrl+Enter` / `F5`), and multi-tab query buffers.

- **Live Schema Inspector**  
  Hierarchical navigation for databases, tables, and columns—complete with data type glyphs, primary key indicators, and quick query generation.

- **Translucent, Human-Crafted UI**  
  A borderless aesthetic utilizing subtle translucency, native system typography, color-coded connection capsules, and smooth mouse-resizable panels.

- **Audit History & Snippet Management**  
  Persistent query history with execution latency metrics alongside a tagged snippet repository for recurring routines.

- **Unified Connection Management**  
  A dedicated setup view supporting direct connection URI strings, SSL/TLS negotiation, custom environment tagging (`production`, `staging`, `dev`), and expandable metadata tabs.

---

## Architectural Overview

SqlX relies on a decoupled, asynchronous desktop architecture:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + TypeScript)         │
│  - Zustand Stores (Connections, Tabs, Themes, History) │
│  - CodeMirror 6 Editor Engine                          │
│  - TanStack Virtual Data Grid                          │
│  - Tailwind CSS + System Font Typography               │
└───────────────────────────┬────────────────────────────┘
                            │
               Tauri 2 IPC Bridge (JSON-RPC)
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Backend (Rust / Tauri 2)              │
│  - Tokio Async Runtime                                 │
│  - `sqlx` Connection Pool Manager                      │
│  - Native Database Drivers (Postgres, MySQL, SQLite)   │
│  - Type-Safe Schema Extractor & Streaming Serializer   │
└────────────────────────────────────────────────────────┘
```

### The Rust Core (`src-tauri`)
The backend acts as a lightweight, thread-safe database gateway. Database connections are managed inside an `Arc<RwLock<ConnectionManager>>` state container. When you run a query, the backend borrows the connection pool, executes prepared statements, measures execution latency in microseconds, and streams serialized rows directly across the Tauri IPC channel.

### The Frontend Layer (`src`)
The UI is strictly reactive and zero-dependency where it matters. State is decoupled into isolated Zustand stores with selective local persistence:
- **`connectionStore`**: Active sessions, saved connection profiles, and cached table column schemas.
- **`queryStore`**: Open editor tabs, persistent SQL audit logs, and bookmark snippets.
- **`themeStore`**: Dynamic CSS variables and color palettes.

## Repository Structure

SqlX uses an atomic, folder-driven modular architecture designed for high performance, maintainability, and rapid feature navigation. For an in-depth interactive feature-to-file lookup matrix and component dependency flow, refer to [**`appMap.md`**](appMap.md).

```
SqlX-/
├── appMap.md                   # Centralized architectural map & quick feature-to-file index
├── gemini.md                   # Development invariants & architectural standards
├── .github/
│   └── workflows/
│       ├── ci.yml              # Continuous integration (typecheck, lint, test)
│       └── release.yml         # Automated multi-platform release & binary packaging
│
├── src/                        # Frontend application layer (React 19 + TypeScript)
│   ├── components/             # Atomic & modular UI component architecture
│   │   ├── ui/                 # Reusable atomic design system primitives
│   │   │   ├── atoms/          # Button, Input, Badge, IconButton, UnderlineTab
│   │   │   └── molecules/      # SearchInput, DropdownMenu, Toast, Modal
│   │   ├── layout/             # Window layout chrome (TitleBar, ActivityBar, StatusBar)
│   │   │   └── sidebar/        # SidebarNav, ConnectionList, SchemaExplorer
│   │   ├── editor/             # CodeMirror 6 query editor, EditorTabBar, EditorSplitPane
│   │   ├── results/            # Results coordinator, ResultsToolbar, ExportDropdown, ExtensionsMenu
│   │   │   └── views/          # GridView, JsonView, ChartView, SchemaView, State views
│   │   ├── theme/              # ThemeManager, ThemeCategories, ThemeCard, ThemeEditorModal
│   │   ├── connection/         # ConnectionsDashboard, ConnectionCard, ConnectionModal
│   │   ├── grid/               # High-velocity virtualized data table (TanStack Virtual)
│   │   ├── common/             # CommandPalette, SqlCodeBlock
│   │   └── views/              # Top-level workspace views (Home, History, SavedQueries, Extensions)
│   ├── data/                   # Built-in themes (650+ lines extracted) & data extensions catalog
│   ├── utils/                  # Export utilities (CSV/JSON), syntax highlighters & data transforms
│   ├── services/               # Strongly typed Tauri IPC bridge & CSS variable theme engine
│   ├── stores/                 # Zustand global state stores (connectionStore, queryStore, themeStore)
│   ├── styles/                 # Design tokens, scrollbar styling & Tailwind configuration
│   └── types/                  # Type definitions for database models & UI theme tokens
│
├── src-tauri/                  # Desktop backend (Rust & Tauri 2)
│   ├── src/                    # Core backend implementation
│   │   ├── commands/           # IPC handlers (connection, query, schema, theme)
│   │   ├── drivers/            # Native async database drivers (PostgreSQL, MySQL, SQLite)
│   │   │   └── common.rs       # Shared row decoding macros & metadata helpers
│   │   ├── models/             # Serializable transfer objects & database schema trees
│   │   ├── utils/              # Internal utilities & logging infrastructure
│   │   ├── state.rs            # Thread-safe async connection pool & session state
│   │   ├── error.rs            # Centralized typed error definitions (thiserror)
│   │   ├── main.rs             # Application entrypoint (WebKitGTK Wayland fix)
│   │   └── lib.rs              # Tauri command registrar & plugin initialization
│   ├── Cargo.toml              # Rust dependency manifest & release optimization flags
│   └── tauri.conf.json         # Desktop application window settings, security & bundler rules
│
├── themes/                     # Default & user-defined JSON theme palettes
├── tailwind.config.ts          # Tailwind design system & dynamic CSS variable mappings
├── vite.config.ts              # Vite frontend bundler configuration & path aliases
├── biome.json                  # Biome code formatting & linting rules
└── package.json                # Project dependencies, scripts & metadata
```


---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v20 or v22 recommended)
- **pnpm** (v9+)
- **Rust & Cargo** (latest stable toolchain from [rustup.rs](https://rustup.rs/))
- **OS Libraries** (Linux only):
  ```bash
  sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
  ```

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SqlX-.git
   cd SqlX-
   ```

2. **Install frontend dependencies:**
   ```bash
   pnpm install
   ```

3. **Launch the development environment:**
   ```bash
   pnpm tauri dev
   ```
   *This starts the Vite hot-reloading dev server on port `1420` and compiles the Rust binary in debug mode.*

---

## Quality & Verification

SqlX enforces strict type safety and linting standards:

```bash
# Typecheck TypeScript codebase
pnpm typecheck

# Run Oxlint & Biome lint checks
pnpm lint

# Automatically format and apply safe fixes
pnpm lint:fix

# Verify frontend production build
pnpm build
```

---

## Building a Release

To compile an optimized, standalone release for your host platform:

```bash
pnpm tauri build
```

Output binaries will be written to:
- **Linux**: `src-tauri/target/release/bundle/appimage/` (`.AppImage`) and `bundle/deb/` (`.deb`)
- **Windows**: `src-tauri/target/release/bundle/nsis/` (`.exe`) and `bundle/msi/` (`.msi`)
- **macOS**: `src-tauri/target/release/bundle/dmg/` (`.dmg`)

### Automated Releases via GitHub Actions

A production workflow is provided in [`.github/workflows/release.yml`](.github/workflows/release.yml). When you push a version tag, GitHub Actions automatically compiles and packages native binaries for both Linux and Windows:

```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## License

Distributed under the MIT License.

---

<div align="center">

**Made with craft and care by Mohit**

*“Building tools that respect your machine, honor your time, and elevate the joy of writing code.”*

</div>
