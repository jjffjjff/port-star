# PortStar — Windows clone of ports.alasdairmonk.com

## Stack (locked)
- **Tauri 2.x** (Rust shell, system tray, single-window popover)
- **Svelte 5** with runes (`$state`, `$derived`, `$effect`)
- **Vite** as dev/build tool
- **pnpm** as package manager
- **Rust crates**: `sysinfo` (process info), `netstat2` (TCP socket enumeration), `tauri-plugin-autostart`, `tauri-plugin-opener`
- **Bundle**: MSI installer + portable `.exe` (both via `tauri build`)

## App spec
Tray-resident utility. Two display modes:

**Menu mode (default):** Click tray icon → compact frameless window opens anchored at cursor (like a right-click context menu, but styled). Loses focus → auto-closes. No window chrome, no taskbar entry.

**Popped mode:** Header has a "pop out" icon. Click → window converts to a normal resizable window with title bar, appears in taskbar, no longer auto-closes on blur. In popped mode, a second icon appears: "always on top" toggle.

Both modes list every process with an open TCP listening port on localhost. Per row:
- App icon (Windows shell icon via exe path → `ExtractIconExW`)
- Port number (`:11434`)
- Process name (`ollama.exe`)
- "Open in browser" button → `http://localhost:{port}`
- "Kill" button → terminates PID

Search bar filters by port or process name (live). "Kill all matching" button kills every row that survives the current filter. Grouping: same process name with multiple ports renders under a single group header.

## Visual approach
Minimal, functional, dark. No heavy theming commitments yet — neutral dark bg, simple rows, clear buttons. Use system fonts. Get structure right first; aesthetic refinements come later as a separate pass. Keep CSS modular and easy to swap.

## Implementation checklist

### Phase 1 — Scaffold
- [ ] `pnpm create tauri-app@latest` with Svelte (TS) template
- [ ] Rename to `port-star`, set bundle identifier `com.edtra.portstar`
- [ ] Switch Svelte template to Svelte 5 syntax if scaffolder gives v4
- [ ] Verify `pnpm tauri dev` opens window on Windows
- [ ] Add deps: `sysinfo`, `netstat2`, `tauri-plugin-autostart`, `tauri-plugin-opener`, `serde`

### Phase 2 — Rust backend (`src-tauri/src/lib.rs`)
- [ ] `#[derive(Serialize)] struct PortEntry { pid, port, process_name, exe_path, icon_b64 }`
- [ ] `#[tauri::command] fn list_ports() -> Vec<PortEntry>`
  - Use `netstat2::get_sockets_info` filtered to TCP + `Listen` state + localhost-bound (`0.0.0.0`, `127.0.0.1`, `::`, `::1`)
  - Join against `sysinfo::System::processes()` by PID
  - Extract exe icon via `windows` crate (`ExtractIconExW`) → PNG → base64 (cache by exe path to avoid re-extraction every refresh)
- [ ] `#[tauri::command] fn kill_process(pid: u32) -> Result<(), String>` via `sysinfo::Process::kill()`
- [ ] `#[tauri::command] fn open_url(url: String)` via `tauri-plugin-opener`
- [ ] `#[tauri::command] fn get_autostart() / set_autostart(enabled: bool)` via `tauri-plugin-autostart`

### Phase 3 — Tray + dual-mode window (`src-tauri/src/lib.rs`)
- [ ] `TrayIconBuilder` with custom icon, left-click opens menu-mode window
- [ ] Menu-mode window state: `decorations: false`, `resizable: false`, `skip_taskbar: true`, `transparent: true` (or opaque dark), size ~360x480, positioned at cursor
- [ ] On `blur` in menu mode → hide window
- [ ] Right-click tray menu: Show, Settings, Quit
- [ ] `#[tauri::command] fn pop_out()` — switch window to popped mode: enable decorations, resizable, show in taskbar, drop blur-to-hide handler
- [ ] `#[tauri::command] fn set_always_on_top(enabled: bool)` — only meaningful in popped mode
- [ ] Window mode tracked in Rust state (`Mutex<WindowMode>`), exposed to frontend via command

### Phase 4 — Svelte UI (`src/`)
- [ ] `App.svelte` — root, calls `list_ports` on mount + every 2s via `setInterval`
- [ ] `<Header>` — search + pop-out icon (always) + always-on-top icon (popped mode only)
- [ ] `<PortList>` — `$derived` grouped+filtered list
- [ ] `<PortRow>` — icon, port, name, browser button, kill button
- [ ] `<GroupHeader>` — when ≥2 ports share a process name
- [ ] `<KillMatchingButton>` — appears when filter active, confirms then kills all
- [ ] `<SettingsPanel>` — autostart toggle, refresh interval
- [ ] Minimal dark CSS, single `theme.css` file for easy later refinement

### Phase 5 — Polish
- [ ] App icon (port symbol, purple, multi-resolution `.ico`)
- [ ] Tray icon (monochrome 16x16/32x32)
- [ ] Loading state on first scan
- [ ] Toast/inline error on kill failure (permission denied for system processes)
- [ ] Keyboard: `Esc` hides window, `/` focuses search, `Enter` kills focused row

### Phase 6 — Build
- [ ] Configure `tauri.conf.json` bundle targets: `["msi", "nsis"]` for installer, separate portable build
- [ ] `pnpm tauri build` → verify both artifacts in `src-tauri/target/release/bundle/`
- [ ] Smoke test installer + portable on clean Windows path

## Verification gates
- `pnpm tauri dev` launches, tray icon appears, popover opens on click
- Popover lists ≥3 known ports (start `python -m http.server`, `node`, etc. to seed)
- Kill button terminates target process and row disappears on next refresh
- Browser button opens `http://localhost:{port}` in default browser
- Filter "node" hides non-node rows; "Kill matching" kills only filtered
- Autostart toggle persists across reboot
- `tauri build` produces MSI + portable, both run on a clean session

## Open questions for during implementation (will resolve, not block)
- Icon extraction performance — if `ExtractIconExW` is slow on first scan, cache aggressively or fall back to generic icon
- Listening-only vs all-TCP — original app appears to show only listeners; will mirror that
- IPv6 dedup — same process listening on `0.0.0.0:port` and `::1:port` should render once

## Out of scope
- UDP ports
- Remote connections (only `LISTEN` state)
- macOS/Linux builds (Windows-only per request)
- Telemetry, updates, signing
