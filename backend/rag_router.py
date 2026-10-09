import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .rag.service import ask_epoch

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rag", tags=["RAG"])


class RAGRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    song_dna: dict[str, Any] = Field(default_factory=dict)


@router.post("/ask")
def rag_ask(request: RAGRequest):
    try:
        return ask_epoch(
            question=request.question,
            song_dna=request.song_dna,
        )
    except RuntimeError as exc:
        logger.exception("Epochs RAG runtime failure")
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Epochs RAG request failed")
        raise HTTPException(
            status_code=500,
            detail=f"Epochs RAG failed: {exc}",
        ) from exc
