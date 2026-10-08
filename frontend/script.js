const API_URL = "http://127.0.0.1:8000";
const MAX_RECORDING_TIME = 90;

const GENRE_ART = {
  "Electronic": ["electronic-1.png", "electronic-2.png", "electronic-3.png"],
  "Experimental": ["experimental-1.png", "experimental-2.png", "experimental-3.png"],
  "Folk": ["folk-1.png", "folk-2.png", "folk-3.png"],
  "Hip-Hop": ["hip-hop-1.png", "hip-hop-2.png", "hip-hop-3.png"],
  "Instrumental": ["instrumental-1.png", "instrumental-2.png", "instrumental-3.png"],
  "International": ["international-1.png", "international-2.png", "international-3.png"],
  "Pop": ["pop-1.png", "pop-2.png", "pop-3.png"],
  "Rock": ["rock-1.png", "rock-2.png", "rock-3.png"]
};

let waveformAnimationFrame = null;
let activeGenreArtworkIndex = 0;

const $ = (id) => document.getElementById(id);

const audioInput = $("audioInput");
const chooseButton = $("chooseButton");
const dropZone = $("dropZone");
const fileName = $("fileName");
const selectedTrack = $("selectedTrack");
const selectedName = $("selectedName");
const selectedMeta = $("selectedMeta");
const clearButton = $("clearButton");
const analyzeButton = $("analyzeButton");

const uploadPanel = $("uploadPanel");
const recordPanel = $("recordPanel");
const modes = document.querySelectorAll(".mode");

const recordButton = $("recordButton");
const recordRing = $("recordRing");
const recordTime = $("recordTime");
const liveBars = $("liveBars");

const loading = $("loading");
const results = $("results");
const analyzerCard = $("analyzerCard");
const newAnalysisButton = $("newAnalysisButton");
const toast = $("toast");
const navAnalyze = $("navAnalyze");

let selectedFile = null;
let recordedBlob = null;
let mediaRecorder = null;
let recordTimer = null;
let recordSeconds = 0;
let analyser = null;
let audioContext = null;
let micStream = null;
let animationFrame = null;
let currentMode = "upload";

for (let i = 0; i < 34; i++) {
  const bar = document.createElement("i");
  liveBars.appendChild(bar);
}

function initGrainWave() {
  const canvas = document.getElementById("grainWaveCanvas");
  const hero = document.getElementById("hero");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { width: 0, height: 0, dpr: 1, particles: [], signature: [], raf: null };
  const textCanvas = document.createElement("canvas");
  const textCtx = textCanvas.getContext("2d", { willReadFrequently: true });

  function resize() {
    const rect = hero.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    state.width = Math.max(1, rect.width);
    state.height = Math.max(1, rect.height);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    buildParticles();
  }

  function buildParticles() {
    const count = Math.min(2200, Math.max(900, Math.floor((state.width * state.height) / 520)));
    state.particles = Array.from({ length: count }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      size: .35 + Math.random() * 1.25,
      alpha: .07 + Math.random() * .22,
      phase: Math.random() * Math.PI * 2,
      speed: .45 + Math.random() * 1.15,
      band: Math.random() * 3,
      cool: Math.random() > .72
    }));

    /* The signature is literally made from the same moving dots as the sand field. */
    const sw = Math.max(500, Math.floor(state.width * .42));
    const sh = Math.max(150, Math.floor(state.height * .22));
    textCanvas.width = sw;
    textCanvas.height = sh;
    textCtx.clearRect(0, 0, sw, sh);
    textCtx.fillStyle = "white";
    textCtx.font = `700 ${Math.max(34, Math.min(72, sw / 10))}px Inter, Arial, sans-serif`;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillText("Srinvitha", sw / 2, sh / 2);

    const pixels = textCtx.getImageData(0, 0, sw, sh).data;
    const candidates = [];
    for (let y = 0; y < sh; y += 3) {
      for (let x = 0; x < sw; x += 3) {
        if (pixels[(y * sw + x) * 4 + 3] > 80) candidates.push({ x, y });
      }
    }

    state.signature = [];
    const target = Math.min(330, candidates.length);
    for (let i = 0; i < target; i += 1) {
      const point = candidates[Math.floor(Math.random() * candidates.length)];
      state.signature.push({
        x: state.width * .72 + (point.x / sw - .5) * state.width * .27,
        y: state.height * .73 + (point.y / sh - .5) * state.height * .13,
        size: .45 + Math.random() * .75,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(time) {
    const t = time * .00035;
    ctx.clearRect(0, 0, state.width, state.height);

    for (const p of state.particles) {
      const wave = Math.sin(p.x * .010 + t * p.speed + p.phase) * (10 + p.band * 5)
        + Math.sin(p.x * .021 - t * .8 + p.phase) * 4;
      const y = p.y + wave + Math.sin(t * .7 + p.phase) * .7;
      const x = p.x + Math.sin(t + p.phase) * 2;
      ctx.globalAlpha = p.alpha * (.72 + .28 * Math.sin(t * 2 + p.phase));
      ctx.fillStyle = p.cool ? "#d6b9ff" : "#a987e8";
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Same grain, same wave motion, slightly denser: the Easter egg resolves only on inspection. */
    for (const p of state.signature) {
      const wave = Math.sin(p.x * .010 + t * 1.15 + p.phase) * 9
        + Math.sin(p.x * .022 - t + p.phase) * 3;
      ctx.globalAlpha = .14 + .055 * Math.sin(t * 2 + p.phase);
      ctx.fillStyle = "#e7d9ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y + wave, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion) state.raf = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw(reduceMotion ? 0 : performance.now());
}

function initAtmosphere() {
  const particleField = $("particleField");
  const cursorGlow = document.querySelector(".cursor-glow");

  if (particleField) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 34; i += 1) {
      const particle = document.createElement("i");
      particle.className = "particle";
      particle.style.setProperty("--x", `${Math.random() * 100}%`);
      particle.style.setProperty("--y", `${Math.random() * 100}%`);
      particle.style.setProperty("--size", `${1 + Math.random() * 2.8}px`);
      particle.style.setProperty("--delay", `${Math.random() * -12}s`);
      particle.style.setProperty("--duration", `${8 + Math.random() * 12}s`);
      fragment.appendChild(particle);
    }
    particleField.appendChild(fragment);
  }

  if (cursorGlow && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.transform = `translate3d(${event.clientX - 150}px, ${event.clientY - 150}px, 0)`;
    }, { passive: true });
  }

  const revealItems = document.querySelectorAll(".dna-card, .panel, .rag-panel, .thinking-section, .thinking-heading, .pipeline-node");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => {
    item.classList.add("reveal-on-scroll");
    revealObserver.observe(item);
  });
}

function setGenreArtwork(genre) {
  const artwork = $("genreArtwork");
  const label = $("genreArtLabel");
  const wrap = $("dnaArtWrap");
  const files = GENRE_ART[genre] || GENRE_ART.Electronic;
  activeGenreArtworkIndex = Math.floor(Math.random() * files.length);
  const chosen = files[activeGenreArtworkIndex];

  if (artwork) {
    artwork.classList.remove("art-enter");
    void artwork.offsetWidth;
    artwork.src = `assets/genres/${chosen}`;
    artwork.alt = `${genre} visual artwork`;
    artwork.classList.add("art-enter");
  }
  if (label) label.textContent = `${genre.toUpperCase()} · SONG DNA`;
  if (wrap) wrap.dataset.genre = genre.toLowerCase();
}

function cycleGenreArtwork(genre) {
  const artwork = $("genreArtwork");
  const files = GENRE_ART[genre];
  if (!artwork || !files || files.length < 2) return;
  activeGenreArtworkIndex = (activeGenreArtworkIndex + 1) % files.length;
  artwork.classList.add("art-crossfade");
  setTimeout(() => {
    artwork.src = `assets/genres/${files[activeGenreArtworkIndex]}`;
    artwork.classList.remove("art-crossfade");
    artwork.classList.add("art-enter");
  }, 260);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function setSelected(file, meta = "Ready to analyze") {
  selectedFile = file;
  selectedName.textContent = file.name;
  selectedMeta.textContent = meta;
  selectedTrack.classList.remove("hidden");
  analyzeButton.disabled = false;
}

function clearSelected() {
  if (recordTimer) {
    clearInterval(recordTimer);
    recordTimer = null;
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  recordSeconds = 0;
  recordTime.textContent = formatTime(0);
  selectedFile = null;
  recordedBlob = null;
  audioInput.value = "";
  selectedTrack.classList.add("hidden");
  analyzeButton.disabled = true;
  fileName.textContent = "MP3 · WAV · FLAC · OGG · M4A · UP TO 5 MIN";
}

modes.forEach((button) => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    modes.forEach((b) => b.classList.toggle("active", b === button));
    uploadPanel.classList.toggle("hidden", currentMode !== "upload");
    recordPanel.classList.toggle("hidden", currentMode !== "record");
  });
});

chooseButton.addEventListener("click", () => audioInput.click());

audioInput.addEventListener("change", () => {
  if (!audioInput.files.length) return;
  const file = audioInput.files[0];
  fileName.textContent = file.name;
  setSelected(file, `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready`);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
  });
});

dropZone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!file.type.startsWith("audio/") && !/\.(mp3|wav|flac|ogg|m4a)$/i.test(file.name)) {
    showToast("Please drop an audio file.");
    return;
  }
  fileName.textContent = file.name;
  setSelected(file, `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready`);
});

clearButton.addEventListener("click", clearSelected);

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function setupLiveBars() {
  if (!analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  const bars = [...liveBars.children];

  function draw() {
    analyser.getByteFrequencyData(data);
    bars.forEach((bar, i) => {
      const index = Math.floor((i / bars.length) * data.length * 0.65);
      const value = data[index] || 0;
      bar.style.height = `${6 + (value / 255) * 32}px`;
    });
    animationFrame = requestAnimationFrame(draw);
  }
  draw();
}

async function startRecording() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeCandidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus"
    ];

    const mimeType = mimeCandidates.find(
      (type) => MediaRecorder.isTypeSupported(type)
    );

    mediaRecorder = new MediaRecorder(
      micStream,
      mimeType ? { mimeType } : undefined
    );

    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      recordedBlob = new Blob(chunks, {
        type: mediaRecorder.mimeType || "audio/webm"
      });

      const extension = recordedBlob.type.includes("ogg") ? "ogg" : "webm";

      selectedFile = new File(
        [recordedBlob],
        `epoch-recording.${extension}`,
        { type: recordedBlob.type }
      );

      setSelected(
        selectedFile,
        `${recordSeconds}s recording · Ready`
      );

      stopMicrophone();
      recordButton.classList.remove("recording");
      recordRing.classList.remove("recording");
      recordButton.innerHTML = '<span class="record-dot"></span> Record again';
    };

    mediaRecorder.start(100);
    recordSeconds = 0;
    recordTime.textContent = formatTime(recordSeconds);
    recordButton.classList.add("recording");
    recordRing.classList.add("recording");
    recordButton.innerHTML = '<span class="record-dot"></span> Stop recording';

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    setupLiveBars();

    recordTimer = setInterval(() => {
      recordSeconds += 1;
      recordTime.textContent = formatTime(recordSeconds);
      if (recordSeconds >= MAX_RECORDING_TIME) stopRecording();
    }, 1000);

  } catch (error) {
    console.error(error);
    showToast("Microphone access was blocked or unavailable.");
  }
}

function stopRecording() {
  if (recordTimer) {
    clearInterval(recordTimer);
    recordTimer = null;
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    stopMicrophone();
    return;
  }

  mediaRecorder.stop();
}

function stopMicrophone() {
  if (micStream) micStream.getTracks().forEach((track) => track.stop());
  if (audioContext) audioContext.close().catch(() => {});
  micStream = null;
  analyser = null;
  liveBars.querySelectorAll("i").forEach((bar) => {
    bar.style.height = "7px";
  });
}

recordButton.addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    stopRecording();
  } else {
    startRecording();
  }
});

if (navAnalyze) {
  navAnalyze.addEventListener("click", (event) => {
    event.preventDefault();
    const target = !results.classList.contains("hidden") ? results : analyzerCard;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

analyzeButton.addEventListener("click", analyzeSong);

async function analyzeSong() {
  if (!selectedFile) return;

  analyzerCard.classList.add("hidden");
  loading.classList.remove("hidden");
  results.classList.add("hidden");

  // Move the user into the analysis experience immediately. Do not make
  // them manually scroll after pressing Analyze Song.
  requestAnimationFrame(() => {
    loading.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const formData = new FormData();
  const isRecording = selectedFile.name.startsWith("epoch-recording");

  if (isRecording) {
    formData.append("file", recordedBlob, selectedFile.name);
  } else {
    formData.append("file", selectedFile);
  }

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Audio analysis failed.");
    }

    renderResults(data);
  } catch (error) {
    console.error(error);
    loading.classList.add("hidden");
    analyzerCard.classList.remove("hidden");
    showToast(error.message || "Could not analyze the audio.");
  }
}

function renderResults(data) {
  loading.classList.add("hidden");
  results.classList.remove("hidden");

  window.__epochSongDNA = {
    genre: data.genre,
    confidence: data.confidence,
    bpm: data.bpm,
    energy: data.energy,
    duration: data.duration ?? data.duration_seconds,
    genre_probabilities: data.genre_probabilities
  };

  $("resultFilename").textContent = data.filename;
  $("genre").textContent = data.genre;
  $("confidence").textContent = `${Number(data.confidence).toFixed(2)}%`;
  $("confidenceBar").style.width = "0%";
  setGenreArtwork(data.genre);
  setTimeout(() => {
    $("confidenceBar").style.width = `${Math.min(Number(data.confidence), 100)}%`;
  }, 220);
  $("bpm").textContent = Number(data.bpm).toFixed(1);
  $("energy").textContent = Number(data.energy).toFixed(4);
  const duration = Number(data.duration ?? data.duration_seconds);
  const segments = Number(data.segments_analyzed || 1);

  $("duration").textContent = duration.toFixed(1);
  $("waveformDuration").textContent = `${duration.toFixed(1)} SEC`;
  $("spectrogramDuration").textContent = `${duration.toFixed(1)} SEC`;
  $("segmentsAnalyzed").textContent = segments === 1
    ? "Single audio window analyzed"
    : `${segments} audio windows analyzed`;

  renderProbabilities(data.genre_probabilities);
  drawWaveform(data.waveform);

  $("spectrogram").src =
    `data:image/png;base64,${data.mel_spectrogram}`;

  results.classList.remove("results-live");
  void results.offsetWidth;
  results.classList.add("results-live");
  results.scrollIntoView({ behavior: "smooth", block: "start" });

  setTimeout(() => cycleGenreArtwork(data.genre), 4200);
  setTimeout(() => cycleGenreArtwork(data.genre), 8400);
}

function renderProbabilities(data) {
  const container = $("probabilities");
  container.innerHTML = "";

  Object.entries(data).forEach(([name, value]) => {
    const row = document.createElement("div");
    row.className = "probability-row";
    row.dataset.genre = name;
    row.style.setProperty("--delay", `${Math.min(container.children.length, 7) * 80}ms`);
    row.innerHTML = `
      <div class="probability-head">
        <span>${name}</span>
        <span>${Number(value).toFixed(2)}%</span>
      </div>
      <div class="progress">
        <div class="progress-fill" style="width:${Math.min(Number(value), 100)}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function drawWaveform(values) {
  const canvas = $("waveformCanvas");
  if (!canvas || !Array.isArray(values) || !values.length) return;

  window.__lastWaveform = values;
  if (waveformAnimationFrame) cancelAnimationFrame(waveformAnimationFrame);

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const mid = height / 2;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const step = Math.max(1, Math.floor(values.length / width));
  const draw = (timestamp) => {
    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, 0);
    bg.addColorStop(0, "rgba(124,58,237,.02)");
    bg.addColorStop(.5, "rgba(196,181,253,.045)");
    bg.addColorStop(1, "rgba(232,121,249,.02)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#7c3aed");
    gradient.addColorStop(.48, "#c4b5fd");
    gradient.addColorStop(1, "#e879f9");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.7;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(167,139,250,.28)";
    ctx.beginPath();

    for (let x = 0; x < width; x += 1) {
      const index = Math.min(values.length - 1, Math.floor(x * step));
      const y = mid - (values[index] || 0) * (height * 0.42);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    const progress = ((timestamp || 0) % 9000) / 9000;
    const scanX = progress * width;
    const scan = ctx.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
    scan.addColorStop(0, "rgba(196,181,253,0)");
    scan.addColorStop(.5, "rgba(232,121,249,.38)");
    scan.addColorStop(1, "rgba(196,181,253,0)");
    ctx.fillStyle = scan;
    ctx.fillRect(scanX - 40, 0, 80, height);

    ctx.strokeStyle = "rgba(238,232,255,.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scanX, 0);
    ctx.lineTo(scanX, height);
    ctx.stroke();

    waveformAnimationFrame = requestAnimationFrame(draw);
  };

  waveformAnimationFrame = requestAnimationFrame(draw);
}


newAnalysisButton.addEventListener("click", () => {
  clearSelected();
  loading.classList.add("hidden");
  results.classList.add("hidden");
  analyzerCard.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("resize", () => {
  if (!$("results").classList.contains("hidden")) {
    const values = window.__lastWaveform;
    if (values) drawWaveform(values);
  }
});

const originalDrawWaveform = drawWaveform;
window.drawWaveform = (values) => {
  window.__lastWaveform = values;
  originalDrawWaveform(values);
};

const metricModal = $("metricModal");
const metricModalClose = $("metricModalClose");
const metricModalIcon = $("metricModalIcon");
const metricModalTitle = $("metricModalTitle");
const metricModalValue = $("metricModalValue");
const metricModalUnit = $("metricModalUnit");
const metricModalWhat = $("metricModalWhat");
const metricModalMeaning = $("metricModalMeaning");
const metricModalNote = $("metricModalNote");

const ENERGY_REFERENCE = {
  p25: 0.10737,
  p50: 0.16987,
  p75: 0.24047
};

function explainTempo(bpm) {
  if (bpm < 60) {
    return "The underlying beat is quite slow, giving the track a relatively unhurried rhythmic pace.";
  }
  if (bpm < 80) {
    return "The underlying beat moves at a relatively unhurried pace, toward the slower side of the tempo range.";
  }
  if (bpm < 110) {
    return "The track has a moderate beat rate, around the middle of the tempo range rather than especially slow or fast.";
  }
  if (bpm < 140) {
    return "The track has a relatively quick beat rate, a range common across many upbeat musical styles.";
  }
  return "The underlying beat moves quite quickly, toward the faster end of the tempo range.";
}

function explainEnergy(energy) {
  let level;
  let comparison;

  if (energy < ENERGY_REFERENCE.p25) {
    level = "Relatively low";
    comparison = `This RMS value falls below the 25th percentile (${ENERGY_REFERENCE.p25.toFixed(5)}) among FMA reference tracks.`;
  } else if (energy < ENERGY_REFERENCE.p50) {
    level = "Moderate-low";
    comparison = `This RMS value falls between the 25th percentile (${ENERGY_REFERENCE.p25.toFixed(5)}) and median (${ENERGY_REFERENCE.p50.toFixed(5)}) among FMA reference tracks.`;
  } else if (energy <= ENERGY_REFERENCE.p75) {
    level = "Moderate";
    comparison = `This RMS value falls between the median (${ENERGY_REFERENCE.p50.toFixed(5)}) and 75th percentile (${ENERGY_REFERENCE.p75.toFixed(5)}) among FMA reference tracks.`;
  } else {
    level = "Relatively high";
    comparison = `This RMS value is above the 75th percentile (${ENERGY_REFERENCE.p75.toFixed(5)}) among FMA reference tracks.`;
  }

  return {
    level,
    description: comparison
  };
}

function explainDuration(duration) {
  const roundedSeconds = Math.round(Number(duration));
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  let readableDuration;

  if (minutes > 0) {
    readableDuration = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    if (remainingSeconds > 0) {
      readableDuration += ` ${remainingSeconds} seconds`;
    }
  } else {
    readableDuration = `${Number(duration).toFixed(1)} seconds`;
  }

  return `Epochs analyzed ${readableDuration} of this recording. For longer audio, the track is divided into 30-second sections, each processed by the same model used during training.`;
}

let activeMetricCard = null;

function openMetricModal(type, card) {
  const values = {
    tempo: {
      value: Number.parseFloat($("bpm").textContent),
      icon: "♩",
      title: "Tempo",
      unit: "BPM",
      what: "Tempo describes how quickly the beat moves. BPM means beats per minute.",
      note: "Tempo alone does not determine whether a song feels happy, sad, mellow, or energetic."
    },
    energy: {
      value: Number.parseFloat($("energy").textContent),
      icon: "◉",
      title: "Audio Energy",
      unit: "",
      what: "Epochs measures RMS energy, a standard estimate of the average strength of an audio signal.",
      note: `Compared with ${ENERGY_REFERENCE.p25.toFixed(5)} (25th), ${ENERGY_REFERENCE.p50.toFixed(5)} (median), and ${ENERGY_REFERENCE.p75.toFixed(5)} (75th percentile) from 7,997 FMA tracks. This describes signal strength, not emotional energy.`
    },
    duration: {
      value: Number.parseFloat($("duration").textContent),
      icon: "◷",
      title: "Duration",
      unit: "SEC",
      what: "Duration is the amount of audio Epochs analyzed from your recording or uploaded song.",
      note: "Window-level predictions are combined by averaging probabilities into one song-level profile."
    }
  }[type];

  if (!metricModal || !values || !Number.isFinite(values.value)) return;

  let meaning;
  if (type === "tempo") {
    meaning = explainTempo(values.value);
  } else if (type === "energy") {
    const result = explainEnergy(values.value);
    meaning = `${result.level} measured intensity. ${result.description}`;
  } else {
    meaning = explainDuration(values.value);
  }

  activeMetricCard = card;
  metricModalIcon.textContent = values.icon;
  metricModalTitle.textContent = values.title;
  metricModalValue.textContent = type === "energy" ? values.value.toFixed(4) : values.value.toFixed(1);
  metricModalUnit.textContent = values.unit;
  metricModalWhat.textContent = values.what;
  metricModalMeaning.textContent = meaning;
  metricModalNote.textContent = values.note;
  metricModal.classList.add("active");
  metricModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  metricModalClose.focus();
}

function closeMetricModal() {
  if (!metricModal?.classList.contains("active")) return;

  metricModal.classList.remove("active");
  metricModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  activeMetricCard?.focus();
  activeMetricCard = null;
}

document.querySelectorAll(".info-card").forEach((card) => {
  card.addEventListener("click", () => openMetricModal(card.dataset.info, card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMetricModal(card.dataset.info, card);
    }
  });
});

metricModalClose?.addEventListener("click", closeMetricModal);
$("metricModalBackdrop")?.addEventListener("click", closeMetricModal);

metricModal?.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    metricModalClose.focus();
  }
});

initGrainWave();
initAtmosphere();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMetricModal();
  }
});
