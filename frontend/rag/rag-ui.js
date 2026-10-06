const EPOCHS_RAG_API = "http://127.0.0.1:8000";

function getCurrentSongDNA() {
  return window.__epochSongDNA || {};
}

async function askEpochs(question) {
  const answer = document.getElementById("ragAnswer");
  const sources = document.getElementById("ragSources");
  const button = document.getElementById("ragAskButton");

  if (!answer || !sources || !button) return;

  const trimmed = String(question || "").trim();
  if (!trimmed) return;

  button.disabled = true;
  button.innerHTML = "Thinking…";
  answer.classList.remove("hidden");
  sources.classList.add("hidden");
  answer.textContent = "Retrieving relevant Epochs knowledge…";

  try {
    const response = await fetch(`${EPOCHS_RAG_API}/rag/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: trimmed,
        song_dna: getCurrentSongDNA()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "RAG request failed.");
    }

    answer.textContent = data.answer || "No answer returned.";

    if (Array.isArray(data.sources) && data.sources.length) {
      sources.innerHTML =
        "<strong>Retrieved knowledge:</strong> " +
        data.sources.map(source => `<span>${escapeHtml(source)}</span>`).join("");
      sources.classList.remove("hidden");
    }
  } catch (error) {
    answer.textContent =
      error.message ||
      "Epochs could not retrieve the requested knowledge.";
  } finally {
    button.disabled = false;
    button.innerHTML = 'Ask Epochs <span>→</span>';
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("ragQuestion");
  const button = document.getElementById("ragAskButton");

  if (button) {
    button.addEventListener("click", () => askEpochs(input?.value));
  }

  if (input) {
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") askEpochs(input.value);
    });
  }

  document.querySelectorAll("[data-rag-question]").forEach(chip => {
    chip.addEventListener("click", () => {
      const question = chip.dataset.ragQuestion || "";
      if (input) input.value = question;
      askEpochs(question);
    });
  });
});
