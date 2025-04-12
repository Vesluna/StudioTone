// StudioTone Visualizer Script
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('bgMusic');
let audioContext, analyser, dataArray;

// Resize canvas to fit window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initialize Web Audio API for visualizer
function initVisualizer() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 256; // Smaller FFT for lighter visualizer
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  drawVisualizer();
}

// Draw music-synced visualizer
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / dataArray.length;
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height * 0.5;
    ctx.fillStyle = `hsl(${i * 2}, 70%, 50%)`;
    ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
  }
}

// Start visualizer when audio plays
audio.addEventListener('play', () => {
  if (!audioContext) initVisualizer();
});

// Resume audio context on user interaction
document.addEventListener('click', () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
});

// Menu item event listeners
function playClickSound() {
  const clickSound = new Audio('assets/click.mp3'); // Placeholder; add your own
  clickSound.play().catch(() => console.log("Click sound blocked"));
}

document.getElementById('startCreating').addEventListener('click', () => {
  playClickSound();
  alert('Start Creating clicked!');
});

document.getElementById('loadProject').addEventListener('click', () => {
  playClickSound();
  alert('Load Project clicked!');
});

document.getElementById('settings').addEventListener('click', () => {
  playClickSound();
  alert('Settings clicked!');
});

document.getElementById('howItWorks').addEventListener('click', () => {
  playClickSound();
  alert('How It Works clicked!');
});
