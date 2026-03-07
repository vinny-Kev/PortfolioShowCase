// Theme toggle functionality
if (!window.themeToggleInitialized) {
  window.themeToggleInitialized = true;

  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) {
    console.warn('[Theme] Toggle button not found.');
  }

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    if (!themeToggle) {
      return;
    }

    themeToggle.textContent = document.body.getAttribute('data-theme') === 'light' ? 'Dark' : 'Light';
  }
}
