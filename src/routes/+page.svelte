<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import type { PortEntry, WindowMode } from "$lib/types.js";
  import Header from "$lib/components/Header.svelte";
  import PortRow from "$lib/components/PortRow.svelte";
  import GroupHeader from "$lib/components/GroupHeader.svelte";
  import KillMatchingButton from "$lib/components/KillMatchingButton.svelte";
  import SettingsPanel from "$lib/components/SettingsPanel.svelte";

  // State
  let ports = $state<PortEntry[] | null>(null);
  let mode = $state<WindowMode>("menu");
  let search = $state("");
  let alwaysOnTop = $state(false);
  let showSettings = $state(false);
  let killError = $state<string | null>(null);
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
    try {
      await invoke("kill_process", { pid });
      await loadPorts();
    } catch (err) {
      killError = String(err);
      setTimeout(() => {
        killError = null;
      }, 3000);
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
    for (const pid of targets) {
      try {
        await invoke("kill_process", { pid });
      } catch {
        // continue
      }
    }
    await loadPorts();
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
      .then((m) => {
        mode = m;
      })
      .catch(() => {});
    loadPorts();

    const id = setInterval(loadPorts, 2000);
    return () => clearInterval(id);
  });

  // Keyboard shortcuts
  $effect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showSettings) {
          showSettings = false;
        } else if (mode === "menu") {
          getCurrentWindow().hide().catch(() => {});
        }
        return;
      }
      if (e.key === "/" && document.activeElement !== searchEl) {
        e.preventDefault();
        searchEl?.focus();
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });
</script>

<div class="app">
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
      onClose={() => {
        showSettings = false;
      }}
    />
  {/if}

  {#if search.trim() && filtered.length > 0}
    <KillMatchingButton count={filtered.length} onConfirm={handleKillMatching} />
  {/if}

  {#if killError}
    <div class="error-bar">{killError}</div>
  {/if}

  <div class="list">
    {#if ports === null}
      <div class="loading">Scanning ports…</div>
    {:else if filtered.length === 0}
      <div class="empty">
        {search ? "No matches" : "No listening ports found"}
      </div>
    {:else}
      {#each renderItems as item}
        {#if item.kind === "header"}
          <GroupHeader name={item.name} count={item.count} />
        {:else if item.kind === "row"}
          <PortRow entry={item.entry} onKill={handleKill} onOpen={handleOpen} />
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
    align-items: center;
    justify-content: center;
    height: 80px;
    color: var(--fg-muted);
    font-size: 13px;
  }

  .error-bar {
    padding: 6px 10px;
    background: color-mix(in srgb, var(--danger) 15%, var(--bg));
    color: var(--danger);
    font-size: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  }
</style>
