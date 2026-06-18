# PortStar — session notes

## 2026-06-18 — kill elevation + process tree

### Features added
- `SeDebugPrivilege` enabled at startup (silent no-op when not admin; helps kill same-user processes that sysinfo couldn't reach)
- `needs_elevation: bool` per `PortEntry` — probed in `list_ports` via `OpenProcess(PROCESS_TERMINATE)` on each PID; shield icon + disabled kill button in UI when true and app not elevated
- `relaunch_as_admin` command — `ShellExecuteExW` with "runas" verb on current exe; closes old instance, new elevated one opens (one UAC, session stays elevated)
- `Start elevated` setting — creates a Task Scheduler task (`schtasks /create /rl highest /sc onlogon`) that bypasses UAC at every startup; only enabled when already running elevated
- `is_elevated` command — checks token elevation via `GetTokenInformation(TokenElevation)`
- Success/error feedback bars in UI (green on kill, red on error)

### Key design decisions

**`kill_root_pid` uses an allowlist, not a denylist.**  
Walks up the parent chain only while the parent is a known dev launcher (npm, nodemon, cargo, python, uvicorn…). Stops at any unrecognised process. Earlier denylist approach (stop at terminals) walked into `svchost`/`services.exe` on service-managed processes and tried to kill them — fails even as admin.

**No per-kill UAC.** Earlier iteration called `ShellExecuteExW` runas on `taskkill` for every blocked kill. Replaced with "relaunch as admin" flow — one prompt, persistent for the session.

**`Win32_System_Registry` feature required for `SHELLEXECUTEINFOW` in windows-rs 0.58.** Not obvious from the struct name. Without it the build silently drops the type and gives "configured out" errors.

### Windows crate features now active
`Win32_UI_WindowsAndMessaging`, `Win32_UI_Shell`, `Win32_Graphics_Gdi`, `Win32_Foundation`, `Win32_Storage_FileSystem`, `Win32_Security`, `Win32_System_Threading`, `Win32_System_Registry`

### Deferred / known gaps
- `Start elevated` task created for current exe path — will break after app is moved/reinstalled; no auto-repair yet
- Terminal console flashes briefly on `relaunch_as_admin` in dev builds (dev binary has no `windows_subsystem = "windows"`; gone in release)
- `kill_root_pid` launcher list is manual — won't catch exotic runtimes (bun workers, deno subprocesses named differently, etc.)



## 2026-06-17 — V1 dev build shipped (commit `deaa2ed`)

### Stack
- Tauri 2.11 (Rust 1.94), Svelte 5.56 with runes, SvelteKit + adapter-static, Vite 6, pnpm 11.5
- Crates: `sysinfo 0.32`, `netstat2 0.9`, `windows 0.58` (Win32: WindowsAndMessaging / Shell / Gdi / Foundation / Storage_FileSystem), `image 0.25`, `base64 0.22`, `tauri-plugin-opener 2`, `tauri-plugin-autostart 2`

### Phases done
- **1–3** Scaffold, deps, Rust backend, tray + dual-mode window
- **4** Svelte UI (Header, PortList, PortRow, GroupHeader, KillMatchingButton, SettingsPanel) + dark theme + 2s polling + Esc/`/` keyboard

### Phases deferred (Phase 5–6)
- Custom app icon (port symbol, purple, multi-res `.ico`) + monochrome tray icon
- Toast/inline error on kill failure
- `Enter` on focused row → kill
- DPI-aware menu-window positioning (currently `(cursor.x − 380, cursor.y − 520)` floored at 0)
- MSI + NSIS bundle (`pnpm tauri build`)
- Smoke tests against seeded listeners

### Run
```
pnpm tauri dev
```
First Rust build takes a few min; incremental ~10s. Window starts hidden — left-click the tray icon to open. Right-click for Show / Quit.

### Gotchas hit during build
- pnpm v11 dropped the `pnpm` field in `package.json` — settings now live in `pnpm-workspace.yaml` (`allowBuilds: { esbuild: true }`). Without this, every `pnpm tauri dev` re-triggers the deps-status-check, fails the install, and aborts before Vite starts.
- SvelteKit template scaffolded by `create-tauri-app` — kept it (overkill for a single-page tray app but works). Entry is `src/routes/+page.svelte`; `+layout.ts` forces `prerender = true`.
- Scaffolder nested `port-star/port-star/`; flattened on first pass.
- `frontendDist` in `tauri.conf.json` is `../build` (SvelteKit's adapter-static output).

### Verified
- `cargo check` + `cargo build` clean
- `svelte-check` 0 errors, 1 warning (missing `@types/node` — non-blocking)
- `pnpm tauri dev` compiles, port-star.exe launches, Vite serves at `:1420`

### Not yet manually verified
- Tray icon click → window opens at cursor
- `list_ports` returns expected entries
- Kill / open URL buttons
- Pop-out → always-on-top toggle
- Autostart persistence across reboot
