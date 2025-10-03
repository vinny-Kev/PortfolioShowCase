// Background Canvas Animation
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
const mouse = { x: null, y: null };

class Particle {
  constructor() {
    this.reset();
    const theme = document.body.getAttribute('data-theme');
    this.color = theme === 'light' ? '#ff69b4' : '#0f0';
  }

  reset() {
    const theme = document.body.getAttribute('data-theme');
    if (theme === 'light') {
      // Sakura mode: start from top with downward motion
      this.x = Math.random() * canvas.width;
      this.y = -10;
      this.size = Math.random() * 6 + 2;
      this.speedX = Math.random() * 2 - 1; // Left to right drift
      this.speedY = Math.random() * 1 + 0.5; // Downward fall
      this.angle = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 2;
      this.oscillationSpeed = Math.random() * 0.02;
      this.oscillationDistance = Math.random() * 40 + 40;
      this.initialX = this.x;
    } else {
      // Matrix mode: standard particle behavior
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 1;
      this.speedY = (Math.random() - 0.5) * 1;
    }
  }

  update() {
    const theme = document.body.getAttribute('data-theme');
    
    if (theme === 'light') {
      // Sakura petal movement
      this.y += this.speedY;
      this.x = this.initialX + Math.sin(this.y * this.oscillationSpeed) * this.oscillationDistance;
      this.angle += this.rotationSpeed;

      // Check if petal is off screen
      if (this.y > canvas.height + 10) {
        this.reset();
      }

      // Mouse interaction
      if (mouse.x && mouse.y) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 50) {
          this.x += dx / distance * 2;
          this.y += dy / distance * 2;
        }
      }
    } else {
      // Matrix mode movement
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
  }

  draw() {
    const theme = document.body.getAttribute('data-theme');
    
    if (theme === 'light') {
      // Draw sakura petal
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle * Math.PI / 180);
      
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = this.color;
      
      // Draw a simple petal shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size, -this.size, this.size, -this.size, 0, this.size * 2);
      ctx.bezierCurveTo(-this.size, -this.size, -this.size, this.size, 0, 0);
      ctx.fill();
      
      ctx.restore();
    } else {
      // Draw matrix particle
      const theme = document.body.getAttribute('data-theme');
      this.color = theme === 'light' ? '#ff69b4' : '#0f0';
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function init() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  const theme = document.body.getAttribute('data-theme');
  const baseColor = theme === 'light' ? '255,105,180' : '0,255,0';
  const maxDistance = theme === 'light' ? 100 : 120;
  const mouseMaxDistance = theme === 'light' ? 120 : 150;
  
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      let dx = particles[a].x - particles[b].x;
      let dy = particles[a].y - particles[b].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < maxDistance) {
        ctx.strokeStyle = `rgba(${baseColor},${(1 - distance / maxDistance) * (theme === 'light' ? 0.6 : 1)})`;
        ctx.lineWidth = theme === 'light' ? 0.5 : 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
    if (mouse.x && mouse.y) {
      let dx = particles[a].x - mouse.x;
      let dy = particles[a].y - mouse.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouseMaxDistance) {
        ctx.strokeStyle = `rgba(${baseColor},${(1 - distance / mouseMaxDistance) * (theme === 'light' ? 0.6 : 1)})`;
        ctx.lineWidth = theme === 'light' ? 0.5 : 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  const theme = document.body.getAttribute('data-theme');
  ctx.fillStyle = theme === 'light' ? '#fff' : '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.globalAlpha = theme === 'light' ? 0.8 : 1;
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  if (theme === 'dark') {
    connectParticles();
  }
  
  requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

// Initialize animation
init();
animate();