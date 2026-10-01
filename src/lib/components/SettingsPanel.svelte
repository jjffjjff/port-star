<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { slide } from "svelte/transition";
  import Icon from "$lib/components/Icon.svelte";

  let { onClose, isElevated }: { onClose: () => void; isElevated: boolean } = $props();

  let autostart = $state(false);
  let autostartElevated = $state(false);
  let loading = $state(true);

  $effect(() => {
    Promise.all([
      invoke<boolean>("get_autostart"),
      invoke<boolean>("get_autostart_elevated"),
    ])
      .then(([a, e]) => {
        autostart = a;
        autostartElevated = e;
        loading = false;
      })
      .catch(() => { loading = false; });
  });

  async function toggleAutostart() {
    const next = !autostart;
    autostart = next;
    try {
      await invoke("set_autostart", { enabled: next });
    } catch {
      autostart = !next;
    }
  }

  async function toggleAutostartElevated() {
    const next = !autostartElevated;
    autostartElevated = next;
    try {
      await invoke("set_autostart_elevated", { enabled: next });
    } catch {
      autostartElevated = !next;
    }
  }
</script>

<div class="settings" transition:slide={{ duration: 180, axis: 'y' }}>
  <div class="setting-row">
    <label for="autostart-toggle">Launch at startup</label>
    {#if loading}
      <span class="loading">…</span>
    {:else}
      <button
        id="autostart-toggle"
        class="toggle"
        class:on={autostart}
        onclick={toggleAutostart}
        role="switch"
        aria-checked={autostart}
      >
        {autostart ? "ON" : "OFF"}
      </button>
    {/if}
  </div>

  <div class="setting-row" class:muted={!isElevated}>
    <label for="autostart-elevated-toggle">Start elevated</label>
    {#if loading}
      <span class="loading">…</span>
    {:else}
      <div class="toggle-wrap" title={!isElevated ? "Relaunch as admin to enable" : undefined}>
        {#if !isElevated}<span class="lock"><Icon name="lock-simple" size={12} /></span>{/if}
        <button
          id="autostart-elevated-toggle"
          class="toggle"
          class:on={autostartElevated}
          onclick={toggleAutostartElevated}
          disabled={!isElevated}
          role="switch"
          aria-checked={autostartElevated}
        >
          {autostartElevated ? "ON" : "OFF"}
        </button>
      </div>
    {/if}
  </div>

  <div class="setting-row">
    <label>Quit</label>
    <button class="quit-btn" onclick={() => invoke("quit_app")}>Quit</button>
  </div>
</div>

<style>
  .settings {
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    height: var(--row-height);
  }

  label {
    font-size: 13px;
    color: var(--fg);
    cursor: default;
  }

  .loading {
    color: var(--fg-muted);
    font-size: 13px;
  }

  .toggle {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 500;
    color: var(--fg-muted);
    padding: 3px 9px;
    border-radius: var(--radius-input);
    border: 1px solid var(--border);
    background: var(--bg);
    cursor: pointer;
    letter-spacing: 0.08em;
    transition: all 0.15s;
  }

  .toggle:hover {
    border-color: var(--fg-muted);
    color: var(--fg);
  }

  .toggle:disabled {
    opacity: 0.35;
  }

  .toggle-wrap {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .lock {
    display: flex;
    color: var(--fg-muted);
    opacity: 0.6;
  }

  .muted label {
    opacity: 0.45;
  }

  .toggle.on {
    color: var(--accent-bright);
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 16%, var(--bg));
  }

  .quit-btn {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 500;
    color: var(--danger);
    padding: 3px 11px;
    border-radius: var(--radius-button);
    letter-spacing: 0.06em;
    border: 1px solid color-mix(in srgb, var(--danger) 45%, transparent);
    background: transparent;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.15s;
  }

  .quit-btn:hover {
    background: color-mix(in srgb, var(--danger) 14%, var(--bg));
    border-color: var(--danger);
  }

  /* the extra letter-spacing on .quit-btn was doubled by the mono role; keep terse */
</style>
