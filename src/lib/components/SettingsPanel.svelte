<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  let { onClose }: { onClose: () => void } = $props();

  let autostart = $state(false);
  let loading = $state(true);

  $effect(() => {
    invoke<boolean>("get_autostart")
      .then((val) => {
        autostart = val;
        loading = false;
      })
      .catch(() => {
        loading = false;
      });
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
</script>

<div class="settings">
  <div class="settings-header">
    <span class="title">Settings</span>
    <button class="close-btn" onclick={onClose} aria-label="Close settings">✕</button>
  </div>

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
</div>

<style>
  .settings {
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 8px 6px;
    border-bottom: 1px solid var(--border);
  }

  .title {
    font-size: 12px;
    font-weight: 600;
    color: var(--fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .close-btn {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    font-size: 11px;
  }

  .close-btn:hover {
    background: var(--border);
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
    font-size: 11px;
    font-weight: 700;
    color: var(--fg-muted);
    padding: 2px 8px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.15s;
  }

  .toggle:hover {
    border-color: var(--fg-muted);
    color: var(--fg);
  }

  .toggle.on {
    color: var(--accent);
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, var(--bg));
  }
</style>
