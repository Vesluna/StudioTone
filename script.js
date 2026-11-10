const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('bgMusic');
const mainMenu = document.getElementById('mainMenu');
const projectEditor = document.getElementById('projectEditor');
const themeSelect = document.getElementById('theme');
const errorMessage = document.getElementById('errorMessage');
const noteGrid = document.getElementById('noteGrid');
const channelList = document.getElementById('channelList');

const STORAGE_KEYS = { settings: 'studiotone-settings', lastProject: 'studiotone-last-project' };
const PRESETS = ['Lead Synth', 'Bass Pulse', 'Drum Kit', 'FX Noise'];
const GRID_COLUMNS = 16;
const GRID_ROWS = 12;
const DEFAULT_PRESET = PRESETS[0];

let currentProject = null;
let activeChannelId = null;
let selectedPreset = DEFAULT_PRESET;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawCheckers() {
  const size = 50;
  let offset = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    offset = (offset + 1) % size;
    for (let x = -size; x < canvas.width + size; x += size) {
      for (let y = -size; y < canvas.height + size; y += size) {
        const even = (Math.floor((x + offset) / size) + Math.floor((y + offset) / size)) % 2 === 0;
        ctx.fillStyle = even ? '#ccc' : '#eee';
        ctx.fillRect(x, y, size, size);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_error) {
    return false;
  }
}

function loadJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function setPopupVisibility(id, visible) {
  const popup = document.getElementById(id);
  if (popup) popup.style.display = visible ? 'block' : 'none';
}

function closeAllPopups() {
  document.querySelectorAll('.popup').forEach((popup) => { popup.style.display = 'none'; });
}

function openOnlyPopup(id) {
  closeAllPopups();
  setPopupVisibility(id, true);
}

function showStatusPopup(title, message) {
  document.getElementById('statusTitle').textContent = title;
  document.getElementById('statusMessage').textContent = message;
  openOnlyPopup('statusPopup');
}

function normalizeBackground(value) {
  return value === 'custom' ? 'custom' : 'default';
}

function makeChannel(index, source = {}) {
  return {
    id: String(source.id || `ch_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`),
    name: String(source.name || `Channel ${index + 1}`),
    instrument: PRESETS.includes(source.instrument) ? source.instrument : DEFAULT_PRESET,
    notes: Array.isArray(source.notes) ? source.notes.filter(isValidNote) : []
  };
}

function isValidNote(note) {
  return Number.isInteger(note?.row) && note.row >= 0 && note.row < GRID_ROWS &&
    Number.isInteger(note?.col) && note.col >= 0 && note.col < GRID_COLUMNS;
}

function normalizeProject(data) {
  const channels = Array.isArray(data.channels) && data.channels.length
    ? data.channels.map((channel, index) => makeChannel(index, channel))
    : [makeChannel(0, { notes: Array.isArray(data.notes) ? data.notes : [] })];
  return {
    name: String(data.name || 'Untitled Project'),
    background: normalizeBackground(data.background),
    channels,
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

function getActiveChannel() {
  return currentProject?.channels.find((channel) => channel.id === activeChannelId) || null;
}

function updateProjectMeta() {
  if (!currentProject) return;
  document.getElementById('editorProjectTitle').textContent = currentProject.name;
  document.getElementById('editorProjectMeta').textContent =
    `Background: ${currentProject.background === 'custom' ? 'Custom' : 'Default'} • Channels: ${currentProject.channels.length} • Updated ${new Date(currentProject.updatedAt).toLocaleTimeString()}`;
}

function updateSelectedPresetLabel() {
  const channel = getActiveChannel();
  document.getElementById('selectedPresetLabel').textContent =
    `${channel ? channel.name : 'No Channel'} • Selected: ${selectedPreset}`;
  document.querySelectorAll('.preset-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.preset === selectedPreset);
  });
}

function renderChannelList() {
  channelList.replaceChildren();
  currentProject?.channels.forEach((channel, index) => {
    const item = document.createElement('li');
    item.className = `channel-item${channel.id === activeChannelId ? ' active' : ''}`;

    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'channel-select';
    selectButton.textContent = channel.name;
    selectButton.addEventListener('click', () => {
      activeChannelId = channel.id;
      selectedPreset = channel.instrument;
      renderChannelList();
      updateSelectedPresetLabel();
      renderGrid();
    });

    const instrumentSelect = document.createElement('select');
    instrumentSelect.className = 'channel-instrument';
    PRESETS.forEach((preset) => instrumentSelect.add(new Option(preset, preset, preset === channel.instrument, preset === channel.instrument)));
    instrumentSelect.addEventListener('change', (event) => {
      channel.instrument = event.target.value;
      if (channel.id === activeChannelId) {
        selectedPreset = channel.instrument;
        updateSelectedPresetLabel();
      }
      persistProject(false);
    });

    item.append(selectButton, instrumentSelect);
    if (index > 0) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'channel-remove';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        currentProject.channels = currentProject.channels.filter((entry) => entry.id !== channel.id);
        if (activeChannelId === channel.id) {
          activeChannelId = currentProject.channels[0].id;
          selectedPreset = currentProject.channels[0].instrument;
        }
        renderChannelList();
        updateSelectedPresetLabel();
        renderGrid();
        updateProjectMeta();
        persistProject(false);
      });
      item.appendChild(removeButton);
    }
    channelList.appendChild(item);
  });
}

function renderGrid() {
  noteGrid.querySelectorAll('.note-cell').forEach((cell) => {
    cell.classList.remove('active');
    cell.textContent = '';
    cell.dataset.preset = '';
  });
  const channel = getActiveChannel();
  channel?.notes.forEach((note) => {
    const cell = noteGrid.querySelector(`[data-row="${note.row}"][data-col="${note.col}"]`);
    if (!cell) return;
    const preset = note.preset || channel.instrument || DEFAULT_PRESET;
    cell.classList.add('active');
    cell.dataset.preset = preset;
    cell.textContent = preset[0];
  });
}

function buildGrid() {
  noteGrid.replaceChildren();
  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLUMNS; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'note-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute('aria-label', `Row ${row + 1}, Step ${col + 1}`);
      cell.addEventListener('click', () => {
        const channel = getActiveChannel();
        if (!channel) {
          showStatusPopup('No Active Channel', 'Create or load a project before placing notes.');
          return;
        }
        const index = channel.notes.findIndex((note) => note.row === row && note.col === col);
        if (index >= 0) channel.notes.splice(index, 1);
        else channel.notes.push({ row, col, preset: selectedPreset });
        renderGrid();
        persistProject(false);
      });
      noteGrid.appendChild(cell);
    }
  }
}

function setCurrentProject(data) {
  currentProject = normalizeProject(data);
  activeChannelId = currentProject.channels[0].id;
  selectedPreset = currentProject.channels[0].instrument;
  updateProjectMeta();
  renderChannelList();
  updateSelectedPresetLabel();
  renderGrid();
}

function openProjectEditor(data) {
  setCurrentProject(data);
  closeAllPopups();
  mainMenu.style.display = 'none';
  projectEditor.classList.add('active');
  projectEditor.setAttribute('aria-hidden', 'false');
  audio.pause();
}

function returnToMainMenu() {
  closeAllPopups();
  projectEditor.classList.remove('active');
  projectEditor.setAttribute('aria-hidden', 'true');
  mainMenu.style.display = 'block';
  audio.play().catch(() => {});
}

function persistProject(showPopup = true) {
  if (!currentProject) {
    if (showPopup) showStatusPopup('No Active Project', 'Create or load a project before saving.');
    return false;
  }
  currentProject.updatedAt = new Date().toISOString();
  const saved = saveJSON(STORAGE_KEYS.lastProject, currentProject);
  updateProjectMeta();
  if (!saved) {
    if (showPopup) showStatusPopup('Save Failed', 'Could not save this project to local storage.');
  } else if (showPopup) {
    showStatusPopup('Project Saved', `Saved "${currentProject.name}" to local storage.`);
  }
  return saved;
}

function loadProjectFromLocalSave() {
  const saved = loadJSON(STORAGE_KEYS.lastProject);
  if (!saved?.name) {
    errorMessage.style.display = 'block';
    return;
  }
  errorMessage.style.display = 'none';
  openProjectEditor(saved);
  showStatusPopup('Project Loaded', `Loaded local project "${saved.name}".`);
}

function parseProjectFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed?.name) throw new Error('Missing project name.');
        resolve(parsed);
      } catch (error) {
        reject(new Error(error.message === 'Missing project name.' ? error.message : 'Invalid project file. Use JSON with at least a "name" field.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

function applyTheme(theme) {
  const safeTheme = theme === 'dark' ? 'dark' : 'light';
  document.body.className = safeTheme;
  themeSelect.value = safeTheme;
  saveJSON(STORAGE_KEYS.settings, { theme: safeTheme });
}

function tryStartBackgroundMusic() {
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

function bindMenuAction(elementId, popupId) {
  const element = document.getElementById(elementId);
  const activate = () => {
    if (elementId === 'loadProject') errorMessage.style.display = 'none';
    openOnlyPopup(popupId);
  };
  element.addEventListener('click', activate);
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', tryStartBackgroundMusic);
resizeCanvas();
drawCheckers();
buildGrid();

['howItWorks', 'settings', 'loadProject', 'startCreating'].forEach((id) => bindMenuAction(id, `${id}Popup`));
document.querySelectorAll('.close-popup').forEach((button) => button.addEventListener('click', () => setPopupVisibility(button.dataset.popup, false)));
document.querySelectorAll('.popup').forEach((popup) => popup.addEventListener('click', (event) => {
  if (event.target === popup) popup.style.display = 'none';
}));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAllPopups(); });
document.addEventListener('click', tryStartBackgroundMusic, { once: true });
document.addEventListener('keydown', tryStartBackgroundMusic, { once: true });

document.getElementById('createProject').addEventListener('click', () => {
  const nameInput = document.getElementById('projectName');
  const name = nameInput.value.trim();
  if (!name) {
    showStatusPopup('Project Name Required', 'Please enter a project name before creating your project.');
    return;
  }
  openProjectEditor({ name, background: document.getElementById('background').value });
  nameInput.value = '';
  persistProject(false);
});
document.getElementById('loadLocalSave').addEventListener('click', loadProjectFromLocalSave);
document.getElementById('openFile').addEventListener('click', () => document.getElementById('projectFile').click());
document.getElementById('projectFile').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    openProjectEditor(await parseProjectFile(file));
    showStatusPopup('Project Loaded', `Opened "${file.name}".`);
  } catch (error) {
    showStatusPopup('Import Error', error.message);
  } finally {
    event.target.value = '';
  }
});
document.getElementById('backToMenu').addEventListener('click', returnToMainMenu);
document.getElementById('saveProject').addEventListener('click', () => persistProject(true));
document.getElementById('openMixer').addEventListener('click', () => showStatusPopup('Open Mixer', 'Mixer controls are coming soon.'));
document.getElementById('clearNotes').addEventListener('click', () => {
  const channel = getActiveChannel();
  if (!channel) return showStatusPopup('No Active Channel', 'Create or load a project first.');
  channel.notes = [];
  renderGrid();
  persistProject(false);
  showStatusPopup('Grid Cleared', `All notes were removed from ${channel.name}.`);
});
document.getElementById('addChannel').addEventListener('click', () => {
  if (!currentProject) return showStatusPopup('No Active Project', 'Create or load a project first.');
  const channel = makeChannel(currentProject.channels.length);
  currentProject.channels.push(channel);
  activeChannelId = channel.id;
  selectedPreset = channel.instrument;
  renderChannelList();
  updateSelectedPresetLabel();
  renderGrid();
  updateProjectMeta();
  persistProject(false);
});
themeSelect.addEventListener('change', (event) => applyTheme(event.target.value));
document.querySelectorAll('.preset-item').forEach((item) => {
  item.tabIndex = 0;
  const activate = () => {
    selectedPreset = item.dataset.preset;
    const channel = getActiveChannel();
    if (channel) channel.instrument = selectedPreset;
    renderChannelList();
    updateSelectedPresetLabel();
    persistProject(false);
  };
  item.addEventListener('click', activate);
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
  });
});

applyTheme(loadJSON(STORAGE_KEYS.settings, { theme: 'light' }).theme);
closeAllPopups();
