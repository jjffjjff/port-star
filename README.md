# port-star

Windows system-tray utility that lists every listening TCP port with its process name, icon, and a kill button.

## What it does

- Click the tray icon: compact frameless popover lists all active listeners
- Each row: app icon, port number, process name, open-in-browser button, kill button
- Search bar filters by name or `:port`
- Kill matching: kills every row surviving the current filter
- Pop out: converts the popover to a normal resizable window with taskbar entry
- Shield badge on rows that need elevation to kill
- Settings: launch at startup toggle, quit

## Stack

Tauri 2 (Rust) + Svelte 5 + TypeScript. Windows only.

## Dev

```
pnpm install
pnpm tauri dev
```

## Build

```
pnpm tauri build
```

Outputs in `src-tauri/target/release/bundle/`:
- `msi/port-star_0.1.0_x64_en-US.msi`
- `nsis/port-star_0.1.0_x64-setup.exe`
