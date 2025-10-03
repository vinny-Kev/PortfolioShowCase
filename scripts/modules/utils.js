// Mobile warning functionality
function checkMobileWarning() {
  const warning = document.getElementById("mobile-warning");
  if (window.innerWidth < 700) {
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
}

window.addEventListener("load", () => {
  if (window.innerWidth < 700) {
    document.getElementById("mobile-warning").classList.remove("hidden");
  }
});

document.getElementById("proceed-btn").addEventListener("click", () => {
  window.location.href = "main-page.html";
});

document.getElementById("stay-btn").addEventListener("click", () => {
  document.getElementById("mobile-warning").classList.add("hidden");
});

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