<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";

  let {
    count,
    onConfirm,
  }: {
    count: number;
    onConfirm: () => void;
  } = $props();

  function handleClick() {
    if (window.confirm(`Close ${count} matching process${count === 1 ? "" : "es"}?`)) {
      onConfirm();
    }
  }
</script>

{#if count > 0}
  <div class="kill-bar">
    <button class="kill-all" onclick={handleClick}>
      <Icon name="x-circle" size={14} />
      Close {count} matching
    </button>
  </div>
{/if}

<style>
  .kill-bar {
    padding: 8px 10px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--danger) 7%, var(--bg));
  }

  .kill-all {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    width: 100%;
    height: 30px;
    border-radius: var(--radius-button);
    font-size: 12px;
    font-weight: 500;
    color: var(--danger);
    border: 1px solid color-mix(in srgb, var(--danger) 32%, transparent);
    background: color-mix(in srgb, var(--danger) 10%, transparent);
    cursor: pointer;
  }

  .kill-all:hover {
    background: color-mix(in srgb, var(--danger) 20%, transparent);
    color: var(--fg);
  }
</style>
