<script lang="ts">
  let { name, count }: { name: string; count: number } = $props();
</script>

<div class="group-header">
  <span class="group-name">{name}</span>
  <span class="group-count">({count})</span>
</div>

<style>
  .group-header {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px 2px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }

  .group-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .group-count {
    font-size: 11px;
    color: var(--fg-muted);
    opacity: 0.7;
  }
</style>
