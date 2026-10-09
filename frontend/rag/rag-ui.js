const EPOCHS_RAG_API = "http://127.0.0.1:8000";

function getCurrentSongDNA() {
  return window.__epochSongDNA || {};
}

function renderRagMarkdown(markdown) {
  const source = String(markdown || "")
    .replace(/\r\n?/g, "\n")
    // Repair escaped Markdown heading prefixes: \#### Title
    .replace(/^(\s*)\\+\s*(?=#{1,6}\s)/gm, "$1");

  const inlineFormat = (text) => {
    // Escape all untrusted text before generating HTML.
    let result = escapeHtml(text);

    // Preserve inline code so its contents aren't formatted as Markdown.
    const codeParts = [];
    result = result.replace(/`([^`]+)`/g, (_, code) => {
      const index = codeParts.push(`<code>${code}</code>`) - 1;
      return `\u0000CODE${index}\u0000`;
    });

    result = result
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1<em>$2</em>");

    return result.replace(
      /\u0000CODE(\d+)\u0000/g,
      (_, index) => codeParts[Number(index)] || ""
    );
  };

  const lines = source.split("\n");
  // Remove blank lines between consecutive Markdown list items.
  for (let i = lines.length - 2; i >= 0; i--) {
    if (
      lines[i].trim() === "" &&
      (
        /^\s*[-*+]\s+/.test(lines[i + 1]) ||
        /^\s*\d+[.)]\s+/.test(lines[i + 1])
      )
    ) {
      lines.splice(i, 1);
    }
  }

  const html = [];
  let listType = null;
  let inCodeBlock = false;
  let codeLines = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const closeCodeBlock = () => {
    html.push(
      `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
    );
    codeLines = [];
    inCodeBlock = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Fenced code blocks
    if (/^```/.test(line) || /^~~~/.test(line)) {
      const fence = line.slice(0, 3);

      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeLines = [];
      } else {
        closeCodeBlock();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line) {
      closeList();
      continue;
    }

    // ATX headings: # through ######
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    const quote = line.match(/^>\s?(.*)$/);
    const rule = /^(?:-{3,}|\*{3,}|_{3,})$/.test(line);

    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`);
    } else if (rule) {
      closeList();
      html.push("<hr>");
    } else if (quote) {
      closeList();
      html.push(`<blockquote><p>${inlineFormat(quote[1])}</p></blockquote>`);
    } else if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";

      if (listType !== type) {
        closeList();
        html.push(`<${type}>`);
        listType = type;
      }

      html.push(`<li>${inlineFormat((bullet || numbered)[1])}</li>`);
    } else {
      closeList();
      html.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  if (inCodeBlock) closeCodeBlock();
  closeList();

  return html.join("\n");
}

async function askEpochs(question) {
  const answer = document.getElementById("ragAnswer");
  const sources = document.getElementById("ragSources");
  const button = document.getElementById("ragAskButton");
  const questionChips = document.querySelectorAll("[data-rag-question]");

  if (!answer || !sources || !button) return;

  const trimmed = String(question || "").trim();
  if (!trimmed) return;

  button.disabled = true;
  button.innerHTML = '<span class="rag-send-label">Thinking</span><span class="rag-send-icon" aria-hidden="true">…</span>';
  answer.classList.remove("hidden", "is-error", "is-ready");
  answer.classList.add("is-loading");
  answer.setAttribute("aria-busy", "true");
  answer.textContent = "Retrieving relevant Epochs knowledge…";
  sources.classList.add("hidden");
  questionChips.forEach(chip => {
    chip.classList.toggle("is-active", chip.dataset.ragQuestion === trimmed);
  });

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

    answer.classList.remove("is-loading", "is-error");
    answer.classList.add("is-ready");
    answer.setAttribute("aria-busy", "false");
    answer.innerHTML = renderRagMarkdown(
      data.answer || "No answer returned."
    );

    if (Array.isArray(data.sources) && data.sources.length) {
      sources.innerHTML =
        "<strong>RETRIEVED SOURCES</strong>" +
        data.sources.map(source => `<span>${escapeHtml(source)}</span>`).join("");
      sources.classList.remove("hidden");
    }
  } catch (error) {
    answer.classList.remove("is-loading", "is-ready");
    answer.classList.add("is-error");
    answer.setAttribute("aria-busy", "false");
    answer.textContent =
      error.message ||
      "Epochs could not retrieve the requested knowledge.";
  } finally {
    button.disabled = false;
    button.innerHTML = '<span class="rag-send-label">Ask Epochs</span><span class="rag-send-icon" aria-hidden="true">↗</span>';
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
      if (event.key === "Enter") {
        event.preventDefault();
        if (!button?.disabled) askEpochs(input.value);
      }
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
