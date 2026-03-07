// Mobile warning functionality
function checkMobileWarning() {
  const warning = document.getElementById("mobile-warning");
  if (!warning) {
    return;
  }

  if (window.innerWidth < 700) {
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
}

window.addEventListener("load", () => {
  const warning = document.getElementById("mobile-warning");
  if (warning && window.innerWidth < 700) {
    warning.classList.remove("hidden");
  }
});

const proceedButton = document.getElementById('proceed-btn');
if (proceedButton) {
  proceedButton.addEventListener('click', () => {
    window.location.href = 'main-page.html';
  });
}

const stayButton = document.getElementById('stay-btn');
if (stayButton) {
  stayButton.addEventListener('click', () => {
    const warning = document.getElementById('mobile-warning');
    if (warning) {
      warning.classList.add('hidden');
    }
  });
}

window.addEventListener("load", checkMobileWarning);
window.addEventListener("resize", checkMobileWarning);

// Date & Time functionality
function updateDateTime() {
  try {
    const now = new Date();
    const time = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const date = now.toLocaleDateString();
    document.getElementById("datetime").innerHTML = `
      <div>${time}</div>
      <div>${date}</div>
    `;
  } catch (e) {
    console.error("DateTime update failed:", e);
  }
}

setInterval(updateDateTime, 1000);
updateDateTime();