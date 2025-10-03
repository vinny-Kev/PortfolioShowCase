// Terminal functionality
const terminalApp = document.getElementById("terminal-app");
const terminalIcon = document.getElementById("terminal-icon");
const minimizeBtn = document.querySelector(".min-btn");
const closeBtn = document.querySelector(".close-btn");
const cliOutput = document.getElementById("cli-output");
const modal = document.querySelector(".modal");
let history = [];
let historyIndex = -1;
let inputActive = false;
let currentCommand = "";

// Terminal functions
function printLine(text = "") {
  cliOutput.innerHTML += text + "\n";
  cliOutput.scrollTop = cliOutput.scrollHeight;
}

function newPrompt(defaultText = "") {
  cliOutput.innerHTML += `<span class="prompt">kevinOS$ </span><span id="active-input" class="active-input" contenteditable="true">${defaultText}</span>`;
  focusPrompt();
  inputActive = true;
}

function focusPrompt() {
  const activeInput = document.getElementById("active-input");
  if (activeInput) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(activeInput);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    activeInput.focus();
  }
}

function boot() {
  cliOutput.innerHTML = "";
  printLine("Welcome to KevinOS!");
  typeLine("kevinOS$ kevin --help", () => {
    setTimeout(() => {
      printLine("Available commands:");
      printLine("  kevin --about    → Go to portfolio");
      printLine("  kevin --help     → Show this help menu");
      setTimeout(() => newPrompt("kevin --about"), 400);
    }, 400);
  });
}

function resetTerminal() {
  history = [];
  historyIndex = -1;
  inputActive = false;
  cliOutput.innerHTML = "";
  boot();
}

function typeLine(line, callback) {
  let i = 0;
  function typing() {
    if (i < line.length) {
      cliOutput.innerHTML += line[i];
      i++;
      setTimeout(typing, 40);
    } else {
      cliOutput.innerHTML += "\n";
      if (callback) callback();
    }
  }
  typing();
}

// Event Listeners
terminalIcon.addEventListener("click", () => {
  terminalApp.classList.remove("hidden");
  terminalApp.style.zIndex = 20;
  focusPrompt();
});

minimizeBtn.addEventListener("click", () => {
  terminalApp.classList.add("hidden");
});

closeBtn.addEventListener("click", () => {
  resetTerminal();
  terminalApp.classList.add("hidden");
});

document.querySelector(".btn-confirm").addEventListener("click", () => {
  document.body.classList.add("fade-out");
  setTimeout(() => (window.location.href = "main-page.html"), 600);
});

document.querySelector(".btn-cancel").addEventListener("click", () => {
  modal.classList.add("hidden");
  printLine("Command cancelled. Type \"kevin --about\" again.");
  newPrompt();
});

// Terminal dragging functionality
let offsetX, offsetY, isDragging = false;
const header = terminalApp.querySelector(".terminal-header");

header.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - terminalApp.offsetLeft;
  offsetY = e.clientY - terminalApp.offsetTop;
});

document.addEventListener("mouseup", () => (isDragging = false));

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  terminalApp.style.left = (e.clientX - offsetX) + "px";
  terminalApp.style.top = (e.clientY - offsetY) + "px";
});

// Command handling
document.addEventListener("keydown", (e) => {
  const activeInput = document.getElementById("active-input");
  if (!activeInput) return;

  if (e.key === "Enter") {
    e.preventDefault();
    const input = activeInput.textContent.trim();
    activeInput.removeAttribute("id");
    history.push(input);
    historyIndex = history.length;
    inputActive = false;

    if (input === "kevin --about") {
      modal.classList.remove("hidden");
    } else if (input === "kevin --help") {
      printLine("Available commands:");
      printLine("  kevin --about    → Go to portfolio");
      printLine("  kevin --help     → Show this help menu");
      newPrompt();
    } else if (input) {
      printLine(`'${input}' is not recognized as an internal or external command,`);
      printLine("operable program or batch file.");
      newPrompt();
    } else {
      newPrompt();
    }
  }

  if (e.key === "ArrowUp") {
    if (history.length > 0 && historyIndex > 0) {
      historyIndex--;
      activeInput.textContent = history[historyIndex];
      focusPrompt();
    }
  }

  if (e.key === "ArrowDown") {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      activeInput.textContent = history[historyIndex];
    } else {
      activeInput.textContent = "";
      historyIndex = history.length;
    }
    focusPrompt();
  }
});

// Initialize terminal on load
window.addEventListener("load", boot);