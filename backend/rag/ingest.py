import os
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core import (
    SimpleDirectoryReader,
    StorageContext,
    VectorStoreIndex,
)

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT.parent.parent / ".env")
KB_DIR = ROOT / "knowledge_base"
STORAGE_DIR = ROOT / "storage"

EMBED_MODEL = os.getenv("EPOCHS_EMBED_MODEL", "granite-embedding:30m")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")


def build_index():
    documents = SimpleDirectoryReader(
        input_dir=str(KB_DIR),
        required_exts=[".md"],
        recursive=True,
    ).load_data()

    from llama_index.embeddings.ollama import OllamaEmbedding

    embed_model = OllamaEmbedding(
        model_name=EMBED_MODEL,
        base_url=OLLAMA_BASE_URL,
    )

    index = VectorStoreIndex.from_documents(
        documents,
        embed_model=embed_model,
        show_progress=True,
    )

    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    index.storage_context.persist(persist_dir=str(STORAGE_DIR))

    print(f"Built Epochs RAG index from {len(documents)} documents.")
    print(f"Stored at: {STORAGE_DIR}")


if __name__ == "__main__":
    build_index()
