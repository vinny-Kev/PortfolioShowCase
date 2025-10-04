// Opens certificate image in overlay modal
function openCert(url) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';

  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.border = '3px solid white';
  img.style.borderRadius = '10px';

  overlay.addEventListener('click', () => overlay.remove());

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

// Attach to window for global access
window.openCert = openCert;
