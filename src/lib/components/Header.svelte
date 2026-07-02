<script lang="ts">
  import type { WindowMode } from "$lib/types.js";
  import Icon from "$lib/components/Icon.svelte";

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
  <div class="search-wrap">
    <span class="search-icon"><Icon name="magnifying-glass" size={15} /></span>
    <input
      bind:this={searchEl}
      type="search"
      placeholder="Filter by name or :port"
      bind:value={search}
      autocomplete="off"
      spellcheck="false"
    />
  </div>
  <div class="actions">
    {#if mode === "popped"}
      <button
        class:active={alwaysOnTop}
        onclick={onToggleAOT}
        title={alwaysOnTop ? "Disable always on top" : "Always on top"}
        aria-label="Toggle always on top"
      >
        <Icon name="push-pin" size={16} />
      </button>
    {/if}
    {#if mode !== "popped"}
      <button onclick={onPopOut} title="Pop out" aria-label="Pop out window">
        <Icon name="arrows-out-simple" size={16} />
      </button>
    {/if}
    <button onclick={onOpenSettings} title="Settings" aria-label="Open settings">
      <Icon name="gear" size={16} />
    </button>
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px;
    border-bottom: 1px solid var(--border);
  }

  .search-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    display: flex;
    color: var(--fg-muted);
    pointer-events: none;
  }

  input[type="search"] {
    flex: 1;
    width: 100%;
    padding: 0 10px 0 31px;
    height: 30px;
  }

  .actions {
    display: flex;
    gap: 2px;
  }

  button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-input);
    color: var(--fg-muted);
  }

  button:hover {
    background: var(--bg-elevated);
    color: var(--fg);
  }

  /* oj-look active indicator — strategic accent */
  button.active {
    color: var(--accent-bright);
    border: 1px solid var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
</style>
