<script lang="ts">
  import type { PortEntry } from "$lib/types.js";
  import Icon from "$lib/components/Icon.svelte";

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
      <img src="data:image/png;base64,{entry.icon_b64}" alt="" width="18" height="18" />
    {:else}
      <span class="icon-fallback"><Icon name="hexagon" size={17} /></span>
    {/if}
  </div>
  <span class="port">:{entry.port}</span>
  <span class="name" title={entry.exe_path ?? entry.process_name}>{entry.process_name}</span>
  {#if entry.needs_elevation}
    <span class="shield" title="Needs admin to kill"><Icon name="shield-warning" size={15} /></span>
  {/if}
  <div class="btns">
    <button
      class="btn-open"
      onclick={() => onOpen(entry.port)}
      title="Open in browser"
      aria-label="Open port {entry.port} in browser"
    >
      <Icon name="arrow-square-out" size={15} />
    </button>
    <button
      class="btn-kill"
      onclick={() => onKill(entry.pid)}
      disabled={killBlocked}
      title={killBlocked ? "Needs admin — relaunch as admin to kill" : "Kill process"}
      aria-label="Kill {entry.process_name}"
    >
      <Icon name="x" size={14} />
    </button>
  </div>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    height: var(--row-height);
    padding: 0 12px;
    gap: 11px;
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
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--fg-muted);
  }

  .icon-fallback {
    display: flex;
    color: var(--fg-muted);
  }

  .port {
    font-size: 12.5px;
    font-family: var(--font-mono);
    color: var(--accent-bright);
    flex-shrink: 0;
    min-width: 56px;
  }

  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--fg);
  }

  .shield {
    display: flex;
    color: var(--warning);
    opacity: 0;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }

  .row:hover .shield,
  .row:focus .shield,
  .row:focus-within .shield {
    opacity: 0.7;
  }

  :global(.elevation-hint) .shield {
    opacity: 0.7;
  }

  .btns {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .row:hover .btns {
    opacity: 1;
  }

  button {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-input);
    color: var(--fg-muted);
  }

  button:hover {
    background: var(--bg);
    color: var(--fg);
  }

  .btn-kill:hover {
    color: var(--danger);
    background: color-mix(in srgb, var(--danger) 16%, transparent);
  }

  .btn-kill:disabled {
    opacity: 0.3;
  }

  .btn-kill:disabled:hover {
    color: inherit;
    background: transparent;
  }
</style>
