# AGENTS.md

A Tauri 2 desktop app (Rust backend + vanilla TypeScript frontend bundled by Vite). The app's UI is minimal: it prompts for a "tangier url", persists it to `localStorage`, and runs fullscreen with no window decorations. The Rust side currently exposes only a placeholder `greet` command.

## Commands

All frontend commands use **bun** (not npm/yarn). The Tauri config's `beforeDevCommand`/`beforeBuildCommand` are hardcoded to `bun run dev` / `bun run build`, so using another package manager will desync from the Tauri build pipeline.

- `bun run dev` — start Vite dev server (port 1420, strict).
- `bun run build` — `tsc` (typecheck, no emit) then `vite build` → `dist/`.
- `bun run preview` — serve the production build.
- `bun tauri dev` — run the full app in dev mode (starts Vite + compiles Rust + launches window).
- `bun tauri build` — produce a bundled installer (runs `bun run build` first, then compiles Rust in release).
- Cargo commands (run inside `src-tauri/`): `cargo check`, `cargo build`, `cargo clippy`.

### Nix dev shell

`flake.nix` provides a devShell with the native deps required to build the Rust/WebKit stack on Linux (`pkg-config`, `wrapGAppsHook4`, `cargo`, `rustc`, `bun`, `librsvg`, `webkitgtk_4_1`). Enter it with `nix develop` (or `direnv` if configured). On Linux, `XDG_DATA_DIRS` is exported by `shellHook` to fix Wayland display-scale reporting — don't drop it.

## Project layout

- `src/` — frontend (vanilla TS, no framework). Entry: `index.html` → `src/main.ts`.
- `src-tauri/` — Rust backend + Tauri config.
  - `src/lib.rs` — app builder + `#[tauri::command]` handlers. `main.rs` just calls `tangier_client_lib::run()`.
  - `capabilities/default.json` — Tauri 2 capability/permissions file scoped to the `main` window. Add new permissions here when using a new Tauri API/plugin, otherwise calls are denied at runtime.
  - `tauri.conf.json` — app config (identifier `top.nugs.tangier-client`).
  - `gen/` — Tauri-generated schemas; do not hand-edit.
- `dist/` — Vite build output (consumed by Tauri as `frontendDist: "../dist"`); gitignored.

## Conventions & gotchas

- **Tauri 2, not 1.** Plugin imports are `tauri-plugin-opener` (v2). Capabilities live in `src-tauri/capabilities/` and must reference the window identifier (`main`) — this is a common silent-failure point when adding windows.
- **`withGlobalTauri: true`** is set, so the Tauri API is injected on `window.__TAURI__` in addition to the npm package. Either access path works.
- **Window is fullscreen + `decorations: false`** — there's no title bar / close button from the OS chrome; closing relies on Tauri/OS shortcuts. Keep this in mind when testing.
- **Vite port 1420 is `strictPort: true`.** If something else holds 1420, `tauri dev` will fail rather than picking another port.
- **`vite.config.ts` ignores `src-tauri/**`from the watcher** to avoid Rust rebuilds triggering HMR. If you add shared files under`src-tauri/` that the frontend reads, adjust this.
- **`tsconfig.json` is strict** and includes `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`. `tsc` runs as part of `bun run build`, so unused vars will break the production build (but not `bun run dev`).
- **CSP is disabled** (`"csp": null` in `tauri.conf.json`). Fine for dev/this use case; re-enable if loading remote content.
- **Lib crate name** is `tangier_client_lib` (not `tangier_client`) to avoid a Windows cargo naming collision with the bin — see the comment in `Cargo.toml`. Reference the lib by this name, not the package name.
- **`main.rs` carries `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`** — do not remove; it hides the console window in release builds on Windows.
- **No test setup exists** — there are no test scripts, test files, or test deps in either `package.json` or `Cargo.toml`. Don't assume a test runner is configured.
- **No lint config** beyond `tsc` strictness and rustc/clippy defaults.

## Identifier

App identifier: `top.nugs.tangier-client` (Tauri + bundle). Product/window title: `Tangier`.
