const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');
const audio = document.getElementById('bgMusic');
const mainMenu = document.getElementById('mainMenu');
const projectEditor = document.getElementById('projectEditor');
const themeSelect = document.getElementById('theme');
const errorMessage = document.getElementById('errorMessage');
const noteGrid = document.getElementById('noteGrid');
const channelList = document.getElementById('channelList');

const STORAGE_KEYS = {
  settings: 'studiotone-settings',
  lastProject: 'studiotone-last-project'
};

const GRID_COLUMNS = 16;
const GRID_ROWS = 12;
const DEFAULT_PRESET = 'Lead Synth';

let currentProject = null;
let selectedPreset = DEFAULT_PRESET;
let activeChannelId = null;

let currentProject = null;
let selectedPreset = 'Lead Synth';
let currentProject = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_error) {
    return false;
  }
}

function loadJSON(key, fallbackValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (_error) {
    return fallbackValue;
  }
}

function tryStartBackgroundMusic() {
  audio.volume = 0.6;
  const playAttempt = audio.play();
  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => {});
  }
}

function stopBackgroundMusic() {
  audio.pause();
  audio.currentTime = 0;
}

window.addEventListener('load', tryStartBackgroundMusic);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && mainMenu.style.display !== 'none') {
    tryStartBackgroundMusic();
  }
  localStorage.setItem(key, JSON.stringify(value));
}

function loadJSON(key, fallbackValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (_error) {
    return fallbackValue;
  }
}

// Ensure background music can start on browsers with autoplay restrictions
function tryStartBackgroundMusic() {
  audio.volume = 0.6;
  const playAttempt = audio.play();

  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => {
      // Expected in some browsers before first user interaction.
    });
  }
}

function unlockAudioAndStartMusic() {
  tryStartBackgroundMusic();
}

window.addEventListener('load', tryStartBackgroundMusic);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    tryStartBackgroundMusic();
  }
}

function tryStartBackgroundMusic() {
  audio.volume = 0.6;
  const playAttempt = audio.play();

  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => {
      // Expected on first load in some browsers.
    });
  }
}

function stopBackgroundMusic() {
  audio.pause();
  audio.currentTime = 0;
}

window.addEventListener('load', tryStartBackgroundMusic);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && mainMenu.style.display !== 'none') {
    tryStartBackgroundMusic();
  }
document.addEventListener('click', unlockAudioAndStartMusic, { once: true });
document.addEventListener('keydown', unlockAudioAndStartMusic, { once: true });

audio.addEventListener('ended', () => {
  tryStartBackgroundMusic();
});

function setPopupVisibility(popupId, isVisible) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = isVisible ? 'block' : 'none';
  }
}

function showStatusPopup(title, message) {
  document.getElementById('statusTitle').textContent = title;
  document.getElementById('statusMessage').textContent = message;
  setPopupVisibility('statusPopup', true);
}

function closeAllPopups() {
  document.querySelectorAll('.popup').forEach(popup => {
    popup.style.display = 'none';
  });
}

function normalizeBackgroundLabel(value) {
  return value === 'custom' ? 'Custom' : 'Default';
}

function setCurrentProject(projectData) {
  currentProject = {
    name: projectData.name,
    background: projectData.background,
    updatedAt: new Date().toISOString()
  };

  document.getElementById('editorProjectTitle').textContent = currentProject.name;
  document.getElementById('editorProjectMeta').textContent = `Background: ${normalizeBackgroundLabel(currentProject.background)} • Updated ${new Date(currentProject.updatedAt).toLocaleTimeString()}`;
}

function openProjectEditor(projectData) {
  setCurrentProject(projectData);
  mainMenu.style.display = 'none';
  projectEditor.classList.add('active');
  projectEditor.setAttribute('aria-hidden', 'false');
}

function returnToMainMenu() {
  projectEditor.classList.remove('active');
  projectEditor.setAttribute('aria-hidden', 'true');
  mainMenu.style.display = 'block';
}

function saveCurrentProjectToLocal() {
  if (!currentProject) {
    showStatusPopup('No Active Project', 'Create or load a project before saving.');
    return;
  }

  saveJSON(STORAGE_KEYS.lastProject, currentProject);
  showStatusPopup('Project Saved', `Saved "${currentProject.name}" to local storage.`);
}

function loadProjectFromLocalSave() {
  const savedProject = loadJSON(STORAGE_KEYS.lastProject);

  if (!savedProject || !savedProject.name) {
    errorMessage.style.display = 'block';
    return;
  }

  errorMessage.style.display = 'none';
  setPopupVisibility('loadProjectPopup', false);
  openProjectEditor(savedProject);
  showStatusPopup('Project Loaded', `Loaded local project "${savedProject.name}".`);
}

function applyTheme(theme) {
  document.body.className = theme;
  themeSelect.value = theme;
  const settings = loadJSON(STORAGE_KEYS.settings, { theme: 'light' });
  settings.theme = theme;
  saveJSON(STORAGE_KEYS.settings, settings);
}

function loadSavedTheme() {
  const settings = loadJSON(STORAGE_KEYS.settings, { theme: 'light' });
  const theme = settings.theme === 'dark' ? 'dark' : 'light';
  applyTheme(theme);
}

function parseProjectFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.name) {
          reject(new Error('Missing project name.'));
          return;
        }

        resolve({
          name: String(parsed.name),
          background: parsed.background === 'custom' ? 'custom' : 'default'
        });
      } catch (_error) {
        reject(new Error('Invalid project file. Use JSON with at least a "name" field.'));
      }
    };

    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

// Show pop-ups when corresponding buttons are clicked
document.getElementById('howItWorks').addEventListener('click', () => {
  setPopupVisibility('howItWorksPopup', true);
});

document.getElementById('settings').addEventListener('click', () => {
  setPopupVisibility('settingsPopup', true);
});

document.getElementById('loadProject').addEventListener('click', () => {
  errorMessage.style.display = 'none';
  setPopupVisibility('loadProjectPopup', true);
});

document.getElementById('startCreating').addEventListener('click', () => {
  setPopupVisibility('startCreatingPopup', true);
});

document.addEventListener('click', tryStartBackgroundMusic, { once: true });
document.addEventListener('keydown', tryStartBackgroundMusic, { once: true });

function setPopupVisibility(popupId, isVisible) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = isVisible ? 'block' : 'none';
  }
}

function closeAllPopups() {
  document.querySelectorAll('.popup').forEach((popup) => {
    popup.style.display = 'none';
  });
}

function openOnlyPopup(popupId) {
  closeAllPopups();
  setPopupVisibility(popupId, true);
}

function showStatusPopup(title, message) {
  document.getElementById('statusTitle').textContent = title;
  document.getElementById('statusMessage').textContent = message;
  openOnlyPopup('statusPopup');
}

function normalizeBackgroundLabel(value) {
  return value === 'custom' ? 'Custom' : 'Default';
}

function getActiveChannel() {
  if (!currentProject) {
    return null;
  }
  return currentProject.channels.find((channel) => channel.id === activeChannelId) || null;
}

function createChannel(name = null, instrument = DEFAULT_PRESET) {
  const nextNumber = currentProject.channels.length + 1;
  return {
    id: `ch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || `Channel ${nextNumber}`,
    instrument,
    notes: []
  };
}

function updateSelectedPresetLabel() {
  const activeChannel = getActiveChannel();
  const channelLabel = activeChannel ? activeChannel.name : 'No Channel';
  document.getElementById('selectedPresetLabel').textContent = `${channelLabel} • Selected: ${selectedPreset}`;
}

function updateProjectMeta() {
  if (!currentProject) {
    return;
  }

  document.getElementById('editorProjectTitle').textContent = currentProject.name;
  document.getElementById('editorProjectMeta').textContent = `Background: ${normalizeBackgroundLabel(currentProject.background)} • Channels: ${currentProject.channels.length} • Updated ${new Date(currentProject.updatedAt).toLocaleTimeString()}`;
}

function renderChannelList() {
  channelList.innerHTML = '';

  if (!currentProject) {
    return;
  }

  currentProject.channels.forEach((channel, index) => {
    const li = document.createElement('li');
    li.className = `channel-item${channel.id === activeChannelId ? ' active' : ''}`;

    const channelButton = document.createElement('button');
    channelButton.type = 'button';
    channelButton.className = 'channel-select';
    channelButton.textContent = channel.name;
    channelButton.addEventListener('click', () => {
      activeChannelId = channel.id;
      selectedPreset = channel.instrument || DEFAULT_PRESET;
      updateSelectedPreset(selectedPreset);
      renderChannelList();
      renderGridFromProject();
    });

    const instrumentSelect = document.createElement('select');
    instrumentSelect.className = 'channel-instrument';
    ['Lead Synth', 'Bass Pulse', 'Drum Kit', 'FX Noise'].forEach((preset) => {
      const option = document.createElement('option');
      option.value = preset;
      option.textContent = preset;
      if ((channel.instrument || DEFAULT_PRESET) === preset) {
        option.selected = true;
      }
      instrumentSelect.appendChild(option);
    });

    instrumentSelect.addEventListener('change', (event) => {
      channel.instrument = event.target.value;
      if (channel.id === activeChannelId) {
        updateSelectedPreset(channel.instrument);
      }
      saveCurrentProjectToLocal(false);
    });

    li.appendChild(channelButton);
    li.appendChild(instrumentSelect);

    if (index > 0) {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'channel-remove';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        currentProject.channels = currentProject.channels.filter((item) => item.id !== channel.id);
        if (activeChannelId === channel.id) {
          activeChannelId = currentProject.channels[0].id;
          selectedPreset = currentProject.channels[0].instrument || DEFAULT_PRESET;
        }
        renderChannelList();
        renderGridFromProject();
        updateSelectedPresetLabel();
        updateProjectMeta();
        saveCurrentProjectToLocal(false);
      });
      li.appendChild(removeButton);
    }

    channelList.appendChild(li);
  });
}

function ensureProjectStructure(projectData) {
  const normalized = {
    name: projectData.name,
    background: projectData.background === 'custom' ? 'custom' : 'default',
    updatedAt: new Date().toISOString(),
    channels: []
  };

  if (Array.isArray(projectData.channels) && projectData.channels.length > 0) {
    normalized.channels = projectData.channels.map((channel, index) => ({
      id: channel.id || `imported_${index}_${Date.now()}`,
      name: channel.name || `Channel ${index + 1}`,
      instrument: channel.instrument || DEFAULT_PRESET,
      notes: Array.isArray(channel.notes) ? channel.notes : []
    }));
  } else {
    const fallbackNotes = Array.isArray(projectData.notes) ? projectData.notes : [];
    normalized.channels = [{
      id: `legacy_${Date.now()}`,
      name: 'Channel 1',
      instrument: DEFAULT_PRESET,
      notes: fallbackNotes
    }];
  }

  return normalized;
}

function setCurrentProject(projectData) {
  currentProject = ensureProjectStructure(projectData);
  activeChannelId = currentProject.channels[0]?.id || null;
  selectedPreset = currentProject.channels[0]?.instrument || DEFAULT_PRESET;

  updateProjectMeta();
  updateSelectedPreset(selectedPreset);
  renderChannelList();
  document.getElementById('editorProjectMeta').textContent = `Background: ${normalizeBackgroundLabel(currentProject.background)} • Updated ${new Date(currentProject.updatedAt).toLocaleTimeString()}`;
}

function setCurrentProject(projectData) {
  currentProject = {
    name: projectData.name,
    background: projectData.background,
    updatedAt: new Date().toISOString(),
    notes: Array.isArray(projectData.notes) ? projectData.notes : []
  };

  updateProjectMeta();
  renderGridFromProject();
}

function openProjectEditor(projectData) {
  setCurrentProject(projectData);
  closeAllPopups();
  mainMenu.style.display = 'none';
  projectEditor.classList.add('active');
  projectEditor.setAttribute('aria-hidden', 'false');
  stopBackgroundMusic();
}

function returnToMainMenu() {
  closeAllPopups();
  errorMessage.style.display = 'none';
  projectEditor.classList.remove('active');
  projectEditor.setAttribute('aria-hidden', 'true');
  mainMenu.style.display = 'block';
  tryStartBackgroundMusic();
}

function saveCurrentProjectToLocal(showPopup = true) {
function saveCurrentProjectToLocal() {
  if (!currentProject) {
    showStatusPopup('No Active Project', 'Create or load a project before saving.');
    return;
  }

  currentProject.updatedAt = new Date().toISOString();
  updateProjectMeta();
  const didSave = saveJSON(STORAGE_KEYS.lastProject, currentProject);

  if (!didSave) {
    showStatusPopup('Save Failed', 'Could not save project. Your browser may be blocking local storage.');
    return;
  }

  if (showPopup) {
    showStatusPopup('Project Saved', `Saved "${currentProject.name}" to local storage.`);
  }
  saveJSON(STORAGE_KEYS.lastProject, currentProject);
  showStatusPopup('Project Saved', `Saved "${currentProject.name}" to local storage.`);
}

function loadProjectFromLocalSave() {
  const savedProject = loadJSON(STORAGE_KEYS.lastProject);

  if (!savedProject || !savedProject.name) {
    errorMessage.style.display = 'block';
    return;
  }

  errorMessage.style.display = 'none';
  setPopupVisibility('loadProjectPopup', false);
  openProjectEditor(savedProject);
  showStatusPopup('Project Loaded', `Loaded local project "${savedProject.name}".`);
}

function applyTheme(theme) {
  document.body.className = theme;
  themeSelect.value = theme;

  const settings = loadJSON(STORAGE_KEYS.settings, { theme: 'light' });
  settings.theme = theme;
  saveJSON(STORAGE_KEYS.settings, settings);
}

function loadSavedTheme() {
  const settings = loadJSON(STORAGE_KEYS.settings, { theme: 'light' });
  const theme = settings.theme === 'dark' ? 'dark' : 'light';
  applyTheme(theme);
}

function parseProjectFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.name) {
          reject(new Error('Missing project name.'));
          return;
        }
        resolve(parsed);

        resolve({
          name: String(parsed.name),
          background: parsed.background === 'custom' ? 'custom' : 'default',
          notes: Array.isArray(parsed.notes) ? parsed.notes : []
        });
      } catch (_error) {
        reject(new Error('Invalid project file. Use JSON with at least a "name" field.'));
      }
    };

    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsText(file);
  });
}

function updateSelectedPreset(presetName) {
  selectedPreset = presetName;
  const activeChannel = getActiveChannel();
  if (activeChannel) {
    activeChannel.instrument = selectedPreset;
  }
  document.getElementById('selectedPresetLabel').textContent = `Selected: ${selectedPreset}`;

  document.querySelectorAll('.preset-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.preset === selectedPreset);
  });

  renderChannelList();
  updateSelectedPresetLabel();
}

function initializePresets() {
  document.querySelectorAll('.preset-item').forEach((item) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    const activate = () => {
      updateSelectedPreset(item.dataset.preset);
      saveCurrentProjectToLocal(false);
    };

    item.addEventListener('click', activate);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    item.addEventListener('click', () => {
      updateSelectedPreset(item.dataset.preset);
    });
  });
}

function buildGrid() {
  noteGrid.innerHTML = '';

  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLUMNS; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'note-cell';
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.dataset.preset = '';
      cell.setAttribute('aria-label', `Row ${row + 1}, Step ${col + 1}`);

      cell.addEventListener('click', () => {
        const activeChannel = getActiveChannel();
        if (!currentProject || !activeChannel) {
          showStatusPopup('No Active Channel', 'Add/select a channel before placing notes.');
          return;
        }

        const existingIndex = activeChannel.notes.findIndex((note) => note.row === row && note.col === col);

        if (existingIndex >= 0) {
          activeChannel.notes.splice(existingIndex, 1);
        } else {
          activeChannel.notes.push({ row, col, preset: selectedPreset });
        }

        renderGridFromProject();
        saveCurrentProjectToLocal(false);
        if (!currentProject) {
          showStatusPopup('No Active Project', 'Create a project before placing notes.');
          return;
        }

        const existingIndex = currentProject.notes.findIndex(
          (note) => note.row === row && note.col === col
        );

        if (existingIndex >= 0) {
          currentProject.notes.splice(existingIndex, 1);
          cell.classList.remove('active');
          cell.dataset.preset = '';
          cell.textContent = '';
        } else {
          currentProject.notes.push({ row, col, preset: selectedPreset });
          cell.classList.add('active');
          cell.dataset.preset = selectedPreset;
          cell.textContent = selectedPreset[0];
        }
      });

      noteGrid.appendChild(cell);
    }
  }
}

function renderGridFromProject() {
  const cells = noteGrid.querySelectorAll('.note-cell');

  cells.forEach((cell) => {
    cell.classList.remove('active');
    cell.dataset.preset = '';
    cell.textContent = '';
  });

  const activeChannel = getActiveChannel();
  if (!activeChannel || !Array.isArray(activeChannel.notes)) {
    return;
  }

  activeChannel.notes.forEach((note) => {
  if (!currentProject || !Array.isArray(currentProject.notes)) {
    return;
  }

  currentProject.notes.forEach((note) => {
    const selector = `.note-cell[data-row="${note.row}"][data-col="${note.col}"]`;
    const cell = noteGrid.querySelector(selector);
    if (!cell) {
      return;
    }

    const preset = note.preset || activeChannel.instrument || DEFAULT_PRESET;
    const preset = note.preset || selectedPreset;
    cell.classList.add('active');
    cell.dataset.preset = preset;
    cell.textContent = preset[0];
  });
}

function clearAllNotes() {
  const activeChannel = getActiveChannel();
  if (!activeChannel) {
    showStatusPopup('No Active Channel', 'Create or load a project first.');
    return;
  }

  activeChannel.notes = [];
  renderGridFromProject();
  saveCurrentProjectToLocal(false);
  showStatusPopup('Grid Cleared', `All notes were removed from ${activeChannel.name}.`);
}

function addChannel() {
  if (!currentProject) {
    showStatusPopup('No Active Project', 'Create or load a project first.');
    return;
  }

  const newChannel = createChannel();
  currentProject.channels.push(newChannel);
  activeChannelId = newChannel.id;
  updateSelectedPreset(newChannel.instrument);
  renderChannelList();
  renderGridFromProject();
  updateProjectMeta();
  saveCurrentProjectToLocal(false);
  currentProject.notes = [];
  renderGridFromProject();
  showStatusPopup('Grid Cleared', 'All notes were removed from this pattern.');
}

function bindMenuAction(elementId, popupId) {
  const element = document.getElementById(elementId);
  const activate = () => {
    if (elementId === 'loadProject') {
      errorMessage.style.display = 'none';
    }
    openOnlyPopup(popupId);
  };

  element.addEventListener('click', activate);
  element.setAttribute('tabindex', '0');
  element.setAttribute('role', 'button');
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
}

bindMenuAction('howItWorks', 'howItWorksPopup');
bindMenuAction('settings', 'settingsPopup');
bindMenuAction('loadProject', 'loadProjectPopup');
bindMenuAction('startCreating', 'startCreatingPopup');

// Popup close and global shortcuts
document.querySelectorAll('.close-popup').forEach((button) => {
  button.addEventListener('click', () => {
    const popupId = button.getAttribute('data-popup');
    setPopupVisibility(popupId, false);
  });
});

document.querySelectorAll('.popup').forEach((popup) => {
  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAllPopups();
  }
});

themeSelect.addEventListener('change', (event) => {
  applyTheme(event.target.value);
});

document.getElementById('loadLocalSave').addEventListener('click', loadProjectFromLocalSave);
  });
});

document.querySelectorAll('.popup').forEach((popup) => {
document.querySelectorAll('.popup').forEach(popup => {
  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAllPopups();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAllPopups();
  }
});

// Settings: Theme toggle
themeSelect.addEventListener('change', (event) => {
  applyTheme(event.target.value);
});

// Load Project: Functionality
document.getElementById('loadLocalSave').addEventListener('click', () => {
  loadProjectFromLocalSave();
});

themeSelect.addEventListener('change', (event) => {
  applyTheme(event.target.value);
});

document.getElementById('loadLocalSave').addEventListener('click', loadProjectFromLocalSave);

document.getElementById('openFile').addEventListener('click', () => {
  document.getElementById('projectFile').click();
});

document.getElementById('projectFile').addEventListener('change', async (event) => {
  const [file] = event.target.files;

  if (!file) {
    showStatusPopup('No File Selected', 'Select a file to continue.');
    return;
  }

  try {
    const loadedProject = await parseProjectFile(file);
    setPopupVisibility('loadProjectPopup', false);
    openProjectEditor(loadedProject);
    showStatusPopup('Project Loaded', `Opened "${loadedProject.name}" from file.`);
  } catch (error) {
    showStatusPopup('Import Error', error.message);
  }

  event.target.value = '';
});

document.getElementById('createProject').addEventListener('click', () => {
  const projectName = document.getElementById('projectName').value.trim();
  const background = document.getElementById('background').value;

  if (!projectName) {
    showStatusPopup('Project Name Required', 'Please enter a project name before creating your project.');
    return;
  }

  setPopupVisibility('startCreatingPopup', false);
  document.getElementById('projectName').value = '';
  openProjectEditor({
    name: projectName,
    background,
    channels: [{ id: `ch_${Date.now()}`, name: 'Channel 1', instrument: DEFAULT_PRESET, notes: [] }]
  });
  saveCurrentProjectToLocal(false);
});

document.getElementById('backToMenu').addEventListener('click', returnToMainMenu);
document.getElementById('saveProject').addEventListener('click', saveCurrentProjectToLocal);
document.getElementById('openMixer').addEventListener('click', () => {
  showStatusPopup('Open Mixer', 'Mixer controls are coming soon.');
});
document.getElementById('clearNotes').addEventListener('click', clearAllNotes);
document.getElementById('addChannel').addEventListener('click', addChannel);
  openProjectEditor({ name: projectName, background, notes: [] });
  saveCurrentProjectToLocal();
});

document.getElementById('backToMenu').addEventListener('click', returnToMainMenu);
document.getElementById('saveProject').addEventListener('click', saveCurrentProjectToLocal);
document.getElementById('openMixer').addEventListener('click', () => {
  showStatusPopup('Open Mixer', 'Mixer controls are coming soon.');
});
document.getElementById('clearNotes').addEventListener('click', clearAllNotes);

buildGrid();
initializePresets();
updateSelectedPreset(selectedPreset);
  closeAllPopups();
  document.getElementById('projectName').value = '';
  openProjectEditor({ name: projectName, background });
  saveCurrentProjectToLocal();
  tryStartBackgroundMusic();
});

document.getElementById('backToMenu').addEventListener('click', () => {
  returnToMainMenu();
});

document.getElementById('saveProject').addEventListener('click', () => {
  saveCurrentProjectToLocal();
});

document.getElementById('openMixer').addEventListener('click', () => {
  showStatusPopup('Open Mixer', 'Mixer controls are coming soon.');
});

loadSavedTheme();
