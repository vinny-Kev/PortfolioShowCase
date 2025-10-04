// Toggle the project side panel with typing animation
function togglePanel() {
  const panel = document.getElementById("project-panel");
  const wrapper = document.getElementById("page-wrapper");

  if (panel.style.width === "250px") {
    panel.style.width = "0";
    wrapper.style.marginLeft = "0";
    // Reset text instantly when closed
    document.querySelectorAll("#project-panel a").forEach(a => {
      a.textContent = a.getAttribute("data-label");
    });
  } else {
    panel.style.width = "250px";
    wrapper.style.marginLeft = "250px";

    // Typing effect for each project link
    const links = document.querySelectorAll("#project-panel a");
    links.forEach((a, i) => {
      const fullText = a.getAttribute("data-label") || a.textContent;
      a.setAttribute("data-label", fullText); // store original
      a.textContent = ""; // clear text

      setTimeout(() => {
        let idx = 0;
        function typeChar() {
          if (idx < fullText.length) {
            a.textContent += fullText.charAt(idx);
            idx++;
            setTimeout(typeChar, 40); // typing speed
          }
        }
        typeChar();
      }, i * 200); // stagger delay per link
    });
  }
}

// Attach to window for global access
window.togglePanel = togglePanel;
