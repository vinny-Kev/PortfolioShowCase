(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.getElementById('cli-launcher');

    if (!launcher) {
      return;
    }

    const openGuide = () => {
      if (window.cliOnboarding && typeof window.cliOnboarding.open === 'function') {
        window.cliOnboarding.open();
      }
    };

    launcher.addEventListener('click', openGuide);

    launcher.addEventListener('keypress', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openGuide();
      }
    });
  });
})();
