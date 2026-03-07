// Toggle the project side panel with a clean open/close behavior
function togglePanel() {
  const panel = document.getElementById("project-panel");
  const wrapper = document.getElementById("page-wrapper");
  if (!panel || !wrapper) {
    return;
  }

  if (panel.style.width === "250px") {
    panel.style.width = "0";
    panel.classList.remove('open');
    wrapper.style.marginLeft = "0";
  } else {
    panel.style.width = "250px";
    panel.classList.add('open');
    wrapper.style.marginLeft = "250px";
  }
}

// Attach to window for global access
window.togglePanel = togglePanel;
