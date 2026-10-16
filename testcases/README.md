# Testcases Overview

This folder contains a comprehensive suite of automated tests for the **SqlX Desktop** application, covering both the frontend (React/TypeScript) and backend (Rust/Tauri) parts. The goal is to ensure **zero unexpected behaviour** across all features, edge‑cases, and performance limits.

## Structure
- `frontend/` – Jest/Vitest tests for UI components and utilities.
- `backend/` – Rust `#[cfg(test)]` integration tests for database drivers and command handling.
- `e2e/` – End‑to‑end tests using Playwright to simulate user interactions in the desktop app.

Run all tests with:
```bash
npm run test   # frontend (vite/tsx)
cargo test      # backend
npm run test:e2e  # end‑to‑end (requires the app built)
```

Each test file is heavily commented to explain the scenario being covered.
