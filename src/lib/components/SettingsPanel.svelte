<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

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

  <div class="setting-row" class:muted={!isElevated}>
    <label for="autostart-elevated-toggle">Start elevated</label>
    {#if loading}
      <span class="loading">…</span>
    {:else}
      <div class="toggle-wrap" title={!isElevated ? "Relaunch as admin to enable" : undefined}>
        {#if !isElevated}<span class="lock">🔒</span>{/if}
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
    <label>Quit PortStar</label>
    <button class="quit-btn" onclick={() => invoke("quit_app")}>Quit</button>
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

  .toggle:disabled {
    opacity: 0.35;
  }

  .toggle-wrap {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .lock {
    font-size: 10px;
    opacity: 0.5;
  }

  .muted label {
    opacity: 0.45;
  }

  .toggle.on {
    color: var(--accent);
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, var(--bg));
  }

  .quit-btn {
    font-size: 11px;
    font-weight: 600;
    color: var(--danger);
    padding: 2px 10px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent);
    background: transparent;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.15s;
  }

  .quit-btn:hover {
    background: color-mix(in srgb, var(--danger) 12%, var(--bg));
    border-color: var(--danger);
  }
</style>
