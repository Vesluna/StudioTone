// StudioTone Visualizer Script 

const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;

function resizeCanvas() {
  canvasWidth = canvas.width = window.innerWidth;
  canvasHeight = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Visualizer variables
const barCount = 50;
const bars = [];

// Initialize bars with random starting heights
for (let i = 0; i < barCount; i++) {
  bars.push({
    x: i * (canvasWidth / barCount),
    width: canvasWidth / barCount - 2,
    height: Math.random() * canvasHeight / 2,
    speed: Math.random() * 2 + 1
  });
}

function drawVisualizer() {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw each bar
  bars.forEach((bar, index) => {
    // Randomize height a bit for a subtle animation effect
    bar.height += (Math.random() * 4 - 2);
    if (bar.height < 0) bar.height = 0;
    if (bar.height > canvasHeight / 2) bar.height = canvasHeight / 2;

    // Draw bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(bar.x, canvasHeight - bar.height, bar.width, bar.height);
  });
  
  requestAnimationFrame(drawVisualizer);
}

// Start the animation loop
drawVisualizer();

// Optional: Add event listeners for the menu items (placeholder functionality)
document.getElementById('startCreating').addEventListener('click', () => {
  alert('Start Creating clicked!');
});
document.getElementById('loadProject').addEventListener('click', () => {
  alert('Load Project clicked!');
});
document.getElementById('settings').addEventListener('click', () => {
  alert('Settings clicked!');
});
document.getElementById('howItWorks').addEventListener('click', () => {
  alert('How It Works clicked!');
});
