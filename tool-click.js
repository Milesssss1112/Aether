// Add click handlers to tool cards
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.tool-card');
    if (!card) return;

    const toolId = card.dataset.toolId;
    if (toolId === "midjourney") {
      const hrefFn = window.AETHER_TOOL_PAGE_HREF || ((id) => "tool.html?id=" + encodeURIComponent(id));
      window.location.href = hrefFn("midjourney");
    }
  });
});
