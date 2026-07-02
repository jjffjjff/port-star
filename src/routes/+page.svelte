<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import type { PortEntry, WindowMode } from "$lib/types.js";
  import Header from "$lib/components/Header.svelte";
  import PortRow from "$lib/components/PortRow.svelte";
  import GroupHeader from "$lib/components/GroupHeader.svelte";
  import KillMatchingButton from "$lib/components/KillMatchingButton.svelte";
  import SettingsPanel from "$lib/components/SettingsPanel.svelte";
  import Icon from "$lib/components/Icon.svelte";

  // State
  let ports = $state<PortEntry[] | null>(null);
  let mode = $state<WindowMode>("menu");
  let search = $state("");
  let alwaysOnTop = $state(false);
  let showSettings = $state(false);
  let isElevated = $state(false);
  let killError = $state<string | null>(null);
  let killSuccess = $state<string | null>(null);

  let hasElevatedProcesses = $derived(ports?.some((e) => e.needs_elevation) ?? false);
  let hoveringElevationBanner = $state(false);
  let hoveringElevatedRow = $state(false);
  let searchEl = $state<HTMLInputElement | undefined>(undefined);

  // Filtered list
  let filtered = $derived.by((): PortEntry[] => {
    if (!ports) return [];
    const q = search.trim().toLowerCase();
    if (!q) return ports;
    return ports.filter(
      (e) =>
        e.process_name.toLowerCase().includes(q) ||
        `:${e.port}`.includes(q)
    );
  });

  // Grouped: Map<process_name, entries[]>
  let groups = $derived.by((): Map<string, PortEntry[]> => {
    const map = new Map<string, PortEntry[]>();
    for (const e of filtered) {
      const list = map.get(e.process_name);
      if (list) list.push(e);
      else map.set(e.process_name, [e]);
    }
    return map;
  });

  // Render items: interleave GroupHeaders for multi-port processes
  type RenderItem =
    | { kind: "header"; name: string; count: number }
    | { kind: "row"; entry: PortEntry };

  let renderItems = $derived.by((): RenderItem[] => {
    const items: RenderItem[] = [];
    for (const [name, entries] of groups) {
      if (entries.length >= 2) {
        items.push({ kind: "header", name, count: entries.length });
      }
      for (const e of entries) {
        items.push({ kind: "row", entry: e });
      }
    }
    return items;
  });

  // Data loading
  async function loadPorts() {
    try {
      const result = await invoke<PortEntry[]>("list_ports");
      ports = result;
    } catch (err) {
      console.error("list_ports failed:", err);
      if (ports === null) ports = [];
    }
  }

  // Kill a process
  async function handleKill(pid: number) {
    killError = null;
    killSuccess = null;
    try {
      await invoke("kill_process", { pid });
      await loadPorts();
      killSuccess = "Process killed";
      setTimeout(() => { killSuccess = null; }, 2000);
    } catch (err) {
      const msg = String(err);
      if (msg === "elevation_cancelled") {
        // do nothing — user dismissed the relaunch prompt
      } else if (msg === "needs_elevation") {
        // banner already visible via hasElevatedProcesses
      } else {
        killError = msg;
        setTimeout(() => { killError = null; }, 3000);
      }
      setTimeout(() => { killError = null; }, 3000);
    }
  }

  // Open in browser
  async function handleOpen(port: number) {
    try {
      await invoke("open_url", { url: `http://localhost:${port}` });
    } catch (err) {
      console.error("open_url failed:", err);
    }
  }

  // Kill all matching
  async function handleKillMatching() {
    const targets = filtered.map((e) => e.pid);
    let killed = 0;
    for (const pid of targets) {
      try {
        await invoke("kill_process", { pid });
        killed++;
      } catch {
        // continue
      }
    }
    await loadPorts();
    if (killed > 0) {
      killSuccess = `${killed} process${killed === 1 ? "" : "es"} killed`;
      setTimeout(() => { killSuccess = null; }, 2000);
    }
  }

  // Relaunch as admin (one UAC prompt, then all kills work for the session)
  async function handleRelaunchAsAdmin() {
    try {
      await invoke("relaunch_as_admin");
    } catch (err) {
      const msg = String(err);
      if (msg !== "elevation_cancelled") {
        killError = msg;
        setTimeout(() => { killError = null; }, 3000);
      }
    }
  }

  // Pop out
  async function handlePopOut() {
    try {
      await invoke("pop_out");
      mode = "popped";
    } catch (err) {
      console.error("pop_out failed:", err);
    }
  }

  // Always on top toggle
  async function handleToggleAOT() {
    const next = !alwaysOnTop;
    alwaysOnTop = next;
    try {
      await invoke("set_always_on_top", { enabled: next });
    } catch {
      alwaysOnTop = !next;
    }
  }

  // Init + polling
  $effect(() => {
    invoke<WindowMode>("get_window_mode")
      .then((m) => { mode = m; })
      .catch(() => {});
    invoke<boolean>("is_elevated")
      .then((v) => { isElevated = v; })
      .catch(() => {});
    loadPorts();

    const id = setInterval(loadPorts, 2000);
    return () => clearInterval(id);
  });

  // On focus: sync mode from backend (handles close-while-popped) + clear list focus on blur
  $effect(() => {
    function onFocus() {
      invoke<WindowMode>("get_window_mode")
        .then((m) => { mode = m; })
        .catch(() => {});
    }
    function onBlur() {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.classList.contains("port-row") || active.closest(".port-row"))) {
        active.blur();
      }
    }
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });

  // Keyboard shortcuts
  $effect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showSettings) {
          showSettings = false;
        } else if (mode === "menu") {
          (document.activeElement as HTMLElement | null)?.blur();
          getCurrentWindow().hide().catch(() => {});
        }
        return;
      }

      if (e.key === "/" && document.activeElement !== searchEl) {
        e.preventDefault();
        searchEl?.focus();
        return;
      }

      if (e.key.startsWith("Arrow")) {
        const rows = Array.from(document.querySelectorAll<HTMLElement>(".port-row"));
        if (!rows.length) return;

        const active = document.activeElement as HTMLElement | null;
        const activeRow = active?.classList.contains("port-row")
          ? active
          : active?.closest<HTMLElement>(".port-row") ?? null;
        const inList = activeRow != null;

        e.preventDefault();

        if (!inList) {
          if (e.key === "ArrowDown") rows[0]?.focus();
          if (e.key === "ArrowUp") rows[rows.length - 1]?.focus();
          return;
        }

        const rowIndex = rows.indexOf(activeRow!);

        if (e.key === "ArrowDown") {
          rows[Math.min(rowIndex + 1, rows.length - 1)]?.focus();
          return;
        }
        if (e.key === "ArrowUp") {
          rows[Math.max(rowIndex - 1, 0)]?.focus();
          return;
        }
        if (e.key === "ArrowRight") {
          if (active === activeRow) {
            activeRow.querySelector<HTMLElement>("button")?.focus();
          } else {
            const btns = Array.from(activeRow!.querySelectorAll<HTMLElement>("button"));
            const i = btns.indexOf(active!);
            btns[Math.min(i + 1, btns.length - 1)]?.focus();
          }
          return;
        }
        if (e.key === "ArrowLeft") {
          if (active !== activeRow) {
            const btns = Array.from(activeRow!.querySelectorAll<HTMLElement>("button"));
            const i = btns.indexOf(active!);
            if (i === 0) activeRow!.focus();
            else btns[i - 1]?.focus();
          }
          return;
        }
      }

      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement !== searchEl
      ) {
        searchEl?.focus();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });
</script>

<div class="app" class:elevation-hint={hoveringElevationBanner}>
  <Header
    bind:search
    {mode}
    bind:alwaysOnTop
    onPopOut={handlePopOut}
    onToggleAOT={handleToggleAOT}
    onOpenSettings={() => {
      showSettings = !showSettings;
    }}
    bind:searchEl
  />

  {#if showSettings}
    <SettingsPanel
      {isElevated}
      onClose={() => {
        showSettings = false;
      }}
    />
  {/if}

  {#if search.trim() && filtered.length > 0}
    <KillMatchingButton count={filtered.length} onConfirm={handleKillMatching} />
  {/if}

  {#if killError}
    <div class="error-bar"><Icon name="x-circle" size={15} /><span>{killError}</span></div>
  {/if}

  {#if killSuccess}
    <div class="success-bar"><Icon name="check-circle" size={15} /><span>{killSuccess}</span></div>
  {/if}

  {#if hasElevatedProcesses}
    <button
      class="mini-shield-btn"
      class:hinted={hoveringElevatedRow}
      onclick={handleRelaunchAsAdmin}
      onmouseenter={() => (hoveringElevationBanner = true)}
      onmouseleave={() => (hoveringElevationBanner = false)}
      title="Some processes need admin — relaunch as admin"
    >
      <Icon name="shield-warning" size={14} />
      <span>Relaunch as admin to kill protected ports</span>
    </button>
  {/if}

  <div class="list">
    {#if ports === null}
      <div class="loading">Scanning ports…</div>
    {:else if filtered.length === 0}
      <div class="empty">
        <span class="empty-title">{search ? "No matches" : "No listening ports found"}</span>
        <span class="empty-sub">{search ? "nothing here by that name" : "nothing bound right now"}</span>
      </div>
    {:else}
      {#each renderItems as item}
        {#if item.kind === "header"}
          <GroupHeader name={item.name} count={item.count} />
        {:else if item.kind === "row"}
          <PortRow
            entry={item.entry}
            {isElevated}
            onKill={handleKill}
            onOpen={handleOpen}
            onElevatedHover={() => (hoveringElevatedRow = true)}
            onElevatedLeave={() => (hoveringElevatedRow = false)}
          />
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
  }

  .list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .list::-webkit-scrollbar {
    width: 4px;
  }

  .list::-webkit-scrollbar-track {
    background: transparent;
  }

  .list::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 2px;
  }

  .loading,
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 120px;
    color: var(--fg-muted);
    font-size: 13px;
  }

  .empty-sub {
    font-family: var(--font-editorial);
    font-style: italic;
    font-size: 14px;
    opacity: 0.7;
  }

  .error-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--danger) 14%, var(--bg));
    color: var(--danger);
    font-size: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  }

  .success-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--success) 13%, var(--bg));
    color: var(--success);
    font-size: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
  }

  .mini-shield-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    height: 28px;
    font-size: 11.5px;
    color: var(--warning);
    opacity: 0.7;
    border-bottom: 1px solid color-mix(in srgb, var(--warning) 18%, transparent);
    background: color-mix(in srgb, var(--warning) 7%, var(--bg));
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
  }

  .mini-shield-btn:hover,
  .mini-shield-btn.hinted {
    opacity: 0.9;
    background: color-mix(in srgb, var(--warning) 12%, var(--bg));
  }

  .mini-shield-btn:hover {
    opacity: 1;
  }
</style>
