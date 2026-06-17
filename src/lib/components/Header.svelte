<script lang="ts">
  import type { WindowMode } from "$lib/types.js";

  let {
    search = $bindable(""),
    mode,
    alwaysOnTop = $bindable(false),
    onPopOut,
    onToggleAOT,
    onOpenSettings,
    searchEl = $bindable<HTMLInputElement | undefined>(undefined),
  }: {
    search: string;
    mode: WindowMode;
    alwaysOnTop: boolean;
    onPopOut: () => void;
    onToggleAOT: () => void;
    onOpenSettings: () => void;
    searchEl?: HTMLInputElement | undefined;
  } = $props();
</script>

<header>
  <input
    bind:this={searchEl}
    type="search"
    placeholder="Filter by name or :port"
    bind:value={search}
    autocomplete="off"
    spellcheck="false"
  />
  <div class="actions">
    {#if mode === "popped"}
      <button
        class:active={alwaysOnTop}
        onclick={onToggleAOT}
        title={alwaysOnTop ? "Disable always on top" : "Always on top"}
        aria-label="Toggle always on top"
      >
        ⬆
      </button>
    {/if}
    <button onclick={onPopOut} title="Pop out" aria-label="Pop out window">
      ⧉
    </button>
    <button onclick={onOpenSettings} title="Settings" aria-label="Open settings">
      ⚙
    </button>
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 8px 6px;
    border-bottom: 1px solid var(--border);
  }

  input[type="search"] {
    flex: 1;
    padding: 5px 8px;
    border-radius: 4px;
    height: 28px;
  }

  .actions {
    display: flex;
    gap: 2px;
  }

  button {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 14px;
  }

  button:hover {
    background: var(--bg-elevated);
  }

  button.active {
    color: var(--accent);
  }
</style>
