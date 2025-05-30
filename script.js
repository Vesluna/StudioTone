const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('bgMusic');

// Resize canvas to fit window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Animated checkers background
function drawCheckers() {
  const size = 50;
  const speed = 1;
  let offset = 0;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    offset = (offset + speed) % size;

    for (let x = -size; x < canvas.width + size; x += size) {
      for (let y = -size; y < canvas.height + size; y += size) {
        ctx.fillStyle = (Math.floor((x + offset) / size) + Math.floor((y + offset) / size)) % 2 === 0 ? '#ccc' : '#eee';
        ctx.fillRect(x, y, size, size);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
drawCheckers();

// Resume audio context on user interaction
document.addEventListener('click', () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
});

// Show pop-ups when corresponding buttons are clicked
document.getElementById('howItWorks').addEventListener('click', () => {
  document.getElementById('howItWorksPopup').style.display = 'block';
});

document.getElementById('settings').addEventListener('click', () => {
  document.getElementById('settingsPopup').style.display = 'block';
});

document.getElementById('loadProject').addEventListener('click', () => {
  document.getElementById('loadProjectPopup').style.display = 'block';
});

document.getElementById('startCreating').addEventListener('click', () => {
  document.getElementById('startCreatingPopup').style.display = 'block';
});

// Close pop-ups
document.querySelectorAll('.close-popup').forEach(button => {
  button.addEventListener('click', () => {
    const popupId = button.getAttribute('data-popup');
    document.getElementById(popupId).style.display = 'none';
  });
});

// Settings: Theme toggle
document.getElementById('theme').addEventListener('change', (e) => {
  document.body.className = e.target.value;
});

// Load Project: Functionality
document.getElementById('loadLocalSave').addEventListener('click', () => {
  const localSaveExists = false; // Placeholder for actual check
  if (!localSaveExists) {
    document.getElementById('errorMessage').style.display = 'block';
  } else {
    // Load the save (to be implemented)
  }
});

document.getElementById('openFile').addEventListener('click', () => {
  alert('Open file functionality to be implemented');
});

// Start Creating: Project creation with validation
document.getElementById('createProject').addEventListener('click', () => {
  const projectName = document.getElementById('projectName').value;
  if (!projectName) {
    alert('Project name is required');
  } else {
    alert(`Creating project: ${projectName}`);
  }
});
