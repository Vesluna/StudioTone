// Placeholder functions for menu buttons
function startCreating() {
    alert("Starting your music creation!");
    // Future: Link to music editor
}

function loadProject() {
    alert("Loading project...");
    // Future: Load from data.json
}

function openSettings() {
    alert("Opening settings...");
    // Future: Settings menu
}

function exit() {
    alert("Thanks for using StudioTone!");
    window.close(); // Note: Doesn't work in all browsers
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
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    canvas.width = window.innerWidth;
    canvas.height = 100;
    drawVisualizer();
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `hsl(${i * 2}, 70%, 50%)`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
});

audio.addEventListener('play', () => {
    if (!audioContext) initVisualizer();
});
