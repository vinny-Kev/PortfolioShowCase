// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
  
  // Reinitialize particles for the new theme
  particles = [];
  for (let i = 0; i < (newTheme === 'light' ? 50 : 100); i++) {
    particles.push(new Particle());
  }
});

function updateThemeIcon() {
  themeToggle.textContent = document.body.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
}

// Flower particle system
function initFlowerParticles() {
  particles = [];
  const flowers = ['🌸', '🌺', '🌹', '🌷', '💮'];
  
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      flower: flowers[Math.floor(Math.random() * flowers.length)],
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2
    });
  }
}