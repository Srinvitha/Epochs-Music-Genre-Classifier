import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from llama_index.core import (
    Settings,
    StorageContext,
    load_index_from_storage,
)

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT.parent.parent / ".env")
STORAGE_DIR = ROOT / "storage"
EMBED_MODEL = os.getenv("EPOCHS_EMBED_MODEL", "granite-embedding:30m")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

_index = None


def _get_index():
    global _index

    if _index is not None:
        return _index

    if not STORAGE_DIR.exists():
        raise RuntimeError(
            "Epochs RAG index is missing. Run: "
            "python -m backend.rag.ingest"
        )

    from llama_index.embeddings.ollama import OllamaEmbedding

    Settings.embed_model = OllamaEmbedding(
        model_name=EMBED_MODEL,
        base_url=OLLAMA_BASE_URL,
    )

    storage_context = StorageContext.from_defaults(
        persist_dir=str(STORAGE_DIR)
    )
    _index = load_index_from_storage(storage_context)

    return _index


def _song_context(song_dna: dict[str, Any]) -> str:
    if not song_dna:
        return "No current Song DNA is available."

    lines = ["CURRENT EPOCHS SONG DNA:"]
    for key, value in song_dna.items():
        if key == "genre_probabilities" and isinstance(value, dict):
            probs = ", ".join(
                f"{k}: {v}%" for k, v in value.items()
            )
            lines.append(f"- Genre probabilities: {probs}")
        else:
            lines.append(f"- {key}: {value}")

    return "\n".join(lines)


def _get_llm():
    provider = os.getenv("EPOCHS_LLM_PROVIDER", "ollama").lower()

    if provider == "ollama":
        from llama_index.llms.ollama import Ollama

        model = os.getenv("OLLAMA_MODEL", "granite4:micro")
        return Ollama(
            model=model,
            base_url=OLLAMA_BASE_URL,
            request_timeout=120.0,
        )

    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "Set OPENAI_API_KEY or use EPOCHS_LLM_PROVIDER=ollama."
        )

    from llama_index.llms.openai import OpenAI

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    return OpenAI(model=model, temperature=0.2)


def ask_epoch(question: str, song_dna: dict[str, Any] | None = None) -> dict:
    index = _get_index()
    retriever = index.as_retriever(similarity_top_k=4)

    query = (
        f"Question: {question}\n\n"
        f"{_song_context(song_dna or {})}"
    )

    nodes = retriever.retrieve(query)

    context_blocks = []
    sources = []

    for node in nodes:
        text = node.get_content()
        metadata = node.metadata or {}
        source = metadata.get("file_name") or metadata.get("file_path") or "Epochs knowledge base"
        context_blocks.append(text)
        if source not in sources:
            sources.append(source)

    context = "\n\n--- RETRIEVED SOURCE ---\n\n".join(context_blocks)

    system_prompt = """You are Epochs' grounded music-analysis assistant.

Answer using the retrieved Epochs knowledge and the current Song DNA.
Never invent measurements or claim that BPM/energy alone determines genre.
Clearly distinguish:
- ML classification
- signal-analysis measurements
- retrieved music knowledge

The current Song DNA contains aggregate BPM, RMS energy, duration, and genre
probabilities, but no per-feature contribution scores or direct audio
description. Do not claim that a measurement caused the classification, or
that the audio contains particular instruments, vocals, or production traits.
Documented feature groups are model inputs, not evidence of which features
caused an individual result. Never claim that a combination or interaction of
features caused a prediction. When asked why a genre was selected, explicitly
state that the API does not expose per-feature contributions, so the exact
reason for this individual prediction is unavailable. Then summarize the
reported genre probabilities and, if useful, list documented feature groups
without attributing the result to them. Do not describe confidence as certainty.

If the retrieved context does not support a claim, say that the available
Epochs knowledge base does not establish it.

Keep answers concise, technical, and suitable for a college project demo.
"""

    prompt = (
        f"{system_prompt}\n\n"
        f"RETRIEVED CONTEXT:\n{context}\n\n"
        f"{_song_context(song_dna or {})}\n\n"
        f"USER QUESTION:\n{question}"
    )

    llm = _get_llm()
    response = llm.complete(prompt)

    return {
        "answer": str(response),
        "sources": sources,
        "retrieved_chunks": len(nodes),
    }
