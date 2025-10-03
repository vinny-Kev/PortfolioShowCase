// Notepad functionality
const notepadApp = document.getElementById("notepad-app");
const notepadIcon = document.getElementById("notepad-icon");
let desktopFiles = [];
let currentFilename = "instructions.txt";

// Initialize notepad position
notepadApp.classList.remove("hidden");
notepadApp.style.zIndex = 30;
notepadApp.style.left = "auto";
notepadApp.style.right = "20px";
notepadApp.style.top = "50px";

// File menu functionality
const fileMenu = document.querySelector(".menu");
const dropdown = fileMenu.querySelector(".dropdown");

fileMenu.addEventListener("click", () => {
  dropdown.classList.toggle("hidden");
});

document.getElementById("save-option").addEventListener("click", () => {
  const content = notepadApp.querySelector(".window-body pre").innerText;
  addFileToDesktop(currentFilename, content);
  dropdown.classList.add("hidden");
});

document.getElementById("saveas-option").addEventListener("click", () => {
  const newName = prompt("Enter file name:", currentFilename);
  if (newName) {
    currentFilename = newName.endsWith(".txt") ? newName : newName + ".txt";
    notepadApp.querySelector(".window-header span").innerText = "Notepad - " + currentFilename;
    const content = notepadApp.querySelector(".window-body pre").innerText;
    addFileToDesktop(currentFilename, content);
  }
  dropdown.classList.add("hidden");
});

function addFileToDesktop(name, content) {
  let existing = desktopFiles.find(f => f.name === name);
  if (existing) {
    existing.content = content;
    return;
  }

  desktopFiles.push({ name, content });
  const desktop = document.getElementById("desktop");
  const icon = document.createElement("div");
  icon.className = "desktop-icon";
  icon.innerHTML = `
    <img src="assets/text-file.png" alt="file">
    <div>${name}</div>
  `;

  icon.addEventListener("dblclick", () => {
    notepadApp.classList.remove("hidden");
    notepadApp.querySelector(".window-body pre").innerText = content;
    currentFilename = name;
    notepadApp.querySelector(".window-header span").innerText = "Notepad - " + name;
  });

  desktop.appendChild(icon);
}

// Notepad window management
notepadIcon.addEventListener("click", () => {
  notepadApp.classList.remove("hidden");
  notepadApp.style.zIndex = 30;
  notepadApp.style.left = "auto";
  notepadApp.style.right = "20px";
  notepadApp.style.top = "50px";
});

notepadApp.querySelector(".close-btn").addEventListener("click", () => {
  notepadApp.classList.add("hidden");
});

// Notepad dragging functionality
let npOffsetX, npOffsetY, npDragging = false;
const npHeader = notepadApp.querySelector(".window-header");

npHeader.addEventListener("mousedown", (e) => {
  npDragging = true;
  npOffsetX = e.clientX - notepadApp.offsetLeft;
  npOffsetY = e.clientY - notepadApp.offsetTop;
});

document.addEventListener("mouseup", () => npDragging = false);

document.addEventListener("mousemove", (e) => {
  if (!npDragging) return;
  notepadApp.style.left = (e.clientX - npOffsetX) + "px";
  notepadApp.style.top = (e.clientY - npOffsetY) + "px";
});