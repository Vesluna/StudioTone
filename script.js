// Button functions with click feedback
function startCreating() {
    playClickSound();
    alert("Starting your music creation!");
    // Future: Link to music editor
}

function loadProject() {
    playClickSound();
    alert("Loading project...");
    // Future: Load from data.json
}

function openSettings() {
    playClickSound();
    alert("Opening settings...");
    // Future: Settings menu
}

function exit() {
    playClickSound();
    alert("Thanks for using StudioTone!");
    window.close(); // Note: Doesn't work in all browsers
}

// Click sound effect
function playClickSound() {
    const clickSound = new Audio('assets/click.mp3'); // Add your own click sound
    clickSound.play().catch(() => console.log("Click sound blocked"));
}

// Visualizer
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('bgMusic');
let audioContext, analyser, dataArray;

function initVisualizer() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 512; // Increased for smoother visuals
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    canvas.width = window.innerWidth;
    canvas.height = 80;
    drawVisualizer();
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / (dataArray.length * 0.5); // Wider bars
    for (let i = 0; i < dataArray.length * 0.5; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        ctx.fillStyle = `hsl(${i * 3 + 180}, 80%, 60%)`; // Shifted hue for light mode
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth * 0.8, barHeight);
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
});

audio.addEventListener('play', () => {
    if (!audioContext) initVisualizer();
});

// Resume audio context on user interaction
document.addEventListener('click', () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
});
