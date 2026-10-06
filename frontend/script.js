const API_URL = "http://127.0.0.1:8000";
const MAX_RECORDING_TIME = 90;

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

analyzeButton.addEventListener("click", analyzeSong);

async function analyzeSong() {
  if (!selectedFile) return;

  analyzerCard.classList.add("hidden");
  loading.classList.remove("hidden");
  results.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

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
  $("confidenceBar").style.width = `${Math.min(Number(data.confidence), 100)}%`;
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

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderProbabilities(data) {
  const container = $("probabilities");
  container.innerHTML = "";

  Object.entries(data).forEach(([name, value]) => {
    const row = document.createElement("div");
    row.className = "probability-row";
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
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const mid = height / 2;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#7c3aed");
  gradient.addColorStop(0.5, "#c4b5fd");
  gradient.addColorStop(1, "#e879f9");

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.4;
  ctx.beginPath();

  const step = Math.max(1, Math.floor(values.length / Math.max(1, width)));

  for (let x = 0; x < width; x++) {
    const index = Math.min(values.length - 1, Math.floor(x * step));
    const y = mid - (values[index] || 0) * (height * 0.42);

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#a78bfa";
  ctx.beginPath();

  for (let x = 0; x < width; x++) {
    const index = Math.min(values.length - 1, Math.floor(x * step));
    const y = mid + (values[index] || 0) * (height * 0.42);

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#ffffff10";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(width, mid);
  ctx.stroke();
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMetricModal();
  }
});
