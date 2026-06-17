<script lang="ts">
  let {
    count,
    onConfirm,
  }: {
    count: number;
    onConfirm: () => void;
  } = $props();

  function handleClick() {
    if (window.confirm(`Kill ${count} matching process${count === 1 ? "" : "es"}?`)) {
      onConfirm();
    }
  }
</script>

{#if count > 0}
  <div class="kill-bar">
    <button class="kill-all" onclick={handleClick}>
      Kill {count} matching
    </button>
  </div>
{/if}

<style>
  .kill-bar {
    padding: 5px 8px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--danger) 8%, var(--bg));
  }

  .kill-all {
    width: 100%;
    height: 26px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--danger);
    border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
    background: color-mix(in srgb, var(--danger) 10%, transparent);
    cursor: pointer;
  }

  .kill-all:hover {
    background: color-mix(in srgb, var(--danger) 20%, transparent);
    color: var(--fg);
  }
</style>
