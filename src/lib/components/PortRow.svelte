<script lang="ts">
  import type { PortEntry } from "$lib/types.js";

  let {
    entry,
    onKill,
    onOpen,
  }: {
    entry: PortEntry;
    onKill: (pid: number) => void;
    onOpen: (port: number) => void;
  } = $props();
</script>

<div class="row">
  <div class="icon">
    {#if entry.icon_b64}
      <img src="data:image/png;base64,{entry.icon_b64}" alt="" width="16" height="16" />
    {:else}
      <span class="icon-fallback">⬡</span>
    {/if}
  </div>
  <span class="port">:{entry.port}</span>
  <span class="name" title={entry.exe_path ?? entry.process_name}>{entry.process_name}</span>
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
      title="Kill process"
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

  .row:hover {
    background: var(--bg-elevated);
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
</style>
