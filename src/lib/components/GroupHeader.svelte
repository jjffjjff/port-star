<script lang="ts">
  let { name, count }: { name: string; count: number } = $props();
</script>

<div class="group-header">
  <span class="group-name">{name}</span>
  <span class="group-count">{count}</span>
</div>

<style>
  .group-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px 3px;
    background: var(--bg);
  }

  .group-name {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 500;
    color: var(--fg-muted);
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  .group-count {
    font-family: var(--font-mono);
    font-size: 10.5px;
    color: var(--fg-muted);
    opacity: 0.6;
  }
</style>
