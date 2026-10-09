# SqlX - Project Guidelines & Engineering Standards

## 1. Core Mission & Philosophy
**SqlX** is a next-generation, high-performance, low-memory SQL client for Linux and Windows. It is engineered to replace sluggish, bloated database clients with a lightning-fast, ergonomic, and aesthetically refined workbench.

### Guiding Principles
- **Speed & Efficiency**: Instant startup time (< 500ms), low idle memory footprint (< 60MB), and asynchronous query execution that never locks the UI thread.
- **Visual Clarity & Solid Aesthetics**: Clean, distraction-free interface built on solid color tokens, precise typography, and intentional whitespace. No tacky AI-generated glowing effects, muddy neon gradients, or sluggish transition bloat.
- **Ergonomics First**: Keyboard-first navigation, tabbed query management, intelligent SQL autocomplete, and instant table/query data visualization.
- **Deeply Themeable**: Fully decoupled UI styling driven by human-readable JSON theme configuration files.

---

## 2. Design System & UI/UX Standards

### 2.1 Visual Rules
- **Solid Colors**: All surfaces, borders, cards, and buttons must use solid, well-calibrated color tokens. Avoid arbitrary drop-shadows, blurred backdrop filters, and rainbow gradients.
- **Borders & Separation**: Use subtle 1px solid borders (`border-1`) for visual separation between panels, sidebars, tabs, and data grid cells.
- **Typography**:
  - **UI Font**: Clean geometric sans-serif (e.g., *Inter*, *Geist*, *SF Pro*, or *Roboto*).
  - **Code/SQL/Data Font**: Crisp monospace with ligature options (e.g., *JetBrains Mono*, *Fira Code*, or *Cascadia Code*).
- **Density Controls**: Provide Compact, Standard, and Relaxed density modes for data grids and sidebar trees.

### 2.2 Theme Configuration Engine (`theme.json`)
The application must load themes dynamically from a user-configurable JSON file located in the user's config directory (`~/.config/sqlx/themes/` on Linux, `%APPDATA%\SqlX\themes\` on Windows).

#### Theme Schema Specification
```json
{
  "$schema": "./theme.schema.json",
  "name": "SqlX Dark Solid",
  "type": "dark",
  "colors": {
    "background": {
      "base": "#121214",
      "surface": "#1a1a1e",
      "overlay": "#222228",
      "elevated": "#2a2a32"
    },
    "border": {
      "subtle": "#2e2e38",
      "default": "#3d3d4a",
      "strong": "#525264"
    },
    "text": {
      "primary": "#f4f4f6",
      "secondary": "#a1a1aa",
      "muted": "#71717a",
      "inverse": "#09090b"
    },
    "accent": {
      "primary": "#3b82f6",
      "primaryHover": "#2563eb",
      "primaryActive": "#1d4ed8",
      "text": "#ffffff"
    },
    "status": {
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#06b6d4"
    },
    "editor": {
      "background": "#16161a",
      "cursor": "#f4f4f6",
      "selection": "#264f78",
      "lineHighlight": "#1e1e24",
      "gutterBackground": "#16161a",
      "gutterForeground": "#52525b"
    },
    "grid": {
      "headerBackground": "#1e1e24",
      "headerText": "#e4e4e7",
      "rowEven": "#16161a",
      "rowOdd": "#1a1a1e",
      "rowHover": "#24242c",
      "rowSelected": "#1e3a5f",
      "cellBorder": "#27272a",
      "nullValue": "#71717a"
    }
  }
}
```

---

## 3. Performance & Memory Budget

| Metric | Target | Hard Limit |
| :--- | :--- | :--- |
| **Cold Start Time** | < 400ms | < 800ms |
| **Idle RAM Usage** | 30 MB - 50 MB | < 80 MB |
| **Large Result Set (100k+ rows)** | Instant render via virtualization | Zero UI freeze / streaming chunk fetch |
| **Frame Rate** | 60 - 120 FPS constant | No frame drops on scroll |
| **Query Cancellation** | Instant (< 50ms) | Backend terminates socket query immediately |

### Architectural Performance Rules
1. **Virtualized Data Grid**: Never render DOM nodes for off-screen rows or columns. Use chunk-based virtual scrolling with row pooling.
2. **Stream-Based Data Transfer**: Large query results must stream from the database driver in binary/IPC chunks rather than buffering the entire multi-gigabyte dataset into memory at once.
3. **Thread Isolation**: Database I/O, query execution, connection pinging, and formatting must execute on native worker threads or async Tokio tasks, completely isolated from UI rendering.
4. **Zero Heavy Web View Bloat**: Avoid heavy DOM wrappers, redundant React reconciliations, or unnecessary runtime overhead. Keep component trees lean and reactive.

---

## 4. Key Feature Matrix

1. **Connection Manager**:
   - Support for PostgreSQL, MySQL/MariaDB, SQLite, Redis/Key-Value, ClickHouse, and SQL Server.
   - SSL/TLS, SSH tunneling (with native agent and key support).
   - Safe environment indicators (Production: Solid Red Badge, Staging: Solid Orange, Dev: Solid Green).
2. **Query Workspace**:
   - Multi-tab SQL editor with syntax highlighting, auto-formatting, and context-aware schema autocomplete.
   - Parameterized query execution (`:param` / `$1`).
   - Query history, execution plan analyzer (`EXPLAIN ANALYZE`), and query timing telemetry.
3. **Data Grid & Visualizer**:
   - In-place cell editing with transaction preview (diff view before `COMMIT`).
   - Multiple visualization views:
     - **Grid View** (virtualized table with quick filters and column pinning).
     - **JSON View** (formatted document viewer for JSON/JSONB fields).
     - **Chart View** (Bar, Line, Area, and Scatter charts for numerical series).
     - **Inspector View** (Key-value single-row detailed sidebar).
4. **Schema & Object Explorer**:
   - Tree navigation for Databases, Schemas, Tables, Views, Triggers, Functions, and Indexes.
   - Quick DDL generator (`CREATE TABLE`, `ALTER TABLE`, DDL export).
   - ER Diagram / Table Relationship Visualizer (SVG-based, clean orthogonal layout).

---

## 5. Development & Code Quality Rules
- **Modularity**: Strict separation between Driver/Protocol layer, IPC Bridge layer, and UI Presentation layer.
- **Type Safety**: End-to-end type safety between backend data structures and frontend models.
- **Testing**:
  - Unit tests for query parsers, connection handlers, and theme parsers.
  - Integration tests against containerized databases (PostgreSQL, MySQL, SQLite).
- **Error Handling**: Friendly, actionable error messages with direct links to the faulty SQL line/character position.
