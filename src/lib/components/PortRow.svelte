<script lang="ts">
  import type { PortEntry } from "$lib/types.js";

  let {
    entry,
    isElevated,
    onKill,
    onOpen,
    onElevatedHover = () => {},
    onElevatedLeave = () => {},
  }: {
    entry: PortEntry;
    isElevated: boolean;
    onKill: (pid: number) => void;
    onOpen: (port: number) => void;
    onElevatedHover?: () => void;
    onElevatedLeave?: () => void;
  } = $props();

  let killBlocked = $derived(entry.needs_elevation && !isElevated);
</script>

<div
  class="row port-row"
  tabindex="0"
  role="button"
  onmouseenter={() => { if (entry.needs_elevation) onElevatedHover(); }}
  onmouseleave={() => { if (entry.needs_elevation) onElevatedLeave(); }}
  onkeydown={(e) => {
    if (e.key === "Enter" && !killBlocked) {
      e.preventDefault();
      onKill(entry.pid);
    }
  }}
>
  <div class="icon">
    {#if entry.icon_b64}
      <img src="data:image/png;base64,{entry.icon_b64}" alt="" width="16" height="16" />
    {:else}
      <span class="icon-fallback">⬡</span>
    {/if}
  </div>
  <span class="port">:{entry.port}</span>
  <span class="name" title={entry.exe_path ?? entry.process_name}>{entry.process_name}</span>
  {#if entry.needs_elevation}
    <span class="shield" title="Needs admin to kill">🛡</span>
  {/if}
  <div class="btns">
    <button
      class="btn-open"
      onclick={() => onOpen(entry.port)}
      title="Open in browser"
      aria-label="Open port {entry.port} in browser"
    >
      🌐
    </button>
    <button
      class="btn-kill"
      onclick={() => onKill(entry.pid)}
      disabled={killBlocked}
      title={killBlocked ? "Needs admin — relaunch as admin to kill" : "Kill process"}
      aria-label="Kill {entry.process_name}"
    >
      ✕
    </button>
  </div>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    height: var(--row-height);
    padding: 0 8px;
    gap: 8px;
    border-bottom: 1px solid var(--border);
  }

  .row:hover,
  .row:focus {
    background: var(--bg-elevated);
  }

  .row:focus {
    outline: 1px solid var(--accent);
    outline-offset: -1px;
  }

  .row:focus .btns,
  .row:focus-within .btns {
    opacity: 1;
  }

  .icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-fallback {
    font-size: 12px;
    color: var(--fg-muted);
  }

  .port {
    font-size: 12px;
    font-family: "Cascadia Code", "Consolas", monospace;
    color: var(--accent);
    flex-shrink: 0;
    min-width: 52px;
  }

  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--fg);
  }

  .shield {
    font-size: 11px;
    opacity: 0;
    flex-shrink: 0;
    transition: opacity 0.1s;
  }

  .row:hover .shield,
  .row:focus .shield,
  .row:focus-within .shield {
    opacity: 0.5;
  }

  :global(.elevation-hint) .shield {
    opacity: 0.5;
  }

  .btns {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .row:hover .btns {
    opacity: 1;
  }

  button {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    font-size: 12px;
  }

  button:hover {
    background: var(--bg-elevated);
  }

  .btn-kill:hover {
    color: var(--danger);
    background: color-mix(in srgb, var(--danger) 15%, transparent);
  }

  .btn-kill:disabled {
    opacity: 0.25;
  }

  .btn-kill:disabled:hover {
    color: inherit;
    background: transparent;
  }
</style>
