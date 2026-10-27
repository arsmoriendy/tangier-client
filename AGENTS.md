# AGENTS.md

A Tauri 2 desktop app (Rust backend + **SolidJS/TypeScript** frontend bundled by Vite). The app's UI prompts for a "tangier url", persists it through a Tauri command, then redirects; it runs fullscreen with no window decorations. The Rust side currently exposes `read_url`, `update_url`, and `shutdown` commands.

> **Keep this file current.** If you learn something non-obvious about the stack, build, dependencies, or conventions while working, record it here before finishing so the next agent benefits. Correct anything you find to be stale.

## Commands

All frontend commands use **bun** (not npm/yarn). The Tauri config's `beforeDevCommand`/`beforeBuildCommand` are hardcoded to `bun run dev` / `bun run build`, so using another package manager will desync from the Tauri build pipeline.

- `bun run dev` — start Vite dev server (port 1420, strict).
- `bun run build` — `tsc` (typecheck, no emit) then `vite build` → `dist/`.
- `bun run preview` — serve the production build.
- `bun run ui` — `solidui-cli` (add shadcn-style components to `src/components/ui/`). See "Frontend stack".
- `bun run format` — `prettier -w src` (uses `.prettierrc`, incl. `prettier-plugin-tailwindcss`).
- `bunx tsc --noEmit` — quick typecheck without a full build.
- `bun tauri dev` — run the full app in dev mode (starts Vite + compiles Rust + launches window).
- `bun tauri build` — produce a bundled installer (runs `bun run build` first, then compiles Rust in release).
- Cargo commands (run inside `src-tauri/`): `cargo check`, `cargo build`, `cargo clippy`.

### Nix dev shell

`flake.nix` provides a devShell with the native deps required to build the Rust/WebKit stack on Linux (`pkg-config`, `wrapGAppsHook4`, `cargo`, `rustc`, `bun`, `librsvg`, `webkitgtk_4_1`). Enter it with `nix develop` (or `direnv` if configured). On Linux, `XDG_DATA_DIRS` is exported by `shellHook` to fix Wayland display-scale reporting — don't drop it.

## Project layout

- `src/` — frontend (SolidJS + TypeScript). Entry: `index.html` → `src/main.tsx` → `src/root.tsx`.
  - `src/components/ui/` — shadcn-style primitives (see "Frontend stack" below).
  - `src/lib/utils.ts` — `cn()` helper (`clsx` + `tailwind-merge`).
  - `src/styles.css` — Tailwind entry + theme CSS variables.
- `src-tauri/` — Rust backend + Tauri config.
  - `src/lib.rs` — app builder + `#[tauri::command]` handlers. `main.rs` just calls `tangier_client_lib::run()`.
  - `capabilities/default.json` — Tauri 2 capability/permissions file scoped to the `main` window. Add new permissions here when using a new Tauri API/plugin, otherwise calls are denied at runtime.
  - `tauri.conf.json` — app config (identifier `top.nugs.tangier-client`).
  - `gen/` — Tauri-generated schemas; do not hand-edit.
- `dist/` — Vite build output (consumed by Tauri as `frontendDist: "../dist"`); gitignored.

## Frontend stack

- **SolidJS** (not React, not vanilla TS) with Vite (`vite-plugin-solid`). JSX uses Solid semantics: `on:click`/`on:submit` for native listeners, `<Show>`/`<For>` for control flow, and components read from functions (accessors), not React hooks.
- **Kobalte** (`@kobalte/core`) supplies the headless primitives — the project's Radix UI counterpart. Key differences from Radix:
  - There is **no `asChild`**; render as another component with `as={Component}`.
  - State is exposed as data attributes (`data-[expanded]` / `data-[closed]`, `data-[disabled]`, etc.) rather than `data-state="open"`.
- **shadcn-style UI** lives in `src/components/ui/`, generated with **solid-ui** (`solidui-cli`, alias `bun run ui`). Config is `ui.config.json` (aliases `@/components/ui` + `@/lib/utils`); templates are pulled from `https://www.solid-ui.com/registry/ui/<name>.json`.
  - `solidui-cli add <name>` may fail at its dependency-install step (`bun add '' '@kobalte/core'`) **after** writing the file — `@kobalte/core` is already installed, so ignore that error and verify the generated file.
  - The registry templates can be incomplete versus newer shadcn APIs (e.g. `alert-dialog` ships without `Header`/`Footer`/`Action`/`Cancel`). Extend the file in `src/components/ui/` to add what you need.
- **Tailwind CSS 3** + `tailwindcss-animate`, with `class-variance-authority` for variants and `clsx`/`tailwind-merge` via `cn()` (`src/lib/utils.ts`). Theme tokens are CSS variables in `src/styles.css`; dark mode toggles the `.dark` class (see the inline "block flashbang" script in `index.html`).
- Path alias **`@/*` → `src/*`**, configured in both `tsconfig.json` and `vite-tsconfig-paths`.
- **No icon library and no i18n are installed.** React-only packages (e.g. `@phosphor-icons/react`) and `next-intl` must be replaced — use inline SVGs and hardcoded strings.

## Conventions & gotchas

- **Tauri 2, not 1.** Plugin imports are `tauri-plugin-opener` (v2). Capabilities live in `src-tauri/capabilities/` and must reference the window identifier (`main`) — this is a common silent-failure point when adding windows.
- **Tauri commands** live in `src-tauri/src/cmds/` (alongside `prelude`/`state` modules) and are registered in `lib.rs`'s `invoke_handler`. Each needs an `allow-<command>` (kebab-case) permission in `capabilities/default.json` (e.g. `allow-shutdown`, `allow-read-url`), in addition to plugin defaults such as `process:default`. The frontend calls them with `invoke()` from `@tauri-apps/api/core`.
- **`withGlobalTauri: true`** is set, so the Tauri API is injected on `window.__TAURI__` in addition to the npm package. Either access path works.
- **Window is fullscreen + `decorations: false`** — there's no title bar / close button from the OS chrome; closing relies on Tauri/OS shortcuts. Keep this in mind when testing.
- **Vite port 1420 is `strictPort: true`.** If something else holds 1420, `tauri dev` will fail rather than picking another port.
- **`vite.config.ts` ignores `src-tauri/**` from the watcher** to avoid Rust rebuilds triggering HMR. If you add shared files under `src-tauri/` that the frontend reads, adjust this.
- **`tsconfig.json` is strict** and includes `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`. `tsc` runs as part of `bun run build`, so unused vars will break the production build (but not `bun run dev`).
- **CSP is disabled** (`"csp": null` in `tauri.conf.json`). Fine for dev/this use case; re-enable if loading remote content.
- **Lib crate name** is `tangier_client_lib` (not `tangier_client`) to avoid a Windows cargo naming collision with the bin — see the comment in `Cargo.toml`. Reference the lib by this name, not the package name.
- **`main.rs` carries `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]`** — do not remove; it hides the console window in release builds on Windows.
- **No test setup exists** — there are no test scripts, test files, or test deps in either `package.json` or `Cargo.toml`. Don't assume a test runner is configured.
- **No lint config** beyond `tsc` strictness and rustc/clippy defaults.

## Identifier

App identifier: `top.nugs.tangier-client` (Tauri + bundle). Product/window title: `Tangier`.
