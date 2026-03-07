(() => {
  const explorerApp = document.getElementById('explorer-app');
  const explorerIcon = document.getElementById('explorer-icon');
  const explorerCloseButton = document.getElementById('explorer-close');

  if (!explorerApp || !explorerIcon || !explorerCloseButton) {
    return;
  }

  const openExplorer = () => {
    explorerApp.classList.remove('hidden');
    explorerApp.style.zIndex = '35';
  };

  const closeExplorer = () => {
    explorerApp.classList.add('hidden');
  };

  explorerIcon.addEventListener('click', openExplorer);
  explorerCloseButton.addEventListener('click', closeExplorer);
})();
